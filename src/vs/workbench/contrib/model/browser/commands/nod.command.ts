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
import { INodMetadata } from '../common/nod.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerNodWebviewHandlers } from '../handlers/nod.handler.js';
import { getNodHtml } from '../webviews/nod.template.js';

const NOD_VIEW_TYPE = 'pollis.nod';
const NOD_TITLE = 'Proximity-Based Outlier Detection';

const NOD_REFERENCES: IModelReference[] = [
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
		title: 'OutlierDetection.jl: Scalable Outlier Detection in Julia',
		authors: 'Muhr, David; Affenzeller, Michael',
		year: 2022,
		journal: 'GitHub',
		url: 'https://github.com/OutlierDetectionJL/OutlierDetection.jl',
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
		title: 'Anomaly Detection: A Survey',
		authors: 'Chandola, Varun; Banerjee, Arindam; Kumar, Vipin',
		year: 2009,
		journal: 'ACM Computing Surveys',
		doi: '10.1145/1541880.1541882',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'LOF: Identifying Density-Based Local Outliers',
		authors: 'Breunig, Markus M.; Kriegel, Hans-Peter; Ng, Raymond T.; Sander, Joerg',
		year: 2000,
		journal: 'ACM SIGMOD',
		doi: '10.1145/342009.335388',
		openAccess: false,
	},
	{
		title: 'COF: Connectivity-Based Outlier Factor',
		authors: 'Tang, Jian; Chen, Zhixiang; Fu, Ada Wai-Chee; Cheung, David W.',
		year: 2002,
		journal: 'PAKDD',
		doi: '10.1007/3-540-47887-6_53',
		openAccess: false,
	},
	{
		title: 'Angle-Based Outlier Detection in High-Dimensional Data',
		authors: 'Kriegel, Hans-Peter; Schubert, Matthias; Zimek, Arthur',
		year: 2008,
		journal: 'ACM SIGKDD',
		doi: '10.1145/1401890.1401946',
		openAccess: false,
	},
];

const NOD_NOTEBOOK_SECTIONS = [
	{
		label: 'Basic',
		notebooks: [
			{
				name: 'KNN Outliers',
				file: 'nod/tutorial-01-knn-outliers.ipynb',
				bundled: true as const,
				description: 'Detect outliers using k-nearest neighbour distance scores with OutlierDetection.jl',
			},
			{
				name: 'LOF',
				file: 'nod/tutorial-02-lof.ipynb',
				bundled: true as const,
				description: 'Local Outlier Factor: density-based detection using local reachability density ratios',
			},
		],
	},
	{
		label: 'Advanced',
		notebooks: [
			{
				name: 'COF and ABOD',
				file: 'nod/tutorial-03-cof-abod.ipynb',
				bundled: true as const,
				description: 'Connectivity-Based Outlier Factor and Angle-Based Outlier Detection for high-dimensional data',
			},
		],
	},
];

const NOD_METADATA: INodMetadata = {
	nod: {
		packages: [
			{
				name: 'OutlierDetection.jl',
				github: 'https://github.com/OutlierDetectionJL/OutlierDetection.jl',
				papers: [],
			},
		],
		notebooks: NOD_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		notebookSections: NOD_NOTEBOOK_SECTIONS,
		wikis: [
			{ name: 'Factsheet',      file: 'nod/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'nod/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'nod/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'nod/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'nod/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'nod/decision-guide.md', bundled: true },
			{ separator: true, label: 'Detectors' },
			{ name: 'KNN',            file: 'nod/knn.md',            bundled: true },
			{ name: 'LOF',            file: 'nod/lof.md',            bundled: true },
			{ name: 'COF',            file: 'nod/cof.md',            bundled: true },
			{ name: 'ABOD',           file: 'nod/abod.md',           bundled: true },
		],
		references: NOD_REFERENCES,
	},
};

export function openNodWebview(
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
			title: NOD_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		NOD_VIEW_TYPE,
		NOD_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getNodHtml());

	registerNodWebviewHandlers(
		webviewInput,
		NOD_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
