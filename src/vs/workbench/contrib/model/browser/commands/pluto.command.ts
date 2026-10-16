/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CommandsRegistry, ICommandService } from '../../../../../platform/commands/common/commands.js';
import { MenuRegistry, MenuId } from '../../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { IEnvironmentService } from '../../../../../platform/environment/common/environment.js';
import { IProgressService, ProgressLocation } from '../../../../../platform/progress/common/progress.js';
import { URI } from '../../../../../base/common/uri.js';
import { VSBuffer } from '../../../../../base/common/buffer.js';
import { generateUuid } from '../../../../../base/common/uuid.js';
import { localize } from '../../../../../nls.js';
import { sendToJuliaRepl } from '../handlers/model.handler.js';

/** Base URL + secret of the Pluto server we started this session (lets repeat clicks reuse it). */
let plutoBase: string | undefined;
let plutoSecret: string | undefined;

/** The open notebooks of the Pluto server, a line each: id, a tab, the notebook's path. */
const NOTEBOOKS_FILE = 'notebooks.tsv';

/** The notebook id of a Pluto page in the internal browser (http://localhost:PORT/edit?id=…), else undefined. */
export function plutoNotebookId(url: string | undefined): string | undefined {
	if (!url) { return undefined; }
	try {
		const parsed = new URL(url);
		const local = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
		return local && parsed.protocol === 'http:' && parsed.pathname === '/edit' ? parsed.searchParams.get('id') ?? undefined : undefined;
	} catch {
		return undefined;
	}
}

/** The file of a Pluto page, from the list the Pluto server Pollis started keeps; undefined for another server's. */
export async function plutoNotebookFile(fileService: IFileService, environmentService: IEnvironmentService, url: string | undefined): Promise<URI | undefined> {
	const id = plutoNotebookId(url);
	if (!id) { return undefined; }
	try {
		const list = (await fileService.readFile(URI.joinPath(environmentService.cacheHome, 'pollis-pluto', NOTEBOOKS_FILE))).value.toString();
		for (const line of list.split('\n')) {
			const tab = line.indexOf('\t');
			if (tab > 0 && line.slice(0, tab) === id) {
				return URI.file(line.slice(tab + 1));
			}
		}
	} catch {
		// no list: Pluto was not started by Pollis, or before this version
	}
	return undefined;
}

