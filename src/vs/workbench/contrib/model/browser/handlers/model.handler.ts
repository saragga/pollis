/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService, Severity } from '../../../../../platform/notification/common/notification.js';
import { localize } from '../../../../../nls.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IQuickInputService, IQuickPickSeparator } from '../../../../../platform/quickinput/common/quickInput.js';
import { IModelPackage, IModelPaper, IModelNotebook, IModelWiki, IModelVideo, IModelReference } from '../common/model.types.js';
import { URI } from '../../../../../base/common/uri.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { disposableTimeout } from '../../../../../base/common/async.js';
import { Event } from '../../../../../base/common/event.js';
import { VSBuffer } from '../../../../../base/common/buffer.js';
import { INotebookKernelService, INotebookTextModelLike } from '../../../notebook/common/notebookKernelService.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { customCopyOverlayUri, customCopyUri, CustomCopyKind } from '../common/customCopyFileSystem.js';
import { ISecretStorageService } from '../../../../../platform/secrets/common/secrets.js';
import { IWebviewService } from '../../../webview/browser/webview.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';

/**
 * Auto-selects the Julia kernel for a notebook so the user does not have to pick from the kernel
 * quickpick. The Julia extension registers its kernels asynchronously once it activates (triggered
 * by opening the notebook), so we try immediately and otherwise wait for a kernel to appear.
 */
export function autoSelectJuliaKernel(notebook: INotebookTextModelLike, notebookKernelService: INotebookKernelService): void {
	const selectJuliaKernel = (): boolean => {
		const match = notebookKernelService.getMatchingKernel(notebook);
		if (match.selected) { return true; }
		const julia =
			match.all.find(k => k.supportedLanguages.includes('julia') && /release channel/i.test(k.label))
			?? match.all.find(k => k.supportedLanguages.includes('julia'))
			?? match.all.find(k => /julia/i.test(k.label));
		if (julia) { notebookKernelService.selectKernelForNotebook(julia, notebook); return true; }
		return false;
	};
	if (!selectJuliaKernel()) {
		const kernelStore = new DisposableStore();
		kernelStore.add(notebookKernelService.onDidAddKernel(() => { if (selectJuliaKernel()) { kernelStore.dispose(); } }));
		kernelStore.add(disposableTimeout(() => kernelStore.dispose(), 10000));
	}
}

function bibKey(paper: IModelPaper): string {
	const lastName = paper.authors.split(/[,;]/)[0].trim().split(' ').pop() ?? 'Author';
	return `${lastName}${paper.year}`;
}

function generateBibTeX(paper: IModelPaper): string {
	const lines = [`@article{${bibKey(paper)},`];
	lines.push(`  author  = {${paper.authors}},`);
	lines.push(`  title   = {${paper.title}},`);
	lines.push(`  year    = {${paper.year}},`);
	if (paper.journal) { lines.push(`  journal = {${paper.journal}},`); }
	if (paper.doi)     { lines.push(`  doi     = {${paper.doi}},`); }
	if (paper.url)     { lines.push(`  url     = {${paper.url}},`); }
	lines.push(`}`);
	return lines.join('\n');
}

function paperUrl(paper: IModelPaper): string | undefined {
	return paper.doi ? `https://doi.org/${paper.doi}` : paper.url;
}

export async function openInBrowser(url: string, commandService: ICommandService): Promise<void> {
	await commandService.executeCommand('workbench.action.browser.open', url);
}

/** Installed-status of one declared package, keyed by its display name (e.g. "YFinance.jl"). */
export interface IJuliaPackageStatus {
	readonly name: string;
	readonly installed: boolean;
}

/** Result of an environment package check: per-package status plus a label of the inspected environment. */
export interface IJuliaEnvStatus {
	readonly statuses: IJuliaPackageStatus[];
	/** Human label of the environment whose Project.toml was inspected (for the indicator tooltip). */
	readonly env: string;
}

/** Julia standard libraries: always loadable (through `@stdlib` on the load path), so never missing. */
const JULIA_STDLIBS = new Set(['Base64', 'Dates', 'DelimitedFiles', 'Distributed', 'Downloads', 'InteractiveUtils', 'LinearAlgebra', 'Logging', 'Markdown', 'Mmap', 'Pkg', 'Printf', 'Random', 'Serialization', 'SHA', 'Sockets', 'SparseArrays', 'Statistics', 'TOML', 'Test', 'Unicode', 'UUIDs']);

/** Packages used by the panels that are not in the General registry, so `Pkg.add` needs their repository URL. */
const UNREGISTERED_PACKAGE_URLS = new Map<string, string>([
	['Brokerage', 'https://github.com/aaron-wheeler/Brokerage.jl'],
	['EDGAR', 'https://github.com/Trumpingtons/EDGAR.jl'],
	['HARE', 'https://github.com/Trumpingtons/HARE.jl'],
	['LSurvival', 'https://github.com/alexpkeil1/LSurvival.jl'],
	['MultilevelEstimators', 'https://github.com/PieterjanRobbe/MultilevelEstimators.jl'],
	['PerformanceAnalytics', 'https://github.com/eohne/PerformanceAnalytics.jl'],
	['QuadDIRECT', 'https://github.com/timholy/QuadDIRECT.jl'],
	['RangeVol', 'https://github.com/Trumpingtons/RangeVol.jl'],
	['TopicModels', 'https://github.com/slycoder/TopicModels.jl'],
	['TotalViewITCH', 'https://github.com/cswaney/TotalViewITCH.jl'],
	['TradingAgents', 'https://github.com/aaron-wheeler/TradingAgents.jl'],
	['VLLimitOrderBook', 'https://github.com/Renruize12306/VLLimitOrderBook.jl'],
]);

/** Strip a trailing ".jl" to recover the importable Julia package name. */
function juliaPackageName(displayName: string): string {
	return displayName.replace(/\.jl$/i, '');
}

/** Parse the `[deps]` table of a Project.toml and return the set of dependency names. */
function parseProjectDeps(content: string): Set<string> {
	const names = new Set<string>();
	let inDeps = false;
	for (const raw of content.split(/\r?\n/)) {
		const line = raw.trim();
		if (line.startsWith('[')) { inDeps = /^\[deps\]\s*$/.test(line); continue; }
		if (!inDeps || !line || line.startsWith('#')) { continue; }
		const eq = line.indexOf('=');
		if (eq > 0) { names.add(line.slice(0, eq).trim()); }
	}
	return names;
}

/** Parse the `name = "..."` field of a Project.toml, if present. */
function parseProjectName(content: string): string | undefined {
	const match = /^\s*name\s*=\s*"([^"]+)"/m.exec(content);
	return match?.[1];
}

/** Sort `vX.Y` environment folder names so the newest comes first. */
function compareJuliaEnvDesc(a: string, b: string): number {
	const pa = a.slice(1).split('.').map(Number);
	const pb = b.slice(1).split('.').map(Number);
	for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
		const d = (pb[i] ?? 0) - (pa[i] ?? 0);
		if (d) { return d; }
	}
	return 0;
}

/**
 * Best-effort, silent check of which of the given packages are declared in the Julia environment
 * the user is most likely running. Prefers an activated project — a `Project.toml` at a workspace
 * folder root — and otherwise falls back to the shared default environment
 * (`~/.julia/environments/<newest>/Project.toml`). Returns a label of whichever environment was
 * inspected so the indicator tooltip can say so. Never runs Julia (the browser layer cannot, and so
 * cannot know which environment the REPL has activated); on any failure a package is reported as not
 * installed.
 */
