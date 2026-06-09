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
import { IRvolMetadata } from '../common/rvol.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerRvolWebviewHandlers } from '../handlers/rvol.handler.js';
import { getRvolHtml } from '../webviews/rvol.template.js';

const RVOL_VIEW_TYPE = 'pollis.rvol';
const RVOL_TITLE = 'Range-Based Volatility Estimation';

const RVOL_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Julia: A Fresh Approach to Numerical Computing',
		authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/141000671',
		openAccess: false,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Options, Futures, and Other Derivatives',
		authors: 'Hull, John C.',
		year: 2022,
		journal: 'Pearson (11th ed.)',
		url: 'https://www.pearson.com/en-us/subject-catalog/p/options-futures-and-other-derivatives/P200000005938',
		openAccess: false,
	},
	{
		title: 'Volatility Trading',
		authors: 'Sinclair, Euan',
		year: 2013,
		journal: 'Wiley (2nd ed.)',
		url: 'https://www.wiley.com/en-us/Volatility+Trading%2C+2nd+Edition-p-9781118347133',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'On Estimating the Expected Return on the Market: An Exploratory Investigation',
		authors: 'Merton, Robert C.',
		year: 1980,
		journal: 'Journal of Financial Economics',
		doi: '10.1016/0304-405X(80)90007-0',
		openAccess: false,
	},
	{
		title: 'The Extreme Value Method for Estimating the Variance of the Rate of Return',
		authors: 'Parkinson, Michael',
		year: 1980,
		journal: 'Journal of Business',
		url: 'https://www.jstor.org/stable/2352357',
		openAccess: false,
	},
	{
		title: 'On the Estimation of Security Price Volatilities from Historical Data',
		authors: 'Garman, Mark B.; Klass, Michael J.',
		year: 1980,
		journal: 'Journal of Business',
		url: 'https://www.jstor.org/stable/2352358',
		openAccess: false,
	},
	{
		title: 'Estimating Variance from High, Low and Closing Prices',
		authors: 'Rogers, L. C. G.; Satchell, S. E.',
		year: 1991,
		journal: 'Annals of Applied Probability',
		doi: '10.1214/aoap/1177005835',
		openAccess: false,
	},
	{
		title: 'Drift-Independent Volatility Estimation Based on High, Low, Open, and Close Prices',
		authors: 'Yang, Dennis; Zhang, Qiang',
		year: 2000,
		journal: 'Journal of Business',
		doi: '10.1086/209650',
		openAccess: false,
	},
	{
		title: 'Range-Based Estimation of Stochastic Volatility Models',
		authors: 'Alizadeh, Sassan; Brandt, Michael W.; Diebold, Francis X.',
		year: 2002,
		journal: 'Journal of Finance',
		doi: '10.1111/1540-6261.00454',
		openAccess: false,
	},
];

const RVOL_METADATA: IRvolMetadata = {
	rvol: {
		packages: [
			{
				name: 'RangeVol.jl',
				github: 'https://github.com/Trumpingtons/RangeVol.jl',
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
		references: RVOL_REFERENCES,
		notebooks: [
			{ name: 'Introduction', file: 'range-vol/tutorial-01-introduction.ipynb', bundled: true, description: 'Overview of all range-based volatility estimators with worked examples' },
			{ name: 'Estimator Comparison', file: 'range-vol/tutorial-02-comparison.ipynb', bundled: true, description: 'Side-by-side comparison of efficiency and bias across all estimators' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'range-vol/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'range-vol/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'range-vol/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'range-vol/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'range-vol/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'range-vol/decision-guide.md', bundled: true },
			{ separator: true, label: 'Estimators' },
			{ name: 'Close-to-Close',             file: 'range-vol/close-to-close.md',             bundled: true },
			{ name: 'Parkinson',                  file: 'range-vol/parkinson.md',                  bundled: true },
			{ name: 'Garman-Klass',               file: 'range-vol/garman-klass.md',               bundled: true },
			{ name: 'Rogers-Satchell',             file: 'range-vol/rogers-satchell.md',             bundled: true },
			{ name: 'Garman-Klass-Yang-Zhang',    file: 'range-vol/garman-klass-yang-zhang.md',    bundled: true },
			{ name: 'Yang-Zhang',                 file: 'range-vol/yang-zhang.md',                 bundled: true },
			{ name: 'Alizadeh-Brandt-Diebold',   file: 'range-vol/alizadeh-brandt-diebold.md',   bundled: true },
		],
	},
};

export function openRvolWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: RVOL_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		RVOL_VIEW_TYPE,
		RVOL_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getRvolHtml());

	registerRvolWebviewHandlers(
		webviewInput,
		RVOL_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
