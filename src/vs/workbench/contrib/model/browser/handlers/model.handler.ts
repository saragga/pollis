/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { FileAccess, AppResourcePath } from '../../../../../base/common/network.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IQuickInputService, IQuickPickSeparator } from '../../../../../platform/quickinput/common/quickInput.js';
import { IModelPackage, IModelPaper, IModelNotebook, IModelWiki, IModelVideo, IModelReference } from '../common/model.types.js';
import { URI } from '../../../../../base/common/uri.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { disposableTimeout } from '../../../../../base/common/async.js';
import { INotebookKernelService, INotebookTextModelLike } from '../../../notebook/common/notebookKernelService.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';

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