export async function checkJuliaPackagesInstalled(
	packageNames: string[],
	fileService: IFileService,
	pathService: IPathService,
	workspaceContextService: IWorkspaceContextService,
): Promise<IJuliaEnvStatus> {
	const deps = new Set<string>();
	let env = '';
	try {
		const project = await readWorkspaceProject(workspaceContextService, fileService);
		if (project) {
			for (const n of project.deps) { deps.add(n); }
			env = project.label;
		} else {
			const home = pathService.userHome({ preferLocal: true });
			const envRoot = URI.joinPath(home, '.julia', 'environments');
			const stat = await fileService.resolve(envRoot);
			const newest = (stat.children ?? [])
				.filter(c => c.isDirectory && /^v\d+\.\d+$/.test(c.name))
				.map(c => c.name)
				.sort(compareJuliaEnvDesc)[0];
			if (newest) {
				const projectUri = URI.joinPath(envRoot, newest, 'Project.toml');
				if (await fileService.exists(projectUri)) {
					const content = (await fileService.readFile(projectUri)).value.toString();
					for (const n of parseProjectDeps(content)) { deps.add(n); }
				}
				env = `@${newest} (shared environment)`;
			}
		}
	} catch { /* no depot / unreadable — treat every package as not installed */ }

	const statuses = packageNames.map(displayName => ({ name: displayName, installed: JULIA_STDLIBS.has(juliaPackageName(displayName)) || deps.has(juliaPackageName(displayName)) }));
	return { statuses, env };
}

/**
 * Read a `Project.toml` at a workspace folder root, which indicates an activated Julia project (the
 * Julia extension defaults to this project when one is present). Returns its declared deps and a
 * display label, or `undefined` when no workspace folder has one.
 */
async function readWorkspaceProject(
	workspaceContextService: IWorkspaceContextService,
	fileService: IFileService,
): Promise<{ deps: Set<string>; label: string } | undefined> {
	for (const folder of workspaceContextService.getWorkspace().folders) {
		const projectUri = URI.joinPath(folder.uri, 'Project.toml');
		try {
			if (await fileService.exists(projectUri)) {
				const content = (await fileService.readFile(projectUri)).value.toString();
				const name = parseProjectName(content) ?? folder.name;
				return { deps: parseProjectDeps(content), label: `${name} (project environment)` };
			}
		} catch { /* unreadable — try the next folder */ }
	}
	return undefined;
}

/**
 * Start the Julia REPL and send `code` to it. When Julia is not installed, the Julia extension offers to
 * install it instead, and nothing is sent, so the code never runs in another terminal. Resolves whether
 * the code was sent.
 */
export async function sendToJuliaRepl(code: string, commandService: ICommandService): Promise<boolean> {
	const started = await commandService.executeCommand<boolean>('language-julia.startREPL');
	if (!started) { return false; }
	await commandService.executeCommand('workbench.action.terminal.sendSequence', { text: code + '\n' });
	return true;
}

/** Install the given packages (display names accepted) via `Pkg.add` in the Julia REPL. */
export async function installJuliaPackages(packageNames: string[], commandService: ICommandService): Promise<void> {
	if (!packageNames.length) { return; }
	const list = packageNames.map(n => {
		const name = juliaPackageName(n);
		const url = UNREGISTERED_PACKAGE_URLS.get(name);
		return url ? `Pkg.PackageSpec(url="${url}")` : `Pkg.PackageSpec(name="${name}")`;
	}).join(', ');
	await sendToJuliaRepl(`import Pkg; Pkg.add([${list}])`, commandService);
}

/** Reusable wiring for the Powered-by package install-status indicator (see WEBVIEW_GUIDE.md §23). */
export interface IPackageStatusWiring {
	/** Post current install status to the webview; resolves true if every package is installed. */
	postStatus(): Promise<boolean>;
	/** Re-post status every 5s (up to ~6 min) until all installed — Pkg.add rewrites Project.toml on completion. */
	scheduleRecheck(attempt?: number): void;
	/** Handle the webview's `installPackages` message: install the missing packages, then poll to flip the icon green. */
	handleInstall(): Promise<void>;
	/** For an executing runCode target (juliaRepl / notebook), nudge with a non-blocking "Install missing" notification. */
	nudgeIfMissing(target: string | undefined): Promise<void>;
}

/**
 * Build the package install-status wiring shared by every TOML/scaffold webview. Each handler calls
 * `postStatus()` once in its open `setTimeout`, routes the `installPackages` message to `handleInstall()`,
 * and calls `nudgeIfMissing(target)` at the end of its `runCode` case. Detection is silent (reads
 * Project.toml — see `checkJuliaPackagesInstalled`); no Julia is run until the user opts in.
 */
export function createPackageStatusWiring(
	webview: { postMessage(message: unknown): void },
	disposables: DisposableStore,
	packageDisplayNames: string[],
	fileService: IFileService,
	pathService: IPathService,
	commandService: ICommandService,
	notificationService: INotificationService,
	workspaceContextService: IWorkspaceContextService,
): IPackageStatusWiring {
	const postStatus = async (): Promise<boolean> => {
		const { statuses, env } = await checkJuliaPackagesInstalled(packageDisplayNames, fileService, pathService, workspaceContextService);
		webview.postMessage({ command: 'packageStatus', statuses, env });
		return statuses.every(s => s.installed);
	};
	const scheduleRecheck = (attempt: number = 0): void => {
		if (attempt > 72) { return; } // ~6 minutes at 5s intervals
		disposables.add(disposableTimeout(async () => {
			const allInstalled = await postStatus();
			if (!allInstalled) { scheduleRecheck(attempt + 1); }
		}, 5000));
	};
	const missingNames = async (): Promise<string[]> => {
		const { statuses } = await checkJuliaPackagesInstalled(packageDisplayNames, fileService, pathService, workspaceContextService);
		return statuses.filter(s => !s.installed).map(s => s.name);
	};
	const handleInstall = async (): Promise<void> => {
		await installJuliaPackages(await missingNames(), commandService);
		scheduleRecheck(0);
	};
	const nudgeIfMissing = async (target: string | undefined): Promise<void> => {
		// Only the targets that actually execute code need the packages present.
		if (target !== 'juliaRepl' && target !== 'notebook') { return; }
		const missing = await missingNames();
		if (!missing.length) { return; }
		notificationService.prompt(
			Severity.Info,
			localize('pollis.installMissing', "Install missing: {0}", missing.join(', ')),
			[{ label: localize('pollis.install', "Install"), run: () => { void installJuliaPackages(missing, commandService).then(() => scheduleRecheck(0)); } }],
		);
	};
	return { postStatus, scheduleRecheck, handleInstall, nudgeIfMissing };
}

/** One credential field of a provider (a provider may need several, e.g. Kaggle username + key). */
export interface IApiKeyField {
	/** Secret Storage key, e.g. `pollis.apiKey.alphavantage`. */
	readonly secretKey: string;
	/** Julia environment variable the package reads, e.g. `ALPHA_VANTAGE_API_KEY`. */
	readonly envVar: string;
	/** Input prompt for this field, e.g. `Alpha Vantage API key` or `Kaggle username`. */
	readonly prompt: string;
	/** Mask the input (default true); set false for non-secret fields like a username. */
	readonly password?: boolean;
}

/** A provider that requires a free API key / token / credentials (see WEBVIEW_GUIDE.md §24). */
export interface IApiKeyProvider {
	/** Human label, e.g. `Alpha Vantage`, `Hugging Face`, `Kaggle`. */
	readonly label: string;
	/** Noun shown in the indicator: `API key` (default), `token`, `credentials`. */
	readonly noun?: string;
	/** One or more credential fields; all must be present for the provider to count as configured. */
	readonly fields: IApiKeyField[];
}

/** Reusable wiring for the Powered-by API-key indicator: stores credentials in VS Code Secret Storage. */
export interface IApiKeyWiring {
	/** Post whether all fields are saved to the webview; resolves true if so. */
	postStatus(): Promise<boolean>;
	/** Prompt for each field (masked) and store it securely, then re-post status. */
	handleSet(): Promise<void>;
	/** Delete every stored field, then re-post status. */
	handleClear(): Promise<void>;
	/** For an executing `juliaRepl` run, the `ENV[...] = "...";` lines to inject (empty if none/target). */
	replPrefix(target: string | undefined): Promise<string>;
}

/**
 * Build the API-key wiring shared by webviews that need provider credentials (Alpha Vantage, FRED,
 * Hugging Face, Kaggle, …). Credentials live in VS Code Secret Storage — never in settings, generated
 * code, or saved files. Generated code reads `ENV[field.envVar]`; on a Julia REPL run the handler
 * prepends them as session env vars via `replPrefix`, so the literal values never land in a file.
 */
export function createApiKeyWiring(
	webview: { postMessage(message: unknown): void; readonly isFocused: boolean },
	provider: IApiKeyProvider,
	secretStorageService: ISecretStorageService,
	quickInputService: IQuickInputService,
	webviewService: IWebviewService,
): IApiKeyWiring {
	const noun = provider.noun ?? 'API key';
	const postStatus = async (): Promise<boolean> => {
		const values = await Promise.all(provider.fields.map(f => secretStorageService.get(f.secretKey)));
		const hasKey = values.every(v => !!v);
		webview.postMessage({ command: 'apiKeyStatus', hasKey, label: provider.label, noun });
		return hasKey;
	};
	const handleSet = async (): Promise<void> => {
		// `ignoreFocusLost` keeps the prompt open while the user fetches their key from a browser or
		// another editor, but it must not linger when the user switches to another webview. Dismiss it
		// when a different webview gains focus (our own webview reporting `isFocused` is the prompt
		// returning focus to us, not a switch away).
		const activeWebviewListener = webviewService.onDidChangeActiveWebview(active => {
			if (active && !webview.isFocused) { quickInputService.cancel(); }
		});
		try {
			for (const field of provider.fields) {
				const masked = field.password !== false;
				// Non-secret fields (e.g. a username or contact string) pre-fill the current value so the
				// user can edit it in place. Masked secrets are never echoed back.
				const current = masked ? undefined : (await secretStorageService.get(field.secretKey)) ?? undefined;
				const prompt = masked
					? localize('pollis.apiKey.prompt', "Enter your {0} — stored securely in VS Code Secret Storage", field.prompt)
					: localize('pollis.apiKey.promptPlain', "Enter your {0} — saved in VS Code", field.prompt);
				const value = await quickInputService.input({
					password: masked,
					value: current,
					ignoreFocusLost: true,
					prompt,
					placeHolder: field.envVar,
				});
				if (value === undefined) { break; } // cancelled — keep whatever is already stored
				if (value.trim()) { await secretStorageService.set(field.secretKey, value.trim()); }
			}
		} finally {
			activeWebviewListener.dispose();
		}
		await postStatus();
	};
	const handleClear = async (): Promise<void> => {
		for (const field of provider.fields) { await secretStorageService.delete(field.secretKey); }
		await postStatus();
	};
	const replPrefix = async (target: string | undefined): Promise<string> => {
		if (target !== 'juliaRepl') { return ''; }
		const lines: string[] = [];
		for (const field of provider.fields) {
			const value = await secretStorageService.get(field.secretKey);
			if (value) { lines.push(`ENV["${field.envVar}"] = "${value}";`); }
		}
		return lines.length ? lines.join('\n') + '\n' : '';
	};
	return { postStatus, handleSet, handleClear, replPrefix };
}

/**
 * A message from a scaffold Example Code box: `model` names a main-box tab, `step` a Next Steps
 * example (`saveExample` carries `code`, `restoreExample` does not).
 */
interface IExampleCodeMessage {
	readonly command: string;
	readonly model?: string;
	readonly step?: string;
	readonly code?: string;
}

/**
 * Wire the Edit / Save / Restore Default buttons of a scaffold webview's code boxes.
 * Customised examples are plain Julia files in `~/.pollis/examples/<panelId>/<model>.jl` (main box
 * tabs) and `~/.pollis/examples/<panelId>/next-steps/<id>.jl` (Next Steps examples), outside the
 * application, so they survive updates, work in compiled builds and can be copied between
 * machines (e.g. a teacher handing out a set of examples). An example without a file shows the
 * generated default.
 */
export function createExampleCodeWiring(
	webview: { postMessage(message: unknown): void; readonly onMessage: Event<{ readonly message: IExampleCodeMessage }> },
	disposables: DisposableStore,
	panelId: string,
	fileService: IFileService,
	pathService: IPathService,
	notificationService: INotificationService,
): void {
	const folder = URI.joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'examples', panelId);
	const stepsFolder = URI.joinPath(folder, 'next-steps');
	const isExampleId = (id: string) => /^[\w-]+$/.test(id);
	const readExamples = async (dir: URI): Promise<{ [id: string]: string }> => {
		const examples: { [id: string]: string } = {};
		if (await fileService.exists(dir)) {
			const stat = await fileService.resolve(dir);
			for (const child of stat.children ?? []) {
				const id = child.name.replace(/\.jl$/, '');
				if (!child.isDirectory && child.name.endsWith('.jl') && isExampleId(id)) {
					examples[id] = (await fileService.readFile(child.resource)).value.toString().replace(/\s+$/, '');
				}
			}
		}
		return examples;
	};
	const postExamples = async (): Promise<void> => {
		webview.postMessage({ command: 'customExamples', examples: await readExamples(folder), steps: await readExamples(stepsFolder) });
	};
	disposables.add(webview.onMessage(async e => {
		const msg = e.message;
		if (msg.command !== 'saveExample' && msg.command !== 'restoreExample') {
			return;
		}
		const id = typeof msg.step === 'string' ? msg.step : msg.model;
		if (typeof id !== 'string' || !isExampleId(id)) {
			return;
		}
		const file = URI.joinPath(typeof msg.step === 'string' ? stepsFolder : folder, `${id}.jl`);
		try {
			if (msg.command === 'saveExample' && typeof msg.code === 'string') {
				await fileService.writeFile(file, VSBuffer.fromString(msg.code + '\n'));
			} else if (msg.command === 'restoreExample' && await fileService.exists(file)) {
				await fileService.del(file);
			}
		} catch (error) {
			notificationService.error(localize('pollis.exampleCode.saveFailed', "Could not update the example in {0}: {1}", file.fsPath, String(error)));
		}
		await postExamples();
	}));
	void postExamples();
}

/** A message from the Edit / Restore Default links on the Local Wikis and Notebook Tutorials cards. */
interface ICustomCopyMessage {
	readonly command: string;
	readonly kind?: string;
	readonly target?: string;
}

