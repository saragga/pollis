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
import { IRequestService } from '../../../../../platform/request/common/request.js';
import { getMermaidUris } from '../../../mermaid/browser/mermaidHelper.js';
import { IKgmMetadata } from '../common/kgm.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerKgmWebviewHandlers } from '../handlers/kgm.handler.js';
import { getKgmHtml } from '../webviews/kgm.template.js';

const KGM_VIEW_TYPE = 'pollis.kgm';
const KGM_TITLE = 'Kaggle Models';

const KGM_REFERENCES: IModelReference[] = [
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
		title: 'Flux.jl: Relax! High-Level Machine Learning on Julia',
		authors: 'Innes, Mike',
		year: 2018,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.00602',
		openAccess: true,
	},
	{ separator: true, label: 'Foundational Papers' },
	{
		title: 'Deep Residual Learning for Image Recognition',
		authors: 'He, Kaiming; Zhang, Xiangyu; Ren, Shaoqing; Sun, Jian',
		year: 2016,
		journal: 'CVPR',
		url: 'https://arxiv.org/abs/1512.03385',
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

const KGM_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Getting Started',
		notebooks: [
			{
				name: 'Load a Kaggle Model',
				file: 'kgm/tutorial-01-load-model.ipynb',
				bundled: true as const,
				description: 'Download and load a Kaggle model in Julia via ONNX.jl or Flux.jl',
			},
			{
				name: 'Run Inference',
				file: 'kgm/tutorial-02-inference.ipynb',
				bundled: true as const,
				description: 'Run inference on Kaggle models across vision, NLP, tabular, and RL tasks',
			},
		],
	},
];

const KGM_METADATA: IKgmMetadata = {
	kgm: {
		packages: [
			{
				name: 'Flux.jl',
				github: 'https://github.com/FluxML/Flux.jl',
				papers: [],
			},
			{
				name: 'ONNX.jl',
				github: 'https://github.com/FluxML/ONNX.jl',
				papers: [],
			},
		],
		notebooks: KGM_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		notebookSections: KGM_NOTEBOOK_SECTIONS,
		wikis: [
			{ name: 'Factsheet',        description: 'Architecture overview and quick-start for Kaggle models in Julia',    file: 'kgm/factsheet.md',        bundled: true },
			{ name: 'Overview',         description: 'Task families, frameworks, and the Kaggle model ecosystem',           file: 'kgm/overview.md',         bundled: true },
			{ name: 'Authentication',   description: 'Create, install, and use your Kaggle API key securely',               file: 'kgm/api-key.md',          bundled: true },
			{ name: 'API Reference',    description: 'Full Kaggle REST API: model search, metadata, instances, and downloads', file: 'kgm/api-reference.md',    bundled: true },
			{ name: 'Download & Load',  description: 'Download model weights from Kaggle and load them in Julia',           file: 'kgm/download-load.md',    bundled: true },
			{ name: 'Run Inference',    description: 'Run inference on loaded Kaggle models in Julia',                      file: 'kgm/run-inference.md',    bundled: true },
			{ name: 'Choosing a Model', description: 'Pick the right model by task, framework, benchmark, and licence',     file: 'kgm/choosing-a-model.md', bundled: true },
			{ name: 'Package Guide',    description: 'Full API reference for Flux.jl and ONNX.jl',                          file: 'kgm/package-guide.md',    bundled: true },
			{ separator: true, label: 'Packages' },
			{ name: 'Flux.jl',          description: 'Neural network library: layers, training, GPU support',               file: 'kgm/flux-jl.md',          bundled: true },
			{ name: 'ONNX.jl',          description: 'Load ONNX model files exported from PyTorch or TensorFlow',           file: 'kgm/onnx-jl.md',          bundled: true },
		],
		references: KGM_REFERENCES,
		conceptMap: {
			center: 'Kaggle Models',
			nodes: [
				{ id: 'root',       label: 'Kaggle Models',            kind: 'center' },
				{ id: 'q_hub',      label: 'Model Hub & weights',      kind: 'concept' },
				{ id: 'q_task',     label: 'Task families',            kind: 'concept' },
				{ id: 'q_fw',       label: 'Framework formats',        kind: 'concept' },
				{ id: 'load',       label: 'Download & Load',          kind: 'topic', model: 'explore' },
				{ id: 'infer',      label: 'Run Inference',            kind: 'topic', model: 'explore' },
				{ id: 'r_hfm',      label: 'Hugging Face Models',      kind: 'related', command: 'chiara.statistics.ml.hfm' },
				{ id: 'ext_kaggle', label: 'Kaggle Models Hub',        kind: 'external', url: 'https://www.kaggle.com/models' },
				{ id: 'ext_flux',   label: 'Flux.jl',                  kind: 'external', url: 'https://github.com/FluxML/Flux.jl' },
				{ id: 'ext_onnx',   label: 'ONNX.jl',                  kind: 'external', url: 'https://github.com/FluxML/ONNX.jl' },
			],
			edges: [
				{ from: 'root',    to: 'q_hub',      label: 'accessed via' },
				{ from: 'root',    to: 'q_task',     label: 'organised by' },
				{ from: 'root',    to: 'q_fw',       label: 'exported as' },
				{ from: 'q_hub',   to: 'load',       label: 'downloaded in' },
				{ from: 'q_task',  to: 'infer',      label: 'run in' },
				{ from: 'q_fw',    to: 'ext_onnx',   label: 'loaded with' },
				{ from: 'q_fw',    to: 'ext_flux',   label: 'trained with' },
				{ from: 'root',    to: 'r_hfm',      label: 'compare with' },
				{ from: 'q_hub',   to: 'ext_kaggle', label: 'via' },
			],
		},
	},
};

export function openKgmWebview(
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
	initialModel?: string,
): void {
	const mermaid = getMermaidUris();

	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: KGM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: {
				allowScripts: true,
				localResourceRoots: [mermaid.distRoot],
			},
			extension: undefined,
		},
		KGM_VIEW_TYPE,
		KGM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getKgmHtml(mermaid.js));

	registerKgmWebviewHandlers(
		webviewInput,
		KGM_METADATA,
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
		initialModel,
	);
}