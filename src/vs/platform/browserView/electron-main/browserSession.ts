/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { app, session } from 'electron';
import { joinPath } from '../../../base/common/resources.js';
import { URI } from '../../../base/common/uri.js';
import { IApplicationStorageMainService } from '../../storage/electron-main/storageMainService.js';
import { BrowserViewStorageScope } from '../common/browserView.js';
import { BrowserSessionTrust, IBrowserSessionTrust } from './browserSessionTrust.js';
import { FileAccess } from '../../../base/common/network.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { extname, join } from '../../../base/common/path.js';

/** POLLIS: a PDF downloaded by a page of a browser view, saved in a temporary folder that is emptied on quit. */
export interface IBrowserPdfDownload {
	readonly contents: Electron.WebContents;
	readonly file: URI;
	readonly url: string;
	readonly completed: boolean;
}

// Same as webviews, minus clipboard-read
const allowedPermissions = new Set([
	'pointerLock',
	'notifications',
	'clipboard-sanitized-write'
]);

/**
 * Holds an Electron session along with its storage scope and unique browser
 * context identifier.  Each instance maps one-to-one to an Electron
 * {@link Electron.Session} -- the {@link id} is derived from what makes the
 * Electron session unique (scope + workspace), **not** from any view id.
 * Multiple browser views may reference the same `BrowserSession`.
 *
 * The class centralises the permission configuration.  The {@link id}
 * doubles as the CDP `browserContextId`.
 *
 * This class uses a private constructor with static factory methods
 * ({@link getOrCreate}, {@link getOrCreateGlobal}, etc.) and maintains
 * an internal registry of live sessions. Use the static methods to
 * obtain instances.
 */
export class BrowserSession {

	// #region Static registry

	/**
	 * Primary store — keyed by Electron session so entries are
	 * automatically removed when the Electron session is GC'd.
	 *
	 * The goal is to ensure that BrowserSessions have the exact same lifespan as their Electron sessions.
	 */
	private static readonly _bySession = new WeakMap<Electron.Session, BrowserSession>();

	/**
	 * String-keyed lookup for {@link get} and {@link getBrowserContextIds}.
	 * Values are weak references so they don't prevent GC of the
	 * {@link BrowserSession} (and transitively the Electron session).
	 *
	 * ID derivation rules (one-to-one with Electron sessions):
	 *  - Global scope         -> `"global"`
	 *  - Workspace scope      -> `"workspace:${workspaceId}"`
	 *  - Ephemeral scope      -> `"ephemeral:${viewId}"` or `"${type}:${viewId}"` for custom types
	 */
	private static readonly _byId = new Map<string, WeakRef<BrowserSession>>();

	/**
	 * Cleans up stale {@link _byId} entries when the Electron session
	 * they point to is garbage-collected.
	 */
	private static readonly _finalizer = new FinalizationRegistry<string>((id) => {
		BrowserSession._byId.delete(id);
	});

	/**
	 * Weak set mirroring the Electron sessions owned by any BrowserSession.
	 * Useful for quickly checking whether a given {@link Electron.WebContents}
	 * belongs to the integrated browser.
	 */
	static readonly knownSessions = new WeakSet<Electron.Session>();

	/**
	 * Check if a {@link Electron.WebContents} belongs to an integrated browser
	 * view backed by a BrowserSession.
	 */
	static isBrowserViewWebContents(contents: Electron.WebContents): boolean {
		return BrowserSession.knownSessions.has(contents.session);
	}

	/**
	 * Return an existing session for the given id, or `undefined`.
	 */
	static get(id: string): BrowserSession | undefined {
		const ref = BrowserSession._byId.get(id);
		if (!ref) {
			return undefined;
		}
		const bs = ref.deref();
		if (!bs) {
			BrowserSession._byId.delete(id);
		}
		return bs;
	}

	/**
	 * Return all live browser context IDs (i.e. all session {@link id}s).
	 */
	static getBrowserContextIds(): string[] {
		const ids: string[] = [];
		for (const [id, ref] of BrowserSession._byId) {
			if (ref.deref()) {
				ids.push(id);
			} else {
				BrowserSession._byId.delete(id);
			}
		}
		return ids;
	}

	/**
	 * Get or create the singleton global-scope session.
	 */
	static getOrCreateGlobal(): BrowserSession {
		const electronSession = session.fromPartition('persist:vscode-browser');
		return BrowserSession._bySession.get(electronSession)
			?? new BrowserSession('global', electronSession, BrowserViewStorageScope.Global);
	}