/**
 * Wire the Edit / Restore Default links on the Local Wikis and Notebook Tutorials cards of a scaffold
 * webview. Both open through the `pollis-wiki:` / `pollis-notebook:` overlays, so the first save
 * creates the customised copy in `~/.pollis/wikis/` or `~/.pollis/notebooks/` and the originals are
 * never written to. Edit (wikis only; a notebook is edited where it opens) shows the wiki's source
 * beside its preview; Restore Default deletes the copy. The webview is told which wikis and notebooks
 * are customised (`customCopies`) now and whenever one changes.
 */
export function createCustomCopyWiring(
	webview: { postMessage(message: unknown): void; readonly onMessage: Event<{ readonly message: ICustomCopyMessage }> },
	disposables: DisposableStore,
	wikis: IModelWiki[],
	notebooks: IModelNotebook[],
	fileService: IFileService,
	pathService: IPathService,
	editorService: IEditorService,
	commandService: ICommandService,
	notificationService: INotificationService,
): void {
	const files: { readonly [kind in CustomCopyKind]: string[] } = {
		wiki: wikis.filter(isWikiEntry).flatMap(w => w.bundled ? [w.file] : []),
		notebook: notebooks.flatMap(n => n.bundled ? [n.file] : []),
	};
	const customised = async (kind: CustomCopyKind): Promise<string[]> => {
		const result: string[] = [];
		for (const file of files[kind]) {
			if (await fileService.exists(await customCopyUri(pathService, kind, file))) {
				result.push(file);
			}
		}
		return result;
	};
	const postCustomCopies = async (): Promise<void> => {
		webview.postMessage({ command: 'customCopies', wikis: await customised('wiki'), notebooks: await customised('notebook') });
	};
	disposables.add(fileService.onDidFilesChange(e => {
		if ((['wiki', 'notebook'] as const).some(kind => files[kind].some(file => e.contains(customCopyOverlayUri(kind, file))))) {
			void postCustomCopies();
		}
	}));
	disposables.add(webview.onMessage(async e => {
		const msg = e.message;
		const kind = msg.kind === 'wiki' || msg.kind === 'notebook' ? msg.kind : undefined;
		if ((msg.command !== 'editCopy' && msg.command !== 'restoreCopy') || !kind || typeof msg.target !== 'string' || !files[kind].includes(msg.target)) {
			return;
		}
		const uri = customCopyOverlayUri(kind, msg.target);
		if (msg.command === 'editCopy') {
			if (kind === 'wiki') {
				await editorService.openEditor({ resource: uri });
				await commandService.executeCommand('markdown.showPreviewToSide', uri);
			}
			return;
		}
		try {
			await fileService.del(uri);
		} catch (error) {
			notificationService.error(localize('pollis.customCopy.restoreFailed', "Could not restore {0}: {1}", msg.target, String(error)));
		}
		await postCustomCopies();
	}));
	void postCustomCopies();
}

/** One entry of a BibTeX file. */
interface IBibEntry {
	readonly key: string;
	/** Field values with braces and quotes removed, keyed by lower-case field name. */
	readonly fields: { readonly [name: string]: string };
	/** Where the entry sits in the file, so it can be removed without touching the others. */
	readonly start: number;
	readonly end: number;
}

/** Index of the delimiter closing the `{` or `(` at `open`, skipping nested braces; -1 if unbalanced. */
function matchingDelimiter(source: string, open: number): number {
	const close = source[open] === '(' ? ')' : '}';
	let depth = 0;
	for (let i = open + 1; i < source.length; i++) {
		const c = source[i];
		if (c === '{') {
			depth++;
		} else if (c === '}') {
			if (depth === 0) {
				return close === '}' ? i : -1;
			}
			depth--;
		} else if (c === close && depth === 0) {
			return i;
		}
	}
	return -1;
}

