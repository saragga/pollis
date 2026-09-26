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
import { IOaMetadata } from '../common/oa.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerOaWebviewHandlers } from '../handlers/oa.handler.js';
import { getOaHtml } from '../webviews/oa.template.js';

const OA_VIEW_TYPE = 'pollis.oa';
const OA_TITLE = 'Online Algorithms';

const OA_REFERENCES: IModelReference[] = [
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
		title: 'OnlineStats.jl: A Julia package for statistics on data streams',
		authors: 'Day, Josh',
		year: 2020,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.01816',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Mining of Massive Datasets',
		authors: 'Leskovec, Jure; Rajaraman, Anand; Ullman, Jeffrey D.',
		year: 2020,
		journal: 'Cambridge University Press (3rd ed.)',
		url: 'http://www.mmds.org',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Note on a Method for Calculating Corrected Sums of Squares and Products',
		authors: 'Welford, B. P.',
		year: 1962,
		journal: 'Technometrics',
		doi: '10.1080/00401706.1962.10490022',
		openAccess: false,
	},
	{
		title: 'Sequential Estimation of Quantiles with Applications to A/B Testing and Best-Arm Identification',
		authors: 'Waudby-Smith, Ian; Ramdas, Aaditya',
		year: 2023,
		journal: 'Bernoulli',
		doi: '10.3150/22-BEJ1518',
		openAccess: true,
	},
	{
		title: 'Recursive Least Squares Estimation: Theory and Applications',
		authors: 'Plackett, Robin L.',
		year: 1950,
		journal: 'Biometrika',
		doi: '10.1093/biomet/37.1-2.149',
		openAccess: false,
	},
];

const OA_METADATA: IOaMetadata = {
	oa: {
		packages: [
			{
				name: 'OnlineStats.jl',
				github: 'https://github.com/joshday/OnlineStats.jl',
				papers: [],
				videos: [
					{
						title: 'Julia in Academia',
						description: 'Overview of Julia for academic and scientific computing',
						url: 'https://www.youtube.com/watch?v=wPFPT-Ech2c',
					},
				],
			},
		],
		notebooks: [
			{ name: 'Descriptive Statistics',   file: 'online-alg/tutorial-01-descriptive.ipynb',  bundled: true, description: 'Single-pass mean, variance, extrema and moments on streaming data using OnlineStats Series' },
			{ name: 'Quantile Estimation',       file: 'online-alg/tutorial-02-quantile.ipynb',    bundled: true, description: 'Approximate quantile estimation on a data stream with the P-squared algorithm' },
			{ name: 'Online Histogram',          file: 'online-alg/tutorial-03-histogram.ipynb',   bundled: true, description: 'Adaptive histogram of streaming data without storing observations' },
			{ name: 'Online Linear Regression',  file: 'online-alg/tutorial-04-linreg.ipynb',      bundled: true, description: 'Recursive least-squares linear regression updating coefficients as new observations arrive' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'online-alg/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'online-alg/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'online-alg/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'online-alg/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'online-alg/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'online-alg/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Online Estimators' },
			{ name: 'Descriptive Stats', file: 'online-alg/descriptive.md',  bundled: true },
			{ name: 'Quantile',          file: 'online-alg/quantile.md',     bundled: true },
			{ name: 'Histogram',         file: 'online-alg/histogram.md',    bundled: true },
			{ name: 'Linear Regression', file: 'online-alg/linreg.md',       bundled: true },
		],
		references: OA_REFERENCES,
	},
};

export function openOaWebview(
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
			title: OA_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		OA_VIEW_TYPE,
		OA_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getOaHtml());

	registerOaWebviewHandlers(
		webviewInput,
		OA_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