	/**
	 * Get or create a workspace-scope session for the given workspace.
	 */
	static getOrCreateWorkspace(workspaceId: string, workspaceStorageHome: URI): BrowserSession {
		const storage = joinPath(workspaceStorageHome, workspaceId, 'browserStorage');
		const electronSession = session.fromPath(storage.fsPath);
		return BrowserSession._bySession.get(electronSession)
			?? new BrowserSession(`workspace:${workspaceId}`, electronSession, BrowserViewStorageScope.Workspace);
	}

	/**
	 * Get or create an ephemeral session for the given view / target id.
	 */
	static getOrCreateEphemeral(viewId: string, type?: string): BrowserSession {
		if (type === 'workspace' || type === 'ephemeral') {
			throw new Error(`Cannot create session with reserved type '${type}'`);
		}

		const sessionId = `${type ?? 'ephemeral'}:${viewId}`;
		const electronSession = session.fromPartition(`vscode-browser-${type}${viewId}`);
		return BrowserSession._bySession.get(electronSession)
			?? new BrowserSession(sessionId, electronSession, BrowserViewStorageScope.Ephemeral);
	}

	/**
	 * Get or create a session for a workbench-originated browser view.
	 * The session id is derived from the *scope* -- not the view id -- so
	 * multiple views that share a scope (e.g. two Global views) get the
	 * same `BrowserSession`.
	 *
	 * @param viewId   Used only for ephemeral sessions where every view
	 *                 needs its own Electron session.
	 * @param scope    Desired storage scope.
	 * @param workspaceStorageHome  Root folder under which per-workspace
	 *                              browser storage is created
	 *                              (`IEnvironmentMainService.workspaceStorageHome`).
	 * @param workspaceId  Only required when `scope` is `workspace`.
	 */
	static getOrCreate(
		viewId: string,
		scope: BrowserViewStorageScope,
		workspaceStorageHome: URI,
		workspaceId?: string,
	): BrowserSession {
		switch (scope) {
			case BrowserViewStorageScope.Global:
				return BrowserSession.getOrCreateGlobal();
			case BrowserViewStorageScope.Workspace:
				if (workspaceId) {
					return BrowserSession.getOrCreateWorkspace(workspaceId, workspaceStorageHome);
				}
			// fallthrough -- no workspace context -> ephemeral
			case BrowserViewStorageScope.Ephemeral:
			default:
				return BrowserSession.getOrCreateEphemeral(viewId);
		}
	}

	// #endregion

	// #region Instance

	private readonly _trust: BrowserSessionTrust;

	private readonly _onDidDownloadPdf = new Emitter<IBrowserPdfDownload>();
	/** POLLIS: fires when a PDF a page reached is downloaded, for its view to open it in the PDF Viewer. */
	readonly onDidDownloadPdf: Event<IBrowserPdfDownload> = this._onDidDownloadPdf.event;

	private readonly _pdfHandOffs = new WeakSet<Electron.WebContents>();

	private constructor(
		/**
		 * Unique identifier for this session.  Derived from what makes the
		 * underlying Electron session unique (scope key, workspace id, view
		 * id, or context uuid) -- NOT from any particular view id.
		 */
		readonly id: string,
		/** The underlying Electron session. */
		readonly electronSession: Electron.Session,
		/** Resolved storage scope. */
		readonly storageScope: BrowserViewStorageScope,
	) {
		this._trust = new BrowserSessionTrust(this);
		this.configure();
		BrowserSession.knownSessions.add(electronSession);
		BrowserSession._bySession.set(electronSession, this);
		BrowserSession._byId.set(id, new WeakRef(this));
		BrowserSession._finalizer.register(electronSession, id);
	}

	/** Public trust interface for consumers that need cert operations. */
	get trust(): IBrowserSessionTrust {
		return this._trust;
	}

	/**
	 * Connect application storage to this session so that preferences
	 * (trusted certificates, permissions, etc.) are persisted across
	 * restarts. Restores any previously-saved data on first call;
	 * subsequent calls are no-ops.
	 */
	connectStorage(storage: IApplicationStorageMainService): void {
		this._trust.connectStorage(storage);
	}

	/**
	 * Apply the permission policy and preload scripts to the session.
	 */
	private configure(): void {
		this.electronSession.setPermissionRequestHandler((_webContents, permission, callback) => {
			return callback(allowedPermissions.has(permission));
		});
		this.electronSession.setPermissionCheckHandler((_webContents, permission, _origin) => {
			return allowedPermissions.has(permission);
		});
		this.electronSession.registerPreloadScript({
			type: 'frame',
			filePath: FileAccess.asFileUri('vs/platform/browserView/electron-browser/preload-browserView.js').fsPath
		});

		// POLLIS: the views do not show PDFs (Chromium's PDF viewer needs plugins, which are off). A page that is a PDF
		// comes as a download instead, with the session's cookies, and the view stays on the page it was on
		this.electronSession.webRequest.onHeadersReceived((details, callback) => callback(this.pdfAsDownload(details)));
		this.electronSession.on('will-download', (_event, item, contents) => {
			if (!isPdfDownload(item)) {
				return;
			}
			const file = pdfSavePath(item.getFilename());
			item.setSavePath(file);
			item.once('done', (_doneEvent, state) => this._onDidDownloadPdf.fire({ contents, file: URI.file(file), url: item.getURL(), completed: state === 'completed' }));
		});
	}

	/** POLLIS: the response of a page that is a PDF, made an attachment, so that it downloads. */
	private pdfAsDownload(details: Electron.OnHeadersReceivedListenerDetails): Electron.HeadersReceivedResponse {
		if (details.resourceType !== 'mainFrame' || !details.webContents || details.statusCode >= 300) {
			return {};
		}
		const headers: Record<string, string[]> = {};
		let type = '';
		let disposition = '';
		for (const [name, values] of Object.entries(details.responseHeaders ?? {})) {
			const key = name.toLowerCase();
			if (key === 'content-type') {
				type = values[0] ?? '';
			}
			if (key === 'content-disposition') {
				disposition = values[0] ?? '';
			} else {
				headers[name] = values;
			}
		}
		if (!/^\s*application\/(x-)?pdf\b/i.test(type)) {
			return {};
		}
		this._pdfHandOffs.add(details.webContents);
		headers['Content-Disposition'] = [attachmentDisposition(disposition)];
		return { responseHeaders: headers };
	}

	/**
	 * POLLIS: whether a page of the web contents was a PDF, made a download, since this was last asked; its load then
	 * fails in the view.
	 */
	takePdfHandOff(contents: Electron.WebContents): boolean {
		return this._pdfHandOffs.delete(contents);
	}

	/**
	 * Clear all session data including trust state and all browsing data.
	 */
	async clearData(): Promise<void> {
		await this._trust.clear();
		await this.electronSession.clearData();
	}

	// #endregion
}

/** POLLIS: a Content-Disposition that downloads, keeping the file name the server gives. */
function attachmentDisposition(disposition: string): string {
	if (/^\s*attachment\b/i.test(disposition)) {
		return disposition;
	}
	if (/^\s*inline\b/i.test(disposition)) {
		return disposition.replace(/^\s*inline\b/i, 'attachment');
	}
	return disposition.trim() ? `attachment; ${disposition}` : 'attachment';
}

/** POLLIS: whether a download is a PDF, by its type or by the extension of its name. */
function isPdfDownload(item: Electron.DownloadItem): boolean {
	return /^application\/(x-)?pdf$/i.test(item.getMimeType()) || extname(item.getFilename()).toLowerCase() === '.pdf';
}

let pdfFolder: string | undefined;

/**
 * POLLIS: the folder of the PDFs the browser views download, made on the first one: a folder of this run of the app in
 * the system's temporary folder, removed when the app quits.
 */
function getPdfFolder(): string {
	if (!pdfFolder) {
		const folder = join(app.getPath('temp'), `pollis-pdfs-${process.pid}`);
		mkdirSync(folder, { recursive: true });
		app.once('will-quit', () => rmSync(folder, { recursive: true, force: true }));
		pdfFolder = folder;
	}
	return pdfFolder;
}

/** POLLIS: where a downloaded PDF is saved, in the folder of the PDFs, with a number added to its name when it is taken. */
function pdfSavePath(filename: string): string {
	const folder = getPdfFolder();
	const name = extname(filename).toLowerCase() === '.pdf' ? filename : `${filename}.pdf`;
	const stem = name.slice(0, -extname(name).length);
	let file = join(folder, name);
	for (let n = 2; existsSync(file); n++) {
		file = join(folder, `${stem} (${n}).pdf`);
	}
	return file;
}