/** Parse the `name = value` fields of a BibTeX entry body; values may be `{...}`, `"..."`, bare words or `#` concatenations. */
function parseBibFields(body: string): { [name: string]: string } {
	const fields: { [name: string]: string } = {};
	let i = 0;
	while (i < body.length) {
		const name = /^[\s,]*(?<name>[\w:.-]+)\s*=\s*/.exec(body.slice(i));
		if (!name?.groups) {
			break;
		}
		i += name[0].length;
		let value = '';
		while (i < body.length) {
			if (body[i] === '{') {
				const end = matchingDelimiter(body, i);
				if (end < 0) {
					return fields;
				}
				value += body.slice(i + 1, end);
				i = end + 1;
			} else if (body[i] === '"') {
				let j = i + 1;
				for (let depth = 0; j < body.length && (body[j] !== '"' || depth > 0); j++) {
					depth += body[j] === '{' ? 1 : body[j] === '}' ? -1 : 0;
				}
				value += body.slice(i + 1, j);
				i = j + 1;
			} else {
				const word = /^[^,#\s]*/.exec(body.slice(i))?.[0] ?? '';
				value += word;
				i += word.length;
			}
			const concat = /^\s*#\s*/.exec(body.slice(i));
			if (!concat) {
				break;
			}
			i += concat[0].length;
		}
		fields[name.groups.name.toLowerCase()] = value.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
	}
	return fields;
}

/** A bundled reference hidden by the user: a `@comment{pollis-hide: <title>}` block. */
interface IBibHidden {
	readonly title: string;
	readonly start: number;
	readonly end: number;
}

/** The contents of a references file. */
interface IBibFile {
	readonly entries: IBibEntry[];
	readonly hidden: IBibHidden[];
}

/**
 * Field of an entry that replaces a bundled reference (the user's corrected version of it), holding
 * that reference's title. BibTeX tools ignore unknown fields, so the file stays valid BibTeX.
 */
const REPLACES_FIELD = 'pollis-replaces';

/** Parse a BibTeX file: its entries and its `pollis-hide` comments, skipping other `@comment`, `@string` and `@preamble` blocks. */
function parseBibTeX(source: string): IBibFile {
	const entries: IBibEntry[] = [];
	const hidden: IBibHidden[] = [];
	const header = /@\s*(?<type>[A-Za-z]+)\s*[{(]/g;
	let match: RegExpExecArray | null;
	while ((match = header.exec(source)) !== null) {
		const open = header.lastIndex - 1;
		const end = matchingDelimiter(source, open);
		if (end < 0) {
			break;
		}
		header.lastIndex = end + 1;
		const type = match.groups?.type ?? '';
		const body = source.slice(open + 1, end);
		if (/^comment$/i.test(type)) {
			const hide = /^\s*pollis-hide:\s*(?<title>[\s\S]*?)\s*$/.exec(body);
			if (hide?.groups) {
				hidden.push({ title: normaliseBibText(hide.groups.title), start: match.index, end: end + 1 });
			}
			continue;
		}
		if (/^(string|preamble)$/i.test(type)) {
			continue;
		}
		const comma = body.indexOf(',');
		entries.push({
			key: (comma < 0 ? body : body.slice(0, comma)).trim(),
			fields: comma < 0 ? {} : parseBibFields(body.slice(comma + 1)),
			start: match.index,
			end: end + 1,
		});
	}
	return { entries, hidden };
}

/** Text as BibTeX field values are compared: without braces, whitespace collapsed. */
function normaliseBibText(text: string): string {
	return text.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
}

/** Replace `source[start, end)` with `text`, keeping a single blank line between blocks. */
function spliceBib(source: string, start: number, end: number, text: string): string {
	return (source.slice(0, start) + text + source.slice(end)).replace(/\n{3,}/g, '\n\n').trim();
}

/** Append a block to a BibTeX source, after a blank line. */
function appendBib(source: string, text: string): string {
	const kept = source.trim();
	return kept ? `${kept}\n\n${text}` : text;
}

/** An entry's text without its `pollis-replaces` field. */
function withoutReplaces(text: string): string {
	return text.replace(new RegExp(`\\n?[ \\t]*${REPLACES_FIELD}\\s*=\\s*\\{[^{}]*\\}\\s*,?`, 'i'), '');
}

/** An entry's text marked as replacing the bundled reference `title` (the field goes first, after the citation key). */
function withReplaces(text: string, title: string): string {
	const plain = withoutReplaces(text);
	const comma = plain.indexOf(',');
	return `${plain.slice(0, comma + 1)}\n  ${REPLACES_FIELD} = {${title}},${plain.slice(comma + 1)}`;
}

/** The source without the `pollis-hide` comments for `title`. */
function unhideBib(source: string, title: string): string {
	for (const hide of parseBibTeX(source).hidden.filter(h => h.title === title).reverse()) {
		source = spliceBib(source, hide.start, hide.end, '');
	}
	return source;
}

/** A reference as shown in the Explore References panel. */
interface IReferenceItem {
	/** `bundled:<index>` for a bundled reference (customised or not), `added:<entry index>` for one the user added. */
	readonly id: string;
	readonly title: string;
	readonly authors: string;
	readonly year: string;
	readonly journal?: string;
	readonly openAccess: boolean;
	/** `customised`: a bundled reference the user corrected. */
	readonly kind: 'bundled' | 'customised' | 'added';
	/** A bundled reference the user removed (hidden until restored). */
	readonly removed: boolean;
	readonly url?: string;
	readonly bibtex: string;
}

/** A message from the Explore References panel. */
interface IReferenceMessage {
	readonly command: string;
	readonly id?: string;
	readonly bibtex?: string;
	readonly title?: string;
	readonly authors?: string;
	readonly year?: string;
	readonly link?: string;
}

/**
 * Wire the Explore References panel of a scaffold webview. The bundled references can be corrected
 * (Edit), removed and restored, and the user can add references of their own, by pasting BibTeX or by
 * entering a title, authors, year and link. All of it lives in `~/.pollis/references/<panelId>.bib`,
 * a plain BibTeX file (so a teacher can also edit it by hand or hand it out):
 * - an entry of the user's own is an ordinary entry;
 * - a corrected bundled reference is an entry with a `pollis-replaces = {<original title>}` field;
 * - a removed bundled reference is a `@comment{pollis-hide: <title>}` block.
 * The originals are never changed, so Restore Default always brings one back. The webview gets the
 * list (`references`) now, whenever it changes and whenever the panel opens (`listReferences`).
 */
export function createReferenceWiring(
	webview: { postMessage(message: unknown): void; readonly onMessage: Event<{ readonly message: IReferenceMessage }> },
	disposables: DisposableStore,
	panelId: string,
	references: IModelReference[],
	fileService: IFileService,
	pathService: IPathService,
	commandService: ICommandService,
	notificationService: INotificationService,
): void {
	const file = URI.joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'references', `${panelId}.bib`);
	const papers = references.filter(isReferencePaper);
	const readSource = async (): Promise<string> => await fileService.exists(file) ? (await fileService.readFile(file)).value.toString() : '';
	const writeSource = async (source: string): Promise<void> => {
		if (source.trim()) {
			await fileService.writeFile(file, VSBuffer.fromString(source.trim() + '\n'));
		} else if (await fileService.exists(file)) {
			await fileService.del(file);
		}
	};
	const entryItem = (source: string, entry: IBibEntry, id: string, kind: IReferenceItem['kind']): IReferenceItem => {
		const { title = '', author = '', year = '', journal, doi, url } = entry.fields;
		return {
			id,
			title: title || entry.key,
			authors: author.split(/\s+and\s+/i).join('; '),
			year,
			journal: journal || undefined,
			openAccess: false,
			kind,
			removed: false,
			url: doi ? `https://doi.org/${doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')}` : url || undefined,
			bibtex: withoutReplaces(source.slice(entry.start, entry.end)),
		};
	};
	const listItems = (source: string): IReferenceItem[] => {
		const { entries, hidden } = parseBibTeX(source);
		const items = papers.map((paper, i): IReferenceItem => {
			const title = normaliseBibText(paper.title);
			const replacement = entries.find(entry => entry.fields[REPLACES_FIELD] === title);
			const removed = hidden.some(hide => hide.title === title);
			return replacement
				? { ...entryItem(source, replacement, `bundled:${i}`, 'customised'), removed }
				: { id: `bundled:${i}`, title: paper.title, authors: paper.authors, year: String(paper.year), journal: paper.journal, openAccess: paper.openAccess, kind: 'bundled', removed, url: paperUrl(paper), bibtex: generateBibTeX(paper) };
		});
		entries.forEach((entry, i) => {
			if (!entry.fields[REPLACES_FIELD]) {
				items.push(entryItem(source, entry, `added:${i}`, 'added'));
			}
		});
		return items;
	};
	const postReferences = async (): Promise<void> => {
		let items = listItems('');
		try {
			items = listItems(await readSource());
		} catch (error) {
			notificationService.error(localize('pollis.references.readFailed', "Could not read your references in {0}: {1}", file.fsPath, String(error)));
		}
		webview.postMessage({ command: 'references', references: items });
	};
	/** The bundled paper (and its normalised title) or the user's entry that a message's `id` refers to. */
	const target = (id: string | undefined, bib: IBibFile): { bundled?: { title: string }; added?: IBibEntry } | undefined => {
		const match = /^(?<kind>bundled|added):(?<index>\d+)$/.exec(id ?? '')?.groups;
		if (match?.kind === 'bundled') {
			const paper = papers[Number(match.index)];
			return paper ? { bundled: { title: normaliseBibText(paper.title) } } : undefined;
		}
		const entry = match ? bib.entries[Number(match.index)] : undefined;
		return entry && !entry.fields[REPLACES_FIELD] ? { added: entry } : undefined;
	};
	/** The BibTeX text for a reference entered by hand, or an error message. */
	const entryFromFields = (msg: IReferenceMessage, existing: IBibEntry[]): { text?: string; error?: string } => {
		const clean = (s: string | undefined) => normaliseBibText(s ?? '');
		const title = clean(msg.title);
		const authors = clean(msg.authors);
		const year = clean(msg.year);
		const link = clean(msg.link);
		if (!title) {
			return { error: localize('pollis.references.noTitle', "Enter a title, or paste a BibTeX entry.") };
		}
		if (year && !/^\d{4}$/.test(year)) {
			return { error: localize('pollis.references.badYear', "The year must have four digits.") };
		}
		const doi = /^(https?:\/\/(dx\.)?doi\.org\/|doi:\s*)?(?<doi>10\.\d{4,9}\/\S+)$/i.exec(link)?.groups?.doi;
		if (link && !doi && !/^https?:\/\/\S+$/i.test(link)) {
			return { error: localize('pollis.references.badLink', "The link must be a web address (https://...) or a DOI (10....).") };
		}
		const base = (authors.split(/[,;]/)[0].trim().split(' ').pop() || title.split(' ')[0]).replace(/[^A-Za-z0-9]/g, '') + year;
		const keys = new Set(existing.map(e => e.key));
		let key = base || 'ref';
		for (let n = 0; keys.has(key); n++) {
			key = base + String.fromCharCode(97 + n % 26) + (n >= 26 ? Math.floor(n / 26) : '');
		}
		const lines = [`@misc{${key},`, `  title  = {${title}},`];
		if (authors) { lines.push(`  author = {${authors.split(/\s*;\s*/).join(' and ')}},`); }
		if (year) { lines.push(`  year   = {${year}},`); }
		if (doi) { lines.push(`  doi    = {${doi}},`); } else if (link) { lines.push(`  url    = {${link}},`); }
		lines.push('}');
		return { text: lines.join('\n') };
	};
	/** Add a reference (no `id`) or replace the one `id` refers to; returns the id to select, or an error message. */
	const saveReference = (source: string, msg: IReferenceMessage): { source?: string; id?: string; error?: string } => {
		const bib = parseBibTeX(source);
		const edited = msg.id !== undefined ? target(msg.id, bib) : undefined;
		if (msg.id !== undefined && !edited) {
			return {};
		}
		let text: string;
		const bibtex = msg.bibtex ?? '';
		if (bibtex.trim()) {
			const pasted = parseBibTeX(bibtex).entries;
			if (!pasted.length || pasted.some(entry => !entry.fields.title)) {
				return { error: localize('pollis.references.badBibtex', "Could not read the BibTeX: every entry needs to look like @article{key, title = {...}, ...}.") };
			}
			if (edited && pasted.length !== 1) {
				return { error: localize('pollis.references.editOne', "A reference is replaced by exactly one BibTeX entry.") };
			}
			// Only the entries themselves: stray text (or a half-pasted entry) could hide the entries after it.
			text = pasted.map(entry => withoutReplaces(bibtex.slice(entry.start, entry.end))).join('\n\n');
		} else {
			const entry = entryFromFields(msg, bib.entries);
			if (entry.text === undefined) {
				return { error: entry.error };
			}
			text = entry.text;
		}
		if (edited?.bundled) {
			const title = edited.bundled.title;
			const replacement = bib.entries.find(entry => entry.fields[REPLACES_FIELD] === title);
			const next = replacement ? spliceBib(source, replacement.start, replacement.end, withReplaces(text, title)) : appendBib(source, withReplaces(text, title));
			return { source: unhideBib(next, title), id: msg.id };   // a corrected reference is shown again
		}
		if (edited?.added) {
			return { source: spliceBib(source, edited.added.start, edited.added.end, text), id: msg.id };
		}
		return { source: appendBib(source, text), id: `added:${bib.entries.length}` };
	};
	/** Restore Default for a bundled reference: drop the user's correction of it and show it again. */
	const restoreReference = (source: string, id: string | undefined): string | undefined => {
		const bib = parseBibTeX(source);
		const title = target(id, bib)?.bundled?.title;
		if (title === undefined) {
			return undefined;
		}
		const replacement = bib.entries.find(entry => entry.fields[REPLACES_FIELD] === title);
		return unhideBib(replacement ? spliceBib(source, replacement.start, replacement.end, '') : source, title);
	};

	/** Remove a reference: delete the user's own entry, or hide a bundled one (dropping any correction of it). */
	const removeReference = (source: string, id: string | undefined): string | undefined => {
		const edited = target(id, parseBibTeX(source));
		if (edited?.added) {
			return spliceBib(source, edited.added.start, edited.added.end, '');
		}
		if (!edited?.bundled) {
			return undefined;
		}
		const next = restoreReference(source, id) ?? source;
		return appendBib(next, `@comment{pollis-hide: ${edited.bundled.title}}`);
	};
	disposables.add(webview.onMessage(async e => {
		const msg = e.message;
		try {
			switch (msg.command) {
				case 'listReferences':
					await postReferences();
					break;
				case 'openReference': {
					const item = listItems(await readSource()).find(r => r.id === msg.id);
					if (item?.url) {
						await openInBrowser(item.url, commandService);
					}
					break;
				}
				case 'saveReference': {
					const result = saveReference(await readSource(), msg);
					if (result.error) {
						webview.postMessage({ command: 'referenceSaveFailed', message: result.error });
					} else if (result.source !== undefined) {
						await writeSource(result.source);
						await postReferences();
						webview.postMessage({ command: 'referenceSaved', id: result.id });
					}
					break;
				}
				case 'removeReference':
				case 'restoreReference': {
					const source = await readSource();
					const next = msg.command === 'removeReference' ? removeReference(source, msg.id) : restoreReference(source, msg.id);
					if (next !== undefined) {
						await writeSource(next);
					}
					await postReferences();
					break;
				}
			}
		} catch (error) {
			if (msg.command === 'saveReference') {
				webview.postMessage({ command: 'referenceSaveFailed', message: localize('pollis.references.writeFailed', "Could not save the reference in {0}: {1}", file.fsPath, String(error)) });
			} else {
				notificationService.error(localize('pollis.references.updateFailed', "Could not update your references in {0}: {1}", file.fsPath, String(error)));
			}
		}
	}));
	void postReferences();
}

export function buildPaperLinks(packages: IModelPackage[]): IModelPaper[] {
	return packages.flatMap(pkg => pkg.papers);
}

export async function openWikiList(
	wikis: IModelWiki[],
	quickInputService: IQuickInputService,
	openerService: IOpenerService,
	editorService: IEditorService,
	commandService?: ICommandService,
): Promise<void> {
	const pickable = wikis.filter(isWikiEntry);
	if (pickable.length === 0) { return; }
	type WikiPickItem = { label: string; wiki: IModelWikiEntry };
	const items: (WikiPickItem | IQuickPickSeparator)[] = wikis.map(w => {
		if (!isWikiEntry(w)) {
			return { type: 'separator' as const, label: w.label };
		}
		return { label: w.name, wiki: w };
	});
	const picked = await quickInputService.pick(items, { placeHolder: 'Select a wiki to open' });
	if (!picked) { return; }
	await openWikiItem((picked as WikiPickItem).wiki, openerService, editorService, commandService);
}

type IModelWikiEntry = Extract<IModelWiki, { bundled: boolean }>;

function isWikiEntry(w: IModelWiki): w is IModelWikiEntry {
	return !('separator' in w);
}

async function openWikiItem(
	item: IModelWikiEntry,
	openerService: IOpenerService,
	editorService: IEditorService,
	commandService?: ICommandService,
): Promise<void> {
	if (!item.bundled) {
		await openerService.open(URI.parse(item.url));
		return;
	}
	// Through the overlay, so a customised copy (and the wikis it links to) are shown when they exist.
	const uri = customCopyOverlayUri('wiki', item.file);
	if (commandService) {
		// Bundled wikis are markdown — open the rendered preview rather than the raw source.
		await commandService.executeCommand('markdown.showPreview', uri);
		return;
	}
	await editorService.openEditor({ resource: uri });
}

export async function openNotebookList(
	notebooks: IModelNotebook[],
	quickInputService: IQuickInputService,
	openerService: IOpenerService,
	editorService: IEditorService,
): Promise<void> {
	if (notebooks.length === 0) { return; }
	let item: IModelNotebook | undefined;
	if (notebooks.length === 1) {
		item = notebooks[0];
	} else {
		const picked = await quickInputService.pick(
			notebooks.map(nb => ({ label: nb.name, description: nb.description, notebook: nb })),
			{ placeHolder: 'Select a notebook to open' }
		);
		item = picked?.notebook;
	}
	if (!item) { return; }
	await openNotebookItem(item, openerService, editorService);
}

export async function openNotebookItem(
	item: IModelNotebook,
	openerService: IOpenerService,
	editorService: IEditorService,
	notebookKernelService?: INotebookKernelService,
	notebookEditorModelResolverService?: INotebookEditorModelResolverService,
): Promise<void> {
	if (!item.bundled) {
		await openerService.open(URI.parse(item.url));
		return;
	}
	// Through the overlay: the first save creates the user's copy in ~/.pollis/notebooks/, never touching the original.
	const uri = customCopyOverlayUri('notebook', item.file);

	// Open the notebook with the default editor for `.ipynb` (the notebook editor). The editor owns
	// the model's lifecycle — do NOT hold a long-lived model reference here, or the model gets
	// disposed out from under the editor when the user navigates away and the notebook renders blank.
	await editorService.openEditor({ resource: uri });

	// When the kernel services are available, auto-select the Julia kernel so the user is not prompted.
	// Resolve a *transient* reference only to obtain the model, then release it immediately: the editor
	// keeps its own reference, so the model (and the pending kernel selection) stay valid.
	if (notebookKernelService && notebookEditorModelResolverService) {
		const ref = await notebookEditorModelResolverService.resolve(uri, 'jupyter-notebook');
		try {
			autoSelectJuliaKernel(ref.object.notebook, notebookKernelService);
		} finally {
			ref.dispose();
		}
	}
}

export async function openWikiByFile(
	file: string,
	wikis: IModelWiki[],
	openerService: IOpenerService,
	editorService: IEditorService,
	commandService?: ICommandService,
): Promise<void> {
	const item = wikis.filter(isWikiEntry).find(w => w.bundled ? w.file === file : w.url === file);
	if (item) { await openWikiItem(item, openerService, editorService, commandService); }
}

export async function openNotebookByFile(
	file: string,
	notebooks: IModelNotebook[],
	openerService: IOpenerService,
	editorService: IEditorService,
	notebookKernelService?: INotebookKernelService,
	notebookEditorModelResolverService?: INotebookEditorModelResolverService,
): Promise<void> {
	const item = notebooks.find(nb => nb.bundled ? nb.file === file : nb.url === file);
	if (item) { await openNotebookItem(item, openerService, editorService, notebookKernelService, notebookEditorModelResolverService); }
}

/** A Multimedia Tutorials video as the webview lists it; see {@link createVideoWiring}. */
interface IVideoItem {
	/** `bundled:<index in the panel's videos>` or `added:<index in the user's file>`. */
	readonly id: string;
	readonly title: string;
	readonly url: string;
	readonly description: string;
	readonly kind: 'bundled' | 'customised' | 'added';
	readonly removed: boolean;
}

/** One video in the user's videos file. `replaces` holds the link of the bundled video it corrects. */
interface IStoredVideo {
	title: string;
	url: string;
	description?: string;
	replaces?: string;
}

/** The user's videos file for one panel: added and corrected videos, and the links of removed bundled ones. */
interface IVideoFile {
	videos: IStoredVideo[];
	hidden: string[];
}

interface IVideoMessage {
	readonly command: string;
	readonly id?: string;
	readonly title?: string;
	readonly url?: string;
	readonly description?: string;
}

/**
 * Wires the Multimedia Tutorials panel of the shared scaffold: the panel's bundled videos (from its
 * packages) plus the user's own, kept in `~/.pollis/videos/<panelId>.json`. The user can add a video
 * (title, link, optional description), correct any video, and remove any video; a bundled video is
 * hidden rather than deleted, so it can be restored.
 */
export function createVideoWiring(
	webview: { postMessage(message: unknown): void; readonly onMessage: Event<{ readonly message: IVideoMessage }> },
	disposables: DisposableStore,
	panelId: string,
	packages: IModelPackage[],
	fileService: IFileService,
	pathService: IPathService,
	commandService: ICommandService,
	notificationService: INotificationService,
): void {
	const file = URI.joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'videos', `${panelId}.json`);
	const bundled = buildVideoLinks(packages);
	const readFile = async (): Promise<IVideoFile> => {
		if (!await fileService.exists(file)) {
			return { videos: [], hidden: [] };
		}
		const data = JSON.parse((await fileService.readFile(file)).value.toString()) as Partial<IVideoFile>;
		const isVideo = (v: IStoredVideo) => typeof v?.title === 'string' && typeof v?.url === 'string';
		return {
			videos: Array.isArray(data.videos) ? data.videos.filter(isVideo) : [],
			hidden: Array.isArray(data.hidden) ? data.hidden.filter(url => typeof url === 'string') : [],
		};
	};
	const writeFile = async (data: IVideoFile): Promise<void> => {
		if (data.videos.length || data.hidden.length) {
			await fileService.writeFile(file, VSBuffer.fromString(JSON.stringify(data, null, '\t') + '\n'));
		} else if (await fileService.exists(file)) {
			await fileService.del(file);
		}
	};
	const listItems = (data: IVideoFile): IVideoItem[] => {
		const items = bundled.map((video, i): IVideoItem => {
			const replacement = data.videos.find(v => v.replaces === video.url);
			const shown = replacement ?? video;
			return { id: `bundled:${i}`, title: shown.title, url: shown.url, description: shown.description ?? '', kind: replacement ? 'customised' : 'bundled', removed: data.hidden.includes(video.url) };
		});
		data.videos.forEach((video, i) => {
			if (!video.replaces) {
				items.push({ id: `added:${i}`, title: video.title, url: video.url, description: video.description ?? '', kind: 'added', removed: false });
			}
		});
		return items;
	};
	const postVideos = async (): Promise<void> => {
		let items = listItems({ videos: [], hidden: [] });
		try {
			items = listItems(await readFile());
		} catch (error) {
			notificationService.error(localize('pollis.videos.readFailed', "Could not read your videos in {0}: {1}", file.fsPath, String(error)));
		}
		webview.postMessage({ command: 'videos', videos: items });
	};
	/** The link of the bundled video, or the index of the user's video, that a message's `id` refers to. */
	const target = (id: string | undefined, data: IVideoFile): { bundled?: string; added?: number } | undefined => {
		const match = /^(?<kind>bundled|added):(?<index>\d+)$/.exec(id ?? '')?.groups;
		const index = Number(match?.index);
		if (match?.kind === 'bundled') {
			return bundled[index] ? { bundled: bundled[index].url } : undefined;
		}
		return match && data.videos[index] && !data.videos[index].replaces ? { added: index } : undefined;
	};
	/** Drop the user's correction of a bundled video and show it again. */
	const restore = (data: IVideoFile, url: string): IVideoFile => ({
		videos: data.videos.filter(v => v.replaces !== url),
		hidden: data.hidden.filter(hidden => hidden !== url),
	});
	/** Add a video (no `id`) or replace the one `id` refers to; returns the new file and the id to select, or an error message. */
	const saveVideo = (data: IVideoFile, msg: IVideoMessage): { data?: IVideoFile; id?: string; error?: string } => {
		const edited = msg.id !== undefined ? target(msg.id, data) : undefined;
		if (msg.id !== undefined && !edited) {
			return {};
		}
		const clean = (s: string | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
		const title = clean(msg.title);
		const description = clean(msg.description);
		let url = clean(msg.url);
		if (!title) {
			return { error: localize('pollis.videos.noTitle', "Enter a title for the video.") };
		}
		if (!/^https?:\/\//i.test(url) && /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(url)) {
			url = 'https://' + url;   // e.g. youtu.be/abc
		}
		if (!/^https?:\/\/\S+$/i.test(url)) {
			return { error: localize('pollis.videos.badLink', "The link must be a web address (https://...).") };
		}
		const video: IStoredVideo = description ? { title, url, description } : { title, url };
		if (edited?.bundled !== undefined) {
			const next = restore(data, edited.bundled);
			next.videos.push({ ...video, replaces: edited.bundled });
			return { data: next, id: msg.id };
		}
		if (edited?.added !== undefined) {
			const videos = [...data.videos];
			videos[edited.added] = video;
			return { data: { ...data, videos }, id: msg.id };
		}
		return { data: { ...data, videos: [...data.videos, video] }, id: `added:${data.videos.length}` };
	};
	/** Remove a video: delete the user's own, or hide a bundled one (dropping any correction of it). */
	const removeVideo = (data: IVideoFile, id: string | undefined): IVideoFile | undefined => {
		const edited = target(id, data);
		if (edited?.added !== undefined) {
			return { ...data, videos: data.videos.filter((_, i) => i !== edited.added) };
		}
		if (edited?.bundled === undefined) {
			return undefined;
		}
		const next = restore(data, edited.bundled);
		next.hidden.push(edited.bundled);
		return next;
	};
	disposables.add(webview.onMessage(async e => {
		const msg = e.message;
		try {
			switch (msg.command) {
				case 'listVideos':
					await postVideos();
					break;
				case 'openVideo': {
					const item = listItems(await readFile()).find(v => v.id === msg.id);
					if (item) {
						await openInBrowser(item.url, commandService);
					}
					break;
				}
				case 'saveVideo': {
					const result = saveVideo(await readFile(), msg);
					if (result.error) {
						webview.postMessage({ command: 'videoSaveFailed', message: result.error });
					} else if (result.data) {
						await writeFile(result.data);
						await postVideos();
						webview.postMessage({ command: 'videoSaved', id: result.id });
					}
					break;
				}
				case 'removeVideo':
				case 'restoreVideo': {
					const data = await readFile();
					const url = target(msg.id, data)?.bundled;
					const next = msg.command === 'removeVideo' ? removeVideo(data, msg.id) : url !== undefined ? restore(data, url) : undefined;
					if (next) {
						await writeFile(next);
					}
					await postVideos();
					break;
				}
			}
		} catch (error) {
			if (msg.command === 'saveVideo') {
				webview.postMessage({ command: 'videoSaveFailed', message: localize('pollis.videos.writeFailed', "Could not save the video in {0}: {1}", file.fsPath, String(error)) });
			} else {
				notificationService.error(localize('pollis.videos.updateFailed', "Could not update your videos in {0}: {1}", file.fsPath, String(error)));
			}
		}
	}));
	void postVideos();
}

export function buildVideoLinks(packages: IModelPackage[]): IModelVideo[] {
	return packages.flatMap(pkg => pkg.videos ?? []);
}

export async function openVideoList(
	packages: IModelPackage[],
	quickInputService: IQuickInputService,
	commandService: ICommandService,
): Promise<void> {
	const allVideos = buildVideoLinks(packages);
	if (allVideos.length === 0) { return; }
	const picked = await quickInputService.pick(
		allVideos.map(v => ({ label: v.title, description: v.description, url: v.url })),
		{ placeHolder: 'Select a video to open' }
	);
	if (picked?.url) { await openInBrowser(picked.url, commandService); }
}

export async function openPackageItem(
	target: 'paper' | 'repository',
	packages: IModelPackage[],
	commandService: ICommandService,
	quickInputService: IQuickInputService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
): Promise<void> {
	if (target === 'repository') {
		const items = packages.map(pkg => ({ label: pkg.name, description: pkg.github, url: pkg.github }));
		if (items.length === 0) { return; }
		const url = items.length === 1
			? items[0].url
			: (await quickInputService.pick(items, { placeHolder: 'Select a package to open' }))?.url;
		if (url) { await openInBrowser(url, commandService); }
		return;
	}

	const allPapers = packages.flatMap(pkg => pkg.papers);
	if (allPapers.length === 0) { return; }

	// Step 1: pick a paper
	const paperPick = await quickInputService.pick(
		allPapers.map(paper => ({
			label: paper.title,
			description: `${paper.authors} · ${paper.year}${paper.openAccess ? ' · Open Access' : ''}${paper.googleScholarCited !== undefined ? ` · ${paper.googleScholarCited.toLocaleString()} citations` : ''}`,
			detail: paper.doi ? `doi: ${paper.doi}` : paper.url,
			paper,
		})),
		{ placeHolder: 'Select a paper' }
	);
	if (!paperPick) { return; }
	const paper = paperPick.paper;

	// Step 2: pick an action — labels use $(icon) syntax so they are always visible
	const actions: { label: string; action: () => Promise<void> }[] = [];
	const url = paperUrl(paper);
	if (url) {
		actions.push({ label: '$(link-external) Open in Browser', action: () => openInBrowser(url, commandService) });
	}
	actions.push({
		label: '$(copy) Copy BibTeX to Clipboard',
		action: async () => {
			await clipboardService.writeText(generateBibTeX(paper));
			notificationService.status('BibTeX copied to clipboard', { hideAfter: 3000 });
		},
	});
	if (paper.googleScholar) {
		const scholarUrl = paper.googleScholar;
		actions.push({ label: '$(search) Show on Google Scholar', action: () => openInBrowser(scholarUrl, commandService) });
	}

	const actionPick = await quickInputService.pick(actions, { placeHolder: paper.title });
	await actionPick?.action();
}

function isReferencePaper(r: IModelReference): r is IModelPaper {
	return !('separator' in r);
}

export async function openReferenceList(
	references: IModelReference[],
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
): Promise<void> {
	const allPapers = references.filter(isReferencePaper);
	if (allPapers.length === 0) { return; }

	type RefPickItem = { label: string; description: string; detail?: string; paper: IModelPaper };
	const items: (RefPickItem | IQuickPickSeparator)[] = references.map(r => {
		if (!isReferencePaper(r)) {
			return { type: 'separator' as const, label: r.label };
		}
		return {
			label: r.title,
			description: `${r.authors} · ${r.year}${r.openAccess ? ' · Open Access' : ''}${r.googleScholarCited !== undefined ? ` · ${r.googleScholarCited.toLocaleString()} citations` : ''}`,
			detail: r.doi ? `doi: ${r.doi}` : r.url,
			paper: r,
		};
	});

	const paperPick = await quickInputService.pick(items, { placeHolder: 'Select a reference' });
	if (!paperPick) { return; }
	const paper = (paperPick as RefPickItem).paper;

	const actions: { label: string; action: () => Promise<void> }[] = [];
	const url = paper.doi ? `https://doi.org/${paper.doi}` : paper.url;
	if (url) {
		actions.push({ label: '$(link-external) Open in Browser', action: () => openInBrowser(url, commandService) });
	}
	actions.push({
		label: '$(copy) Copy BibTeX to Clipboard',
		action: async () => {
			await clipboardService.writeText(generateBibTeX(paper));
			notificationService.status('BibTeX copied to clipboard', { hideAfter: 3000 });
		},
	});
	if (paper.googleScholar) {
		const scholarUrl = paper.googleScholar;
		actions.push({ label: '$(search) Show on Google Scholar', action: () => openInBrowser(scholarUrl, commandService) });
	}

	const actionPick = await quickInputService.pick(actions, { placeHolder: paper.title });
	await actionPick?.action();
}
