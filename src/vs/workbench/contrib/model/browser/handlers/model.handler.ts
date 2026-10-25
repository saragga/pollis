/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
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
import { FileSystemProviderCapabilities, IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { customCopyOverlayUri, customCopyUri, CustomCopyKind } from '../common/customCopyFileSystem.js';
import { ISecretStorageService } from '../../../../../platform/secrets/common/secrets.js';
import { IWebviewService } from '../../../webview/browser/webview.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IReference, ReferenceLibrary, referenceBibTeX, referenceOfBibTeX, referencePaper, referencesFolderOf } from '../common/referenceLibrary.js';
import { normaliseBibText, parseBibTeX } from '../common/referenceImport.js';

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

/** The BibTeX field of the venue, by entry type. */
function venueField(type: string): string {
	switch (type) {
		case 'article': return 'journal';
		case 'inproceedings': case 'incollection': return 'booktitle';
		case 'techreport': return 'institution';
		case 'misc': return 'howpublished';
		default: return 'publisher';
	}
}

function generateBibTeX(paper: IModelPaper): string {
	const type = paper.type ?? 'article';
	const lines = [`@${type}{${paper.key ?? bibKey(paper)},`];
	lines.push(`  author  = {${paper.authors.replace(/;\s*/g, ' and ')}},`);
	lines.push(`  title   = {${paper.title}},`);
	lines.push(`  year    = {${paper.year}},`);
	if (paper.journal) { lines.push(`  ${venueField(type).padEnd(7)} = {${paper.journal}},`); }
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

/**
 * The `Pollis.packages(...)` call (Pollis.jl, defined in every Pollis REPL and notebook kernel) that
 * installs whichever of the packages the running Julia cannot load, and does nothing when all are
 * there. Julia itself decides what is missing, so it is exact for whatever environment is active. A
 * package with a Powered-by link is passed with it, for when no registry has it; forks always come
 * from their link.
 */
function juliaPackageCheck(packages: ReadonlyArray<{ readonly name: string; readonly github?: string; readonly fork?: boolean }>): string {
	const names = packages.map(p => p.github ? `"${juliaPackageName(p.name)}" => "${p.github}"` : `"${juliaPackageName(p.name)}"`);
	const forks = packages.filter(p => p.fork).map(p => `"${juliaPackageName(p.name)}"`);
	return `Pollis.packages(${names.join(', ')}${forks.length ? `; forks = [${forks.join(', ')}]` : ''})`;
}

/**
 * Install the given packages (display names accepted) in the Julia REPL with `Pollis.packages`: a
 * registered package by name, an unregistered one or a fork from its Powered-by link.
 */
export async function installJuliaPackages(packages: ReadonlyArray<{ readonly name: string; readonly github?: string; readonly fork?: boolean }>, commandService: ICommandService): Promise<void> {
	if (!packages.length) { return; }
	await sendToJuliaRepl(juliaPackageCheck(packages), commandService);
}

/** Reusable wiring for the Powered-by package install-status indicator. */
export interface IPackageStatusWiring {
	/** Post current install status to the webview; resolves true if every package is installed. */
	postStatus(): Promise<boolean>;
	/** Re-post status every 5s (up to ~6 min) until all installed — Pkg.add rewrites Project.toml on completion. */
	scheduleRecheck(attempt?: number): void;
	/** Handle the webview's `installPackages` message: install the missing packages, then poll to flip the icon green. */
	handleInstall(): Promise<void>;
	/**
	 * The code to send to a runCode target: for an executing one (juliaRepl / notebook), the code with a
	 * first line that installs the missing packages (see `juliaPackageCheck`); otherwise the code unchanged.
	 */
	withPackageCheck(code: string, target: string | undefined): string;
}

/**
 * Build the package install-status wiring shared by every TOML/scaffold webview. Each handler calls
 * `postStatus()` once in its open `setTimeout`, routes the `installPackages` message to `handleInstall()`,
 * and sends `withPackageCheck(code, target)` from its `runCode` case. Detection is silent (reads
 * Project.toml — see `checkJuliaPackagesInstalled`); no Julia is run until the user opts in.
 */
export function createPackageStatusWiring(
	webview: { postMessage(message: unknown): void },
	disposables: DisposableStore,
	packages: readonly IModelPackage[],
	requires: readonly string[],
	fileService: IFileService,
	pathService: IPathService,
	commandService: ICommandService,
	workspaceContextService: IWorkspaceContextService,
): IPackageStatusWiring {
	const packageDisplayNames = [...new Set([...packages.map(p => p.name), ...requires])];
	const postStatus = async (): Promise<boolean> => {
		const { statuses, env } = await checkJuliaPackagesInstalled(packageDisplayNames, fileService, pathService, workspaceContextService);
		webview.postMessage({ command: 'packageStatus', statuses, env });
		return statuses.every(s => s.installed);
	};
	let rechecking = false;
	const scheduleRecheck = (attempt: number = 0): void => {
		// One poll at a time: each run of the code would otherwise start another.
		if (attempt === 0 && rechecking) { return; }
		if (attempt > 72) { rechecking = false; return; } // ~6 minutes at 5s intervals
		rechecking = true;
		disposables.add(disposableTimeout(async () => {
			const allInstalled = await postStatus();
			if (allInstalled) { rechecking = false; } else { scheduleRecheck(attempt + 1); }
		}, 5000));
	};
	const missingPackages = async (): Promise<Array<{ name: string; github?: string; fork?: boolean }>> => {
		const { statuses } = await checkJuliaPackagesInstalled(packageDisplayNames, fileService, pathService, workspaceContextService);
		// A fork may already be present from the registry, so it is always (re)added from its link when anything is installed
		const anyMissing = statuses.some(s => !s.installed);
		return statuses.filter(s => !s.installed || (anyMissing && packages.some(p => p.name === s.name && p.fork))).map(s => {
			const pkg = packages.find(p => p.name === s.name);
			return { name: s.name, github: pkg?.github, fork: pkg?.fork };
		});
	};
	const handleInstall = async (): Promise<void> => {
		await installJuliaPackages(await missingPackages(), commandService);
		scheduleRecheck(0);
	};
	const withPackageCheck = (code: string, target: string | undefined): string => {
		// Only the targets that actually execute code need the packages present.
		if ((target !== 'juliaRepl' && target !== 'notebook') || !packageDisplayNames.length) { return code; }
		// Pkg.add rewrites Project.toml when it finishes, so poll to flip the indicator green.
		scheduleRecheck(0);
		return juliaPackageCheck(packageDisplayNames.map(name => {
			const pkg = packages.find(p => p.name === name);
			return { name, github: pkg?.github, fork: pkg?.fork };
		})) + '\n' + code;
	};
	return { postStatus, scheduleRecheck, handleInstall, withPackageCheck };
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

/** A provider that requires a free API key / token / credentials. */
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
	/** The name of a tab the user added (`saveAddedTab` / `removeAddedTab`). */
	readonly name?: string;
}

/**
 * Wire the Edit / Save / Restore Default buttons of a scaffold webview's code boxes.
 * Customised examples are plain Julia files in `~/.pollis/examples/<panelId>/<model>.jl` (main box
 * tabs) and `~/.pollis/examples/<panelId>/next-steps/<id>.jl` (Next Steps examples), outside the
 * application, so they survive updates, work in compiled builds and can be copied between
 * machines (e.g. a teacher handing out a set of examples). An example without a file shows the
 * generated default. Tabs the user adds to the main box are `~/.pollis/examples/<panelId>/added/<name>.jl`,
 * shown in the order they were created; removing one moves its file to the Trash.
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
	const addedFolder = URI.joinPath(folder, 'added');
	const isExampleId = (id: string) => /^[\w-]+$/.test(id);
	// The same rule as the webview's name box: also a safe file name on every platform
	const isAddedName = (name: string) => /^[A-Za-z0-9][\w .()-]{0,39}$/.test(name) && !/[ .]$/.test(name);
	const readAddedTabs = async (): Promise<{ name: string; code: string }[]> => {
		if (!await fileService.exists(addedFolder)) {
			return [];
		}
		const stat = await fileService.resolve(addedFolder, { resolveMetadata: true });
		const files = (stat.children ?? []).filter(c => !c.isDirectory && c.name.endsWith('.jl') && isAddedName(c.name.replace(/\.jl$/, '')));
		files.sort((a, b) => a.ctime - b.ctime);
		const tabs: { name: string; code: string }[] = [];
		for (const file of files) {
			tabs.push({ name: file.name.replace(/\.jl$/, ''), code: (await fileService.readFile(file.resource)).value.toString().replace(/\s+$/, '') });
		}
		return tabs;
	};
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
		webview.postMessage({ command: 'customExamples', examples: await readExamples(folder), steps: await readExamples(stepsFolder), added: await readAddedTabs() });
	};
	disposables.add(webview.onMessage(async e => {
		const msg = e.message;
		if (msg.command === 'saveAddedTab' || msg.command === 'removeAddedTab') {
			if (typeof msg.name !== 'string' || !isAddedName(msg.name)) {
				return;
			}
			const file = URI.joinPath(addedFolder, `${msg.name}.jl`);
			try {
				if (msg.command === 'saveAddedTab' && typeof msg.code === 'string') {
					await fileService.writeFile(file, VSBuffer.fromString(msg.code ? msg.code + '\n' : ''));
				} else if (msg.command === 'removeAddedTab' && await fileService.exists(file)) {
					await fileService.del(file, { useTrash: fileService.hasCapability(file, FileSystemProviderCapabilities.Trash) });
				}
			} catch (error) {
				notificationService.error(localize('pollis.exampleCode.addedTabFailed', "Could not update the tab in {0}: {1}", file.fsPath, String(error)));
			}
			await postExamples();
			return;
		}
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
				await fileService.del(file, { useTrash: fileService.hasCapability(file, FileSystemProviderCapabilities.Trash) });
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

/**
 * Field of an entry of a former `<panel>.bib` file that replaced a bundled reference (the user's corrected version of
 * it), holding that reference's title.
 */
const REPLACES_FIELD = 'pollis-replaces';

/** A reference as shown in the Explore References panel. */
interface IReferenceItem {
	/** `ref:<key>`, the work's key in References. */
	readonly id: string;
	readonly title: string;
	readonly authors: string;
	readonly year: string;
	readonly journal?: string;
	readonly openAccess: boolean;
	/** `bundled`: one of the panel's; `customised`: one of the panel's the user corrected; `added`: one the user added to the panel. */
	readonly kind: 'bundled' | 'customised' | 'added';
	/** One of the panel's the user hid (until restored). */
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

/** The fields of a work no BibTeX entry has, kept when the user corrects it. */
const NON_BIBTEX_FIELDS = ['abstract', 'abstract_source', 'keywords', 'keywords_source', 'openalex', 'oa_url', 'open_access', 'released', 'checked', 'legacy_key', 'pollis_key'] as const;

/** The migrations of the panels' former `<panel>.bib` files, by panel, so that two windows do not migrate one twice. */
const bibMigrations = new Map<string, Promise<void>>();

/**
 * Wire the Explore References panel of a scaffold webview. Its references are the panel's own and those the user added
 * to it, read from References (see referenceLibrary.ts): a work Pollis has, as the user may have corrected it, or one
 * of the user's. Edit corrects a work everywhere it is cited, keeping its key; Restore Default drops the correction.
 * Add finds the work in References and only adds it to the panel, or else makes it one of the user's, with a key in
 * Pollis' convention. Remove hides one of the panel's own (Restore brings it back) or takes an added one off the
 * panel; the work stays in References. What the panel shows is kept in ~/.pollis/references/panels.jsonl. A panel's
 * former `<panel>.bib` file is read into References once, then renamed `<panel>.bib.migrated`.
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
	const userHome = pathService.userHome({ preferLocal: true });
	const library = new ReferenceLibrary(fileService, userHome);
	const folder = referencesFolderOf(userHome);
	const papers = references.filter(isReferencePaper);
	const panelKeys = new Set(papers.flatMap(paper => paper.key ? [paper.key] : []));

	const workItem = (work: IReference, kind: IReferenceItem['kind'], removed: boolean): IReferenceItem => {
		const paper = referencePaper(work);
		return { id: `ref:${work.key}`, title: paper.title, authors: paper.authors, year: paper.year ? String(paper.year) : '', journal: paper.journal, openAccess: paper.openAccess, kind, removed, url: paperUrl(paper), bibtex: referenceBibTeX(work) };
	};
	const listItems = async (): Promise<IReferenceItem[]> => {
		const [all, choices, aliases] = await Promise.all([library.allReferences(), library.panelChoices(panelId), library.aliases()]);
		const byKey = new Map(all.map(work => [work.key, work]));
		// A key merged into another work is that work, listed once
		const listed = new Set<string>();
		const items = papers.flatMap((paper): IReferenceItem[] => {
			const key = paper.key && (aliases.get(paper.key) ?? paper.key);
			if (key) {
				if (listed.has(key)) {
					return [];
				}
				listed.add(key);
			}
			const work = key ? byKey.get(key) : undefined;
			const removed = !!key && choices.get(key)?.shown === false;
			return [work
				? workItem(work, work.origin === 'corrected' ? 'customised' : 'bundled', removed)
				: { id: `ref:${paper.key ?? paper.title}`, title: paper.title, authors: paper.authors, year: String(paper.year), journal: paper.journal, openAccess: paper.openAccess, kind: 'bundled', removed, url: paperUrl(paper), bibtex: generateBibTeX(paper) }];
		});
		for (const choice of choices.values()) {
			const work = byKey.get(choice.key);
			if (choice.shown && work && !listed.has(choice.key)) {
				items.push(workItem(work, 'added', false));
			}
		}
		return items;
	};
	const postReferences = async (): Promise<void> => {
		let items: IReferenceItem[] = [];
		try {
			await migrateBib();
			items = await listItems();
		} catch (error) {
			notificationService.error(localize('pollis.references.readFailed', "Could not read your references in {0}: {1}", folder.fsPath, String(error)));
		}
		webview.postMessage({ command: 'references', references: items });
	};
	const keyOf = (id: string | undefined): string | undefined => id?.startsWith('ref:') ? id.slice('ref:'.length) : undefined;

	/** The work a pasted BibTeX entry, or a reference entered by hand, is; or an error message. */
	const worksOf = (msg: IReferenceMessage): { works?: Omit<IReference, 'key'>[]; error?: string } => {
		const bibtex = msg.bibtex ?? '';
		if (bibtex.trim()) {
			const pasted = parseBibTeX(bibtex).entries;
			if (!pasted.length || pasted.some(entry => !entry.fields.title)) {
				return { error: localize('pollis.references.badBibtex', "Could not read the BibTeX: every entry needs to look like @article{key, title = {...}, ...}.") };
			}
			return { works: pasted.map(entry => referenceOfBibTeX('', entry.type, entry.fields, entry.key)) };
		}
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
		const fields: Record<string, string> = { title, author: authors.split(/\s*;\s*/).filter(name => name).join(' and '), year };
		if (doi) {
			fields.doi = doi;
		} else if (link) {
			fields.url = link;
		}
		return { works: [referenceOfBibTeX('', 'misc', fields)] };
	};
	/** Add `work` to the panel: the work References has, or else a new work of the user's; returns its key. */
	const addWork = async (work: Omit<IReference, 'key'>): Promise<string> => {
		const found = await library.find({ title: work.title, authors: work.authors ?? [], doi: work.doi, arxiv: work.arxiv });
		let key = found?.key;
		if (!key) {
			key = await library.newKey(work);
			await library.saveReference({ ...work, key });
		}
		if (!panelKeys.has(key) || (await library.panelChoices(panelId)).get(key)?.shown === false) {
			await library.choose(panelId, key, true);
		}
		return key;
	};
	/** Correct the work `base` with `work`, keeping its key and what no BibTeX entry has. */
	const correct = async (base: IReference, work: Omit<IReference, 'key'>): Promise<void> => {
		const kept = Object.fromEntries(NON_BIBTEX_FIELDS.map(field => [field, base[field]]));
		// An organisation's name, its braces gone, reads as a person's
		const organisation = base.author_kind === 'organisation' && work.authors?.length === 1 && normaliseBibText(work.authors[0].split(', ').reverse().join(' ')) === normaliseBibText(base.authors?.[0] ?? '');
		await library.saveReference({ ...kept, ...work, key: base.key, ...organisation ? { authors: base.authors, author_kind: 'organisation' } : {}, source: 'manual' });
	};
	/** Add references (no `id`) or correct the one `id` refers to; returns the id to select, or an error message. */
	const saveReference = async (msg: IReferenceMessage): Promise<{ id?: string; error?: string }> => {
		const result = worksOf(msg);
		if (!result.works) {
			return { error: result.error };
		}
		const key = keyOf(msg.id);
		if (key === undefined) {
			let added: string | undefined;
			for (const work of result.works) {
				added = await addWork(work);
			}
			return { id: `ref:${added}` };
		}
		if (result.works.length !== 1) {
			return { error: localize('pollis.references.editOne', "A reference is replaced by exactly one BibTeX entry.") };
		}
		const base = (await library.allReferences()).find(work => work.key === key);
		if (base) {
			await correct(base, result.works[0]);
		}
		return { id: msg.id };
	};
	/** Restore a hidden reference of the panel's; or, Restore Default, drop the user's correction of one. */
	const restoreReference = async (id: string | undefined): Promise<void> => {
		const key = keyOf(id);
		if (key === undefined) {
			return;
		}
		if ((await library.panelChoices(panelId)).get(key)?.shown === false) {
			await library.choose(panelId, key, true);
		} else if ((await library.pollis()).references.some(work => work.key === key)) {
			await library.removeReference(key);
		}
	};
	/** Remove a reference from the panel: hide one of its own, or take off one the user added. */
	const removeReference = async (id: string | undefined): Promise<void> => {
		const key = keyOf(id);
		if (key !== undefined) {
			await library.choose(panelId, key, false);
		}
	};

	/** Read the panel's former `<panel>.bib`, if any, into References, and rename it `<panel>.bib.migrated`. */
	const migrateBib = (): Promise<void> => {
		let migration = bibMigrations.get(panelId);
		if (!migration) {
			migration = (async () => {
				const file = URI.joinPath(folder, `${panelId}.bib`);
				if (!await fileService.exists(file)) {
					return;
				}
				const { entries, hidden } = parseBibTeX((await fileService.readFile(file)).value.toString());
				const all = await library.allReferences();
				const paperOf = (title: string) => papers.find(paper => paper.key && normaliseBibText(paper.title) === title);
				for (const entry of entries) {
					const work = referenceOfBibTeX('', entry.type, entry.fields, entry.key);
					const replaced = entry.fields[REPLACES_FIELD] !== undefined ? paperOf(entry.fields[REPLACES_FIELD]) : undefined;
					const base = replaced && all.find(reference => reference.key === replaced.key);
					if (base) {
						await correct(base, work);
					} else {
						await addWork(work);
					}
				}
				for (const hide of hidden) {
					const paper = paperOf(hide.title);
					if (paper?.key) {
						await library.choose(panelId, paper.key, false);
					}
				}
				await fileService.move(file, URI.joinPath(folder, `${panelId}.bib.migrated`), true);
			})();
			bibMigrations.set(panelId, migration);
		}
		return migration;
	};

	disposables.add(webview.onMessage(async e => {
		const msg = e.message;
		try {
			switch (msg.command) {
				case 'listReferences':
					await postReferences();
					break;
				case 'openReference': {
					const item = (await listItems()).find(r => r.id === msg.id);
					if (item?.url) {
						await openInBrowser(item.url, commandService);
					}
					break;
				}
				case 'saveReference': {
					const result = await saveReference(msg);
					if (result.error) {
						webview.postMessage({ command: 'referenceSaveFailed', message: result.error });
					} else if (result.id !== undefined) {
						await postReferences();
						webview.postMessage({ command: 'referenceSaved', id: result.id });
					}
					break;
				}
				case 'removeReference':
				case 'restoreReference':
					await (msg.command === 'removeReference' ? removeReference(msg.id) : restoreReference(msg.id));
					await postReferences();
					break;
			}
		} catch (error) {
			if (msg.command === 'saveReference') {
				webview.postMessage({ command: 'referenceSaveFailed', message: localize('pollis.references.writeFailed', "Could not save the reference in {0}: {1}", folder.fsPath, String(error)) });
			} else {
				notificationService.error(localize('pollis.references.updateFailed', "Could not update your references in {0}: {1}", folder.fsPath, String(error)));
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
