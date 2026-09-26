/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FileAccess, AppResourcePath } from '../../../../../base/common/network.js';
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
import { INotebookKernelService, INotebookTextModelLike } from '../../../notebook/common/notebookKernelService.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { ISecretStorageService } from '../../../../../platform/secrets/common/secrets.js';
import { IWebviewService } from '../../../webview/browser/webview.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';

const WIKI_BASE     = 'vs/workbench/contrib/model/browser/media/wiki/';
const NOTEBOOK_BASE = 'vs/workbench/contrib/model/browser/media/notebooks/';

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

	const statuses = packageNames.map(displayName => ({ name: displayName, installed: deps.has(juliaPackageName(displayName)) }));
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

/** Install the given packages (display names accepted) via `Pkg.add` in the Julia REPL. */
export async function installJuliaPackages(packageNames: string[], commandService: ICommandService): Promise<void> {
	if (!packageNames.length) { return; }
	const list = packageNames.map(n => `"${juliaPackageName(n)}"`).join(', ');
	await commandService.executeCommand('language-julia.startREPL');
	await commandService.executeCommand('workbench.action.terminal.sendSequence', { text: `import Pkg; Pkg.add([${list}])\n` });
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
	const uri = FileAccess.asFileUri((WIKI_BASE + item.file) as AppResourcePath);
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
	const uri = FileAccess.asFileUri((NOTEBOOK_BASE + item.file) as AppResourcePath);

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
