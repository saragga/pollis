/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { getMermaidUris } from '../../../mermaid/browser/mermaidHelper.js';
import { IHfmMetadata } from '../common/hfm.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerHfmWebviewHandlers } from '../handlers/hfm.handler.js';
import { getHfmHtml } from '../webviews/hfm.template.js';

const HFM_VIEW_TYPE = 'pollis.hfm';
const HFM_TITLE = 'Hugging Face Models';

const HFM_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Julia: A Fresh Approach to Numerical Computing',
		authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/141000671',
		openAccess: false,
	},
	{
		title: 'Transformers.jl: Transformers in Julia',
		authors: 'Cheng, Ching-Wen',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/chengchingwen/Transformers.jl',
		openAccess: true,
	},
	{
		title: 'HuggingFaceHub.jl: Julia Interface to the Hugging Face Hub',
		authors: 'JuliaML contributors',
		year: 2024,
		journal: 'GitHub',
		url: 'https://github.com/JuliaML/HuggingFaceHub.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Foundational Papers' },
	{
		title: 'Attention Is All You Need',
		authors: 'Vaswani, Ashish; Shazeer, Noam; Parmar, Niki; Uszkoreit, Jakob; Jones, Llion; Gomez, Aidan N.; Kaiser, Lukasz; Polosukhin, Illia',
		year: 2017,
		journal: 'NeurIPS',
		url: 'https://arxiv.org/abs/1706.03762',
		openAccess: true,
	},
	{
		title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
		authors: 'Devlin, Jacob; Chang, Ming-Wei; Lee, Kenton; Toutanova, Kristina',
		year: 2019,
		journal: 'NAACL-HLT',
		url: 'https://arxiv.org/abs/1810.04805',
		openAccess: true,
	},
];

const HFM_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Getting Started',
		notebooks: [
			{
				name: 'Load a Model',
				file: 'hfm/tutorial-01-load-model.ipynb',
				bundled: true as const,
				description: 'Download and load any Hugging Face model in Julia via Transformers.jl',
			},
			{
				name: 'Run Inference',
				file: 'hfm/tutorial-02-inference.ipynb',
				bundled: true as const,
				description: 'Run text, image and audio inference with pre-trained HF models',
			},
		],
	},
];

const HFM_METADATA: IHfmMetadata = {
	hfm: {
		packages: [
			{
				name: 'Transformers.jl',
				github: 'https://github.com/chengchingwen/Transformers.jl',
				papers: [],
			},
			{
				name: 'HuggingFaceHub.jl',
				github: 'https://github.com/JuliaML/HuggingFaceHub.jl',
				papers: [],
			},
		],
		notebooks: HFM_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		notebookSections: HFM_NOTEBOOK_SECTIONS,
		wikis: [
			{ name: 'Factsheet',        file: 'hfm/factsheet.md',         bundled: true },
			{ name: 'Overview',         file: 'hfm/overview.md',          bundled: true },
			{ name: 'Download & Load',  file: 'hfm/download-load.md',     bundled: true },
			{ name: 'Run Inference',    file: 'hfm/run-inference.md',     bundled: true },
			{ name: 'Choosing a Model', file: 'hfm/choosing-a-model.md',  bundled: true },
			{ name: 'Package Guide',    file: 'hfm/package-guide.md',     bundled: true },
			{ separator: true, label: 'Packages' },
			{ name: 'Transformers.jl',  file: 'hfm/transformers-jl.md',   bundled: true },
		],
		references: HFM_REFERENCES,
	},
};

export function openHfmWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	notebookEditorModelResolverService: INotebookEditorModelResolverService,
	notebookKernelService: INotebookKernelService,
	languageService: ILanguageService,
	themeService: IThemeService,
	initialModel?: string,
): void {
	const mermaid = getMermaidUris();

	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: HFM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: {
				allowScripts: true,
				localResourceRoots: [mermaid.distRoot],
			},
			extension: undefined,
		},
		HFM_VIEW_TYPE,
		HFM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getHfmHtml(mermaid.js));

	registerHfmWebviewHandlers(
		webviewInput,
		HFM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		notebookEditorModelResolverService,
		notebookKernelService,
		languageService,
		themeService,
		initialModel,
	);
}
