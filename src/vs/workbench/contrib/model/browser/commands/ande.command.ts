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
import { IAndeMetadata } from '../common/ande.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerAndeWebviewHandlers } from '../handlers/ande.handler.js';
import { getAndeHtml } from '../webviews/ande.template.js';

const ANDE_VIEW_TYPE = 'pollis.ande';
const ANDE_TITLE = 'Learning-Based Anomaly Detection';

const ANDE_REFERENCES: IModelReference[] = [
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
		title: 'OutlierDetectionNetworks.jl: Neural Outlier Detection in Julia',
		authors: 'Muhr, David',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/OutlierDetectionJL/OutlierDetectionNetworks.jl',
		openAccess: true,
	},
	{
		title: 'IsolationTrees.jl: Isolation Forest in Julia',
		authors: 'Julia Contributors',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/davidbp/IsolationTrees.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Outlier Analysis',
		authors: 'Aggarwal, Charu C.',
		year: 2017,
		journal: 'Springer (2nd ed.)',
		doi: '10.1007/978-3-319-47578-3',
		openAccess: false,
	},
	{
		title: 'Deep Learning',
		authors: 'Goodfellow, Ian; Bengio, Yoshua; Courville, Aaron',
		year: 2016,
		journal: 'MIT Press',
		url: 'https://www.deeplearningbook.org/',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Isolation Forest',
		authors: 'Liu, Fei Tony; Ting, Kai Ming; Zhou, Zhi-Hua',
		year: 2008,
		journal: 'IEEE ICDM',
		doi: '10.1109/ICDM.2008.17',
		openAccess: false,
	},
	{
		title: 'Deep One-Class Classification',
		authors: 'Ruff, Lukas; Vandermeulen, Robert A.; Goernitz, Nico; Deecke, Lucas; Siddiqui, Shoaib Ahmed; Binder, Alexander; Mueller, Emmanuel; Kloft, Marius',
		year: 2018,
		journal: 'ICML',
		url: 'https://arxiv.org/abs/1801.05365',
		openAccess: true,
	},
	{
		title: 'Deep SAD: A Method for Deep Semi-Supervised Anomaly Detection',
		authors: 'Ruff, Lukas; Vandermeulen, Robert A.; Franks, Billy Joe; Mueller, Emmanuel; Kloft, Marius',
		year: 2020,
		journal: 'ICLR',
		url: 'https://arxiv.org/abs/1906.02694',
		openAccess: true,
	},
	{
		title: 'ESAD: End-to-End Deep Semi-Supervised Anomaly Detection',
		authors: 'Huang, Chaoqin; Ye, Fei; Zhang, Ya; Wang, Yan-Feng; Tian, Qi',
		year: 2021,
		journal: 'arXiv',
		url: 'https://arxiv.org/abs/2012.04905',
		openAccess: true,
	},
];

const ANDE_NOTEBOOK_SECTIONS = [
	{
		label: 'Basic',
		notebooks: [
			{
				name: 'Isolation Forest',
				file: 'ande/tutorial-01-isolation-forest.ipynb',
				bundled: true as const,
				description: 'Detect anomalies using random recursive partitioning with IsolationTrees.jl',
			},
			{
				name: 'AutoEncoder Anomaly',
				file: 'ande/tutorial-02-autoencoder.ipynb',
				bundled: true as const,
				description: 'Use reconstruction error from a trained autoencoder as an anomaly score',
			},
		],
	},
	{
		label: 'Advanced',
		notebooks: [
			{
				name: 'DeepSAD and ESAD',
				file: 'ande/tutorial-03-deepsad-esad.ipynb',
				bundled: true as const,
				description: 'Semi-supervised anomaly detection with a small set of known anomaly labels',
			},
		],
	},
];

const ANDE_METADATA: IAndeMetadata = {
	ande: {
		packages: [
			{
				name: 'IsolationTrees.jl',
				github: 'https://github.com/davidbp/IsolationTrees.jl',
				papers: [],
			},
			{
				name: 'OutlierDetectionNetworks.jl',
				github: 'https://github.com/OutlierDetectionJL/OutlierDetectionNetworks.jl',
				papers: [],
			},
			{
				name: 'Lux.jl',
				github: 'https://github.com/LuxDL/Lux.jl',
				papers: [],
			},
		],
		notebooks: ANDE_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		notebookSections: ANDE_NOTEBOOK_SECTIONS,
		wikis: [
			{ name: 'Factsheet',         file: 'ande/factsheet.md',          bundled: true },
			{ name: 'Overview',          file: 'ande/overview.md',           bundled: true },
			{ name: 'Assumptions',       file: 'ande/assumptions.md',        bundled: true },
			{ name: 'Diagnostics',       file: 'ande/diagnostics.md',        bundled: true },
			{ name: 'Interpretation',    file: 'ande/interpretation.md',     bundled: true },
			{ name: 'Decision Guide',    file: 'ande/decision-guide.md',     bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Isolation Forest',  file: 'ande/isolation-forest.md',   bundled: true },
			{ name: 'AutoEncoder',       file: 'ande/autoencoder.md',        bundled: true },
			{ name: 'DeepSAD',           file: 'ande/deepsad.md',            bundled: true },
			{ name: 'ESAD',              file: 'ande/esad.md',               bundled: true },
		],
		references: ANDE_REFERENCES,
	},
};

export function openAndeWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	initialModel?: string,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: ANDE_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		ANDE_VIEW_TYPE,
		ANDE_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getAndeHtml());

	registerAndeWebviewHandlers(
		webviewInput,
		ANDE_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