/** Wrap the code-box contents in a minimal Pluto notebook: a packages cell, then the code cell. */
function buildPlutoNotebook(code: string): string {
	// Macros in a cell are expanded before the cell runs, so `@formula` in the same cell as
	// `using GLM` is undefined. Hoist the top-level `using`/`import` lines into their own cell.
	const lines = code.split('\n');
	const isImport = (line: string) => /^(using|import)\s/.test(line);
	const imports = lines.filter(isImport);
	const body = lines.filter(line => !isImport(line)).join('\n').trim();
	const cells: string[] = [];
	if (imports.length > 0) {
		cells.push(imports.length === 1 ? imports[0] : `begin\n${imports.join('\n')}\nend`);
	}
	// Pluto allows only one expression per cell, so wrap the (multi-statement) snippet in
	// a `begin … end` block — exactly what Pluto suggests for pasted multi-line code.
	if (body) {
		cells.push(`begin\n${body}\nend`);
	}
	const cellIds = cells.map(() => generateUuid());
	// Pluto's on-disk format: header, then `# ╔═╡ <uuid>` before each cell's source,
	// then a `# ╔═╡ Cell order:` section listing cells (╠═ = visible code cell).
	return `### A Pluto.jl notebook ###
# v0.20.4

using Markdown
using InteractiveUtils

${cells.map((cell, i) => `# ╔═╡ ${cellIds[i]}\n${cell}\n`).join('\n')}
# ╔═╡ Cell order:
${cellIds.map(id => `# ╠═${id}`).join('\n')}
`;
}

/**
 * Julia launcher: ensure Pluto, pick a free port, build a server session so we can read its
 * **secret** (kept on, so no "dangerous setting" warning), advertise port + secret via files,
 * write `readyFile` once the port is listening, then start the server. The readiness probe runs
 * on an `@async` task so it can fire while `Pluto.run` blocks; another keeps `notebooksFile` listing
 * the open notebooks (id, tab, path), and files changed on disk reload, for Compose > Collaboration.
 */
function buildLauncher(portFile: string, secretFile: string, readyFile: string, notebooksFile: string): string {
	return `import Pkg
try
	using Pluto
catch
	Pkg.add("Pluto")
	using Pluto
end
using Sockets
_ps = listen(Sockets.localhost, 0)
_port = Int(getsockname(_ps)[2])
close(_ps)
_session = Pluto.ServerSession()
_session.options.server.host = "127.0.0.1"
_session.options.server.port = _port
_session.options.server.launch_browser = false
_session.options.server.auto_reload_from_file = true
open(raw"${portFile}", "w") do io
	print(io, _port)
end
open(raw"${secretFile}", "w") do io
	print(io, _session.secret)
end
@async begin
	while true
		try
			_c = connect("127.0.0.1", _port)
			close(_c)
			open(raw"${readyFile}", "w") do io
				print(io, "ready")
			end
			break
		catch
			sleep(0.5)
		end
	end
end
@async begin
	_listed = ""
	while true
		try
			_list = join(["$(id)\\t$(nb.path)" for (id, nb) in _session.notebooks], "\\n")
			if _list != _listed
				write(raw"${notebooksFile}", _list)
				_listed = _list
			end
		catch
		end
		sleep(1)
	end
end
Pluto.run(_session)
`;
}

/** Poll a file (via the file service, not the network) until it has content or the timeout elapses. */
async function waitForFile(fileService: IFileService, uri: URI, timeoutMs: number): Promise<string | undefined> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			if (await fileService.exists(uri)) {
				const content = (await fileService.readFile(uri)).value.toString().trim();
				if (content) { return content; }
			}
		} catch {
			// keep polling
		}
		await new Promise(resolve => setTimeout(resolve, 800));
	}
	return undefined;
}

/**
 * Ensure a Pluto server is running and return its base URL + secret. Reuses the server started
 * earlier this session; otherwise writes a launcher, runs it in the Julia REPL, and learns the
 * port + secret + readiness from the files it writes (no network calls, which the renderer CSP
 * would block). The wait is shown as a status-bar progress, NOT a notification toast — a toast
 * overlapping the internal browser makes it show a "Paused due to Notification" overlay.
 */
async function ensurePlutoServer(
	fileService: IFileService,
	environmentService: IEnvironmentService,
	commandService: ICommandService,
	notificationService: INotificationService,
	progressService: IProgressService,
): Promise<{ base: string; secret: string | undefined } | undefined> {
	if (plutoBase) { return { base: plutoBase, secret: plutoSecret }; }

	const dir = URI.joinPath(environmentService.cacheHome, 'pollis-pluto');
	const portFile = URI.joinPath(dir, 'port.txt');
	const secretFile = URI.joinPath(dir, 'secret.txt');
	const readyFile = URI.joinPath(dir, 'ready.txt');
	const notebooksFile = URI.joinPath(dir, NOTEBOOKS_FILE);
	for (const stale of [portFile, secretFile, readyFile, notebooksFile]) {
		try { await fileService.del(stale); } catch { /* not there */ }
	}
	const launcherUri = URI.joinPath(dir, 'launch.jl');
	await fileService.writeFile(launcherUri, VSBuffer.fromString(buildLauncher(portFile.fsPath, secretFile.fsPath, readyFile.fsPath, notebooksFile.fsPath)));

	if (!await sendToJuliaRepl(`include(raw"${launcherUri.fsPath}")`, commandService)) { return undefined; }

	const { port, secret, ready } = await progressService.withProgress(
		{ location: ProgressLocation.Window, title: localize('pluto.starting', "Starting Pluto (first run installs/precompiles Pluto)…") },
		async () => {
			const p = await waitForFile(fileService, portFile, 600_000);
			const s = p ? await waitForFile(fileService, secretFile, 10_000) : undefined;
			const r = p ? await waitForFile(fileService, readyFile, 600_000) : undefined;
			return { port: p, secret: s, ready: r };
		}
	);
	if (!port || !ready) {
		notificationService.warn(localize('pluto.notReady', "Pluto did not become ready in time. Try again once it has finished starting."));
		return undefined;
	}

	plutoBase = `http://localhost:${port}`;
	plutoSecret = secret;
	return { base: plutoBase, secret: plutoSecret };
}

/** Open a Pluto URL (path within the server) in the internal browser, appending the secret. */
function openInPlutoBrowser(commandService: ICommandService, base: string, secret: string | undefined, pathAndQuery: string): Promise<unknown> {
	const sep = pathAndQuery.includes('?') ? '&' : '?';
	const secretQuery = secret ? `${sep}secret=${encodeURIComponent(secret)}` : '';
	return Promise.resolve(commandService.executeCommand('workbench.action.browser.open', `${base}${pathAndQuery}${secretQuery}`));
}

/**
 * Registers the Pluto integration commands:
 *  - `pollis.action.sendToPluto` — write the given code as a fresh one-cell Pluto notebook and
 *    open it in the internal browser (used by the webviews' "Send to Pluto" button).
 *  - `pollis.action.newPlutoNotebook` — open a brand-new empty Pluto notebook (New File entry).
 * Both ensure/reuse a single Pluto server. A uniquely-named notebook file is written each time,
 * so no pre-existing Pluto notebook is ever overwritten.
 */
export function registerPlutoCommands(): void {
	CommandsRegistry.registerCommand('pollis.action.sendToPluto', async (accessor: ServicesAccessor, code: string) => {
		if (typeof code !== 'string' || !code.trim()) { return; }
		const fileService = accessor.get(IFileService);
		const commandService = accessor.get(ICommandService);
		const notificationService = accessor.get(INotificationService);
		const environmentService = accessor.get(IEnvironmentService);
		const progressService = accessor.get(IProgressService);

		const nbUri = URI.joinPath(environmentService.cacheHome, 'pollis-pluto', `pollis-pluto-${Date.now()}.jl`);
		try {
			await fileService.writeFile(nbUri, VSBuffer.fromString(buildPlutoNotebook(code)));
		} catch (err) {
			notificationService.error(localize('pluto.writeFailed', "Could not create the Pluto notebook file: {0}", String(err)));
			return;
		}

		const server = await ensurePlutoServer(fileService, environmentService, commandService, notificationService, progressService);
		if (!server) { return; }
		await openInPlutoBrowser(commandService, server.base, server.secret, `/open?path=${encodeURIComponent(nbUri.fsPath)}`);
	});

	CommandsRegistry.registerCommand('pollis.action.newPlutoNotebook', async (accessor: ServicesAccessor) => {
		const fileService = accessor.get(IFileService);
		const commandService = accessor.get(ICommandService);
		const notificationService = accessor.get(INotificationService);
		const environmentService = accessor.get(IEnvironmentService);
		const progressService = accessor.get(IProgressService);

		const server = await ensurePlutoServer(fileService, environmentService, commandService, notificationService, progressService);
		if (!server) { return; }
		await openInPlutoBrowser(commandService, server.base, server.secret, '/new');
	});

	MenuRegistry.appendMenuItem(MenuId.NewFile, {
		// 'notebook' group sits below the separator (with Jupyter Notebook); built-in entries
		// like this one sort above extension-contributed ones, so Pluto lands above Jupyter.
		group: 'notebook',
		command: {
			id: 'pollis.action.newPlutoNotebook',
			title: localize('newPlutoNotebook', "Pluto Notebook"),
		},
		order: 1,
	});
}
