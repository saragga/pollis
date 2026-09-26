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
import { INovdMetadata } from '../common/novd.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerNovdWebviewHandlers } from '../handlers/novd.handler.js';
import { getNovdHtml } from '../webviews/novd.template.js';

const NOVD_VIEW_TYPE = 'pollis.novd';
const NOVD_TITLE = 'Novelty Detection';

const NOVD_REFERENCES: IModelReference[] = [
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
		title: 'LIBSVM.jl: Julia bindings for LIBSVM',
		authors: 'JuliaML Contributors',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/JuliaML/LIBSVM.jl',
		openAccess: true,
	},
	{
		title: 'OnlineStats.jl: Single-Pass Algorithms for Statistics',
		authors: 'Day, Josh',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/joshday/OnlineStats.jl',
		openAccess: true,
	},
	{
		title: 'ChangePointDetection.jl: Change Point Detection in Julia',
		authors: 'Julia Contributors',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/mbauman/ChangePointDetection.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Anomaly Detection: A Survey',
		authors: 'Chandola, Varun; Banerjee, Arindam; Kumar, Vipin',
		year: 2009,
		journal: 'ACM Computing Surveys',
		doi: '10.1145/1541880.1541882',
		openAccess: false,
	},
	{
		title: 'Statistical Methods for Quality Improvement',
		authors: 'Ryan, Thomas P.',
		year: 2011,
		journal: 'Wiley (3rd ed.)',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Estimating the Support of a High-Dimensional Distribution',
		authors: 'Scholkopf, Bernhard; Platt, John C.; Shawe-Taylor, John; Smola, Alex J.; Williamson, Robert C.',
		year: 2001,
		journal: 'Neural Computation',
		doi: '10.1162/089976601750264965',
		openAccess: false,
	},
	{
		title: 'Continuous Inspection Schemes',
		authors: 'Page, Ewan S.',
		year: 1954,
		journal: 'Biometrika',
		doi: '10.2307/2333009',
		openAccess: false,
	},
	{
		title: 'Bayesian Online Changepoint Detection',
		authors: 'Adams, Ryan Prescott; MacKay, David J. C.',
		year: 2007,
		journal: 'arXiv',
		url: 'https://arxiv.org/abs/0710.3742',
		openAccess: true,
	},
];

const NOVD_NOTEBOOK_SECTIONS = [
	{
		label: 'Non-Temporal',
		notebooks: [
			{
				name: 'One-Class SVM',
				file: 'novd/tutorial-01-one-class-svm.ipynb',
				bundled: true as const,
				description: 'Learn a boundary around normal training data and flag novel test points with LIBSVM.jl',
			},
			{
				name: 'Gaussian Novelty',
				file: 'novd/tutorial-02-gaussian-novelty.ipynb',
				bundled: true as const,
				description: 'Fit a multivariate Gaussian to normal data and detect novelties via Mahalanobis distance',
			},
		],
	},
	{
		label: 'Temporal',
		notebooks: [
			{
				name: 'CUSUM',
				file: 'novd/tutorial-03-cusum.ipynb',
				bundled: true as const,
				description: 'Detect sustained shifts from a baseline using the cumulative sum control chart with OnlineStats.jl',
			},
			{
				name: 'Bayesian Change Point',
				file: 'novd/tutorial-04-change-point.ipynb',
				bundled: true as const,
				description: 'Probabilistic detection of distribution change points in a time series',
			},
		],
	},
];

const NOVD_METADATA: INovdMetadata = {
	novd: {
		packages: [
			{
				name: 'LIBSVM.jl',
				github: 'https://github.com/JuliaML/LIBSVM.jl',
				papers: [],
			},
			{
				name: 'OnlineStats.jl',
				github: 'https://github.com/joshday/OnlineStats.jl',
				papers: [],
			},
			{
				name: 'ChangePointDetection.jl',
				github: 'https://github.com/mbauman/ChangePointDetection.jl',
				papers: [],
			},
		],
		notebooks: NOVD_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		notebookSections: NOVD_NOTEBOOK_SECTIONS,
		wikis: [
			{ name: 'Factsheet',         file: 'novd/factsheet.md',         bundled: true },
			{ name: 'Overview',          file: 'novd/overview.md',          bundled: true },
			{ name: 'Assumptions',       file: 'novd/assumptions.md',       bundled: true },
			{ name: 'Diagnostics',       file: 'novd/diagnostics.md',       bundled: true },
			{ name: 'Interpretation',    file: 'novd/interpretation.md',    bundled: true },
			{ name: 'Decision Guide',    file: 'novd/decision-guide.md',    bundled: true },
			{ separator: true, label: 'Non-Temporal' },
			{ name: 'One-Class SVM',     file: 'novd/one-class-svm.md',     bundled: true },
			{ name: 'Gaussian Novelty',  file: 'novd/gaussian-novelty.md',  bundled: true },
			{ separator: true, label: 'Temporal' },
			{ name: 'CUSUM',             file: 'novd/cusum.md',             bundled: true },
			{ name: 'Change Point',      file: 'novd/change-point.md',      bundled: true },
		],
		references: NOVD_REFERENCES,
	},
};

export function openNovdWebview(
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
			title: NOVD_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		NOVD_VIEW_TYPE,
		NOVD_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getNovdHtml());

	registerNovdWebviewHandlers(
		webviewInput,
		NOVD_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
