/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../../base/common/buffer.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { Disposable, IDisposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { AppResourcePath, FileAccess } from '../../../../../base/common/network.js';
import { URI } from '../../../../../base/common/uri.js';
import { createFileSystemProviderError, FileChangeType, FileSystemProviderCapabilities, FileSystemProviderErrorCode, FileType, IFileChange, IFileDeleteOptions, IFileOverwriteOptions, IFileService, IFileSystemProviderWithFileReadWriteCapability, IFileWriteOptions, IStat, IWatchOptions } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';

/** A kind of bundled learning material the user can customise. */
export type CustomCopyKind = 'wiki' | 'notebook';

interface ICustomCopyKindInfo {
	/** Scheme under which the material is opened, so a customised copy can overlay the original. */
	readonly scheme: string;
	/** Folder of the originals, relative to the app root. */
	readonly bundledBase: string;
	/** Folder of the customised copies, under `~/.pollis/`. */
	readonly customFolder: string;
}

export const CUSTOM_COPY_KINDS: { readonly [kind in CustomCopyKind]: ICustomCopyKindInfo } = {
	wiki: { scheme: 'pollis-wiki', bundledBase: 'vs/workbench/contrib/model/browser/media/wiki/', customFolder: 'wikis' },
	notebook: { scheme: 'pollis-notebook', bundledBase: 'vs/workbench/contrib/model/browser/media/notebooks/', customFolder: 'notebooks' },
};

/** Folders of originals shipped outside the app, e.g. by a Pollis toolbox extension, keyed by kind, then by folder name. */
const externalFolders: { readonly [kind in CustomCopyKind]: Map<string, URI> } = { wiki: new Map(), notebook: new Map() };

/**
 * Serves the originals of a folder (e.g. wiki `symb`) from `location` instead of the app's bundled
 * material, so a toolbox extension can ship its panels' wikis and notebooks. Customised copies
 * still live under `~/.pollis/`.
 */
export function registerExternalFolder(kind: CustomCopyKind, folder: string, location: URI): IDisposable {
	const folders = externalFolders[kind];
	folders.set(folder, location);
	return toDisposable(() => {
		if (folders.get(folder) === location) {
			folders.delete(folder);
		}
	});
}

/** The overlay URI of a bundled file, e.g. wiki `dcmp/marginal.md` -> `pollis-wiki:/dcmp/marginal.md`. */
export function customCopyOverlayUri(kind: CustomCopyKind, file: string): URI {
	return URI.from({ scheme: CUSTOM_COPY_KINDS[kind].scheme, path: '/' + file });
}

/** Where the customised copy of a bundled file lives (whether or not it exists yet), e.g. `~/.pollis/wikis/<file>`. */
export async function customCopyUri(pathService: IPathService, kind: CustomCopyKind, file: string): Promise<URI> {
	return URI.joinPath(await pathService.userHome({ preferLocal: true }), '.pollis', CUSTOM_COPY_KINDS[kind].customFolder, file.replace(/^\/+/, ''));
}

/**
 * Serves bundled learning material (Local Wikis, Notebook Tutorials) with the user's customised
 * copies laid over it.
 *
 * A `pollis-wiki:/<folder>/<file>.md` resource reads `~/.pollis/wikis/<folder>/<file>.md` when that
 * file exists and the bundled original otherwise (likewise `pollis-notebook:` and `~/.pollis/notebooks/`).
 * Writing always goes to the copy, so the first save creates it, and deleting removes the copy,
 * which restores the original. The originals are never written to. Because a wiki and the wikis it
 * links to (its `## See Also` section) all live under the same scheme, relative links keep resolving
 * whether or not the target has been customised.
 */
export class CustomCopyFileSystemProvider extends Disposable implements IFileSystemProviderWithFileReadWriteCapability {

	readonly capabilities = FileSystemProviderCapabilities.FileReadWrite | FileSystemProviderCapabilities.PathCaseSensitive;
	readonly onDidChangeCapabilities = Event.None;

	private readonly _onDidChangeFile = this._register(new Emitter<readonly IFileChange[]>());
	readonly onDidChangeFile = this._onDidChangeFile.event;

	constructor(
		private readonly kind: CustomCopyKind,
		private readonly fileService: IFileService,
		private readonly pathService: IPathService,
	) {
		super();
	}

	private customUri(resource: URI): Promise<URI> {
		return customCopyUri(this.pathService, this.kind, resource.path);
	}

	private bundledUri(resource: URI): URI {
		const [folder, ...rest] = resource.path.replace(/^\/+/, '').split('/');
		const external = externalFolders[this.kind].get(folder);
		if (external) {
			return URI.joinPath(external, ...rest);
		}
		return FileAccess.asFileUri((CUSTOM_COPY_KINDS[this.kind].bundledBase + resource.path.replace(/^\/+/, '')) as AppResourcePath);
	}

	/** The copy when it exists, else the bundled original, else `undefined`. */
	private async resolve(resource: URI): Promise<URI | undefined> {
		const custom = await this.customUri(resource);
		if (await this.fileService.exists(custom)) {
			return custom;
		}
		const bundled = this.bundledUri(resource);
		return await this.fileService.exists(bundled) ? bundled : undefined;
	}

	watch(_resource: URI, _opts: IWatchOptions): IDisposable {
		// Changes made through this provider are reported by writeFile / delete.
		return Disposable.None;
	}

	async stat(resource: URI): Promise<IStat> {
		const target = await this.resolve(resource);
		if (!target) {
			throw createFileSystemProviderError(`${resource.path} not found`, FileSystemProviderErrorCode.FileNotFound);
		}
		const stat = await this.fileService.stat(target);
		return { type: stat.isDirectory ? FileType.Directory : FileType.File, ctime: stat.ctime, mtime: stat.mtime, size: stat.size };
	}

	async readdir(resource: URI): Promise<[string, FileType][]> {
		const entries = new Map<string, FileType>();
		for (const folder of [this.bundledUri(resource), await this.customUri(resource)]) {
			if (await this.fileService.exists(folder)) {
				for (const child of (await this.fileService.resolve(folder)).children ?? []) {
					entries.set(child.name, child.isDirectory ? FileType.Directory : FileType.File);
				}
			}
		}
		return [...entries];
	}

	async readFile(resource: URI): Promise<Uint8Array> {
		const target = await this.resolve(resource);
		if (!target) {
			throw createFileSystemProviderError(`${resource.path} not found`, FileSystemProviderErrorCode.FileNotFound);
		}
		return (await this.fileService.readFile(target)).value.buffer;
	}

	async writeFile(resource: URI, content: Uint8Array, _opts: IFileWriteOptions): Promise<void> {
		await this.fileService.writeFile(await this.customUri(resource), VSBuffer.wrap(content));
		this._onDidChangeFile.fire([{ type: FileChangeType.UPDATED, resource }]);
	}

	async delete(resource: URI, _opts: IFileDeleteOptions): Promise<void> {
		const custom = await this.customUri(resource);
		if (await this.fileService.exists(custom)) {
			await this.fileService.del(custom);
		}
		// The resource still exists (the original shows through again), so this is an update, not a deletion.
		this._onDidChangeFile.fire([{ type: FileChangeType.UPDATED, resource }]);
	}

	async mkdir(resource: URI): Promise<void> {
		await this.fileService.createFolder(await this.customUri(resource));
	}

	async rename(_from: URI, _to: URI, _opts: IFileOverwriteOptions): Promise<void> {
		throw createFileSystemProviderError('Bundled learning material cannot be renamed', FileSystemProviderErrorCode.NoPermissions);
	}
}
