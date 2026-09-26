/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
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
import { IRequestService } from '../../../../../platform/request/common/request.js';
import { getMermaidUris } from '../../../mermaid/browser/mermaidHelper.js';
import { IHfmMetadata } from '../common/hfm.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { ISecretStorageService } from '../../../../../platform/secrets/common/secrets.js';
import { IWebviewService } from '../../../webview/browser/webview.js';
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
		url: 'https://github.com/cjdoris/HuggingFaceHub.jl',
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
				github: 'https://github.com/cjdoris/HuggingFaceHub.jl',
				papers: [],
			},
			{
				name: 'ONNX.jl',
				github: 'https://github.com/FluxML/ONNX.jl',
				papers: [],
			},
		],
		notebooks: HFM_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		notebookSections: HFM_NOTEBOOK_SECTIONS,
		wikis: [
			{ name: 'Factsheet',        description: 'Architecture overview and quick-start for Hugging Face models in Julia',  file: 'hfm/factsheet.md',        bundled: true },
			{ name: 'Overview',         description: 'Task families, pipeline tags, and the HF model ecosystem',                file: 'hfm/overview.md',         bundled: true },
			{ name: 'Authentication',   description: 'Create and use HF tokens; gated models, the Hub API, and rate limits',    file: 'hfm/access-tokens.md',   bundled: true },
			{ name: 'API Reference',    description: 'Full Hub REST API: model search, metadata, file downloads, Inference API', file: 'hfm/api-reference.md',   bundled: true },
			{ name: 'Download & Load',  description: 'Download weights from the Hub and load them with Transformers.jl',        file: 'hfm/download-load.md',    bundled: true },
			{ name: 'Run Inference',    description: 'Run text, image, audio, and multimodal inference on loaded models',       file: 'hfm/run-inference.md',    bundled: true },
			{ name: 'Choosing a Model', description: 'Pick the right model by task, benchmark, size, and licence',              file: 'hfm/choosing-a-model.md', bundled: true },
			{ name: 'Package Guide',    description: 'Full API reference for Transformers.jl and HuggingFaceHub.jl',            file: 'hfm/package-guide.md',    bundled: true },
			{ separator: true, label: 'Packages' },
			{ name: 'Transformers.jl',  description: 'Architecture reference, inference patterns, GPU, and fine-tuning',        file: 'hfm/transformers-jl.md',  bundled: true },
			{ name: 'ONNX.jl',          description: 'Export HF models to ONNX and run inference in Julia without Python',      file: 'hfm/onnx-jl.md',          bundled: true },
		],
		references: HFM_REFERENCES,
		conceptMap: {
			center: 'Hugging Face Models',
			nodes: [
				{ id: 'root',        label: 'Hugging Face Models',      kind: 'center' },
				{ id: 'q_hub',       label: 'Model Hub & weights',      kind: 'concept' },
				{ id: 'q_task',      label: 'Task families',            kind: 'concept' },
				{ id: 'q_arch',      label: 'Transformer architecture', kind: 'concept' },
				{ id: 'q_fine',      label: 'Fine-tuning & training',   kind: 'concept' },
				{ id: 'load',        label: 'Download & Load',          kind: 'topic', model: 'download' },
				{ id: 'infer',       label: 'Run Inference',            kind: 'topic', model: 'inference' },
				{ id: 'choose',      label: 'Choosing a Model',         kind: 'topic', model: 'choosing' },
				{ id: 'r_trans',     label: 'Transformer Networks',     kind: 'related', command: 'chiara.statistics.nn.transformer' },
				{ id: 'r_embed',     label: 'Embeddings',               kind: 'related', command: 'chiara.statistics.pm.embedding' },
				{ id: 'ext_hf',      label: 'HuggingFaceHub.jl',        kind: 'external', url: 'https://github.com/cjdoris/HuggingFaceHub.jl' },
				{ id: 'ext_trans',   label: 'Transformers.jl',          kind: 'external', url: 'https://github.com/chengchingwen/Transformers.jl' },
			],
			edges: [
				{ from: 'root',    to: 'q_hub',     label: 'accessed via' },
				{ from: 'root',    to: 'q_task',    label: 'organised by' },
				{ from: 'root',    to: 'q_arch',    label: 'built on' },
				{ from: 'root',    to: 'q_fine',    label: 'adapted by' },
				{ from: 'q_hub',   to: 'load',      label: 'downloaded in' },
				{ from: 'q_task',  to: 'infer',     label: 'run in' },
				{ from: 'q_arch',  to: 'choose',    label: 'guides' },
				{ from: 'q_fine',  to: 'choose',    label: 'considered in' },
				{ from: 'q_arch',  to: 'r_trans',   label: 'detailed in' },
				{ from: 'q_task',  to: 'r_embed',   label: 'text repr. in' },
				{ from: 'q_hub',   to: 'ext_hf',    label: 'via' },
				{ from: 'q_arch',  to: 'ext_trans', label: 'loaded with' },
			],
		},
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
	requestService: IRequestService,
	fileService: IFileService,
	pathService: IPathService,
	workspaceContextService: IWorkspaceContextService,
	secretStorageService: ISecretStorageService,
	webviewService: IWebviewService,
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
		requestService,
		fileService,
		pathService,
		workspaceContextService,
		secretStorageService,
		webviewService,
		initialModel,
	);
}
