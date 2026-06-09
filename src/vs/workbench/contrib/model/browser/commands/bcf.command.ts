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
import { IBcfMetadata } from '../common/bcf.types.js';
import { registerBcfWebviewHandlers } from '../handlers/bcf.handler.js';
import { getBcfHtml } from '../webviews/bcf.template.js';

const BCF_VIEW_TYPE = 'pollis.bcf';
const BCF_TITLE = 'Business Cycle Filters';

const BCF_METADATA: IBcfMetadata = {
	bcf: {
		packages: [
			{
				name: 'MacroEconometricModels.jl',
				github: 'https://github.com/FriedmanJP/MacroEconometricModels.jl',
				papers: [
					{
						title: 'A new approach to the economic analysis of nonstationary time series and the business cycle',
						authors: 'Hodrick, R. J., & Prescott, E. C.',
						year: 1997,
						url: 'https://doi.org/10.2307/2953682',
						openAccess: false,
					},
					{
						title: 'Why you should never use the Hodrick-Prescott filter',
						authors: 'Hamilton, J. D.',
						year: 2018,
						url: 'https://doi.org/10.1162/rest_a_00706',
						openAccess: false,
					},
					{
						title: 'A new approach to decomposition of economic time series into permanent and transitory components',
						authors: 'Beveridge, S., & Nelson, C. R.',
						year: 1981,
						url: 'https://doi.org/10.1016/0304-3932(81)90040-4',
						openAccess: false,
					},
					{
						title: 'Measuring business cycles: Approximate band-pass filters for economic time series',
						authors: 'Baxter, M., & King, R. G.',
						year: 1999,
						url: 'https://doi.org/10.1162/003465399558454',
						openAccess: false,
					},
					{
						title: 'Boosting the Hodrick-Prescott filter',
						authors: 'Phillips, P. C. B., & Shi, Z.',
						year: 2021,
						url: 'https://doi.org/10.1093/restud/rdab028',
						openAccess: false,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start',          file: 'bcf/tutorial-01-quickstart.ipynb',  bundled: true, description: 'Apply business cycle filters to macroeconomic time series' },
			{ name: 'HP Filter',            file: 'bcf/tutorial-02-hp.ipynb',          bundled: true, description: 'Hodrick-Prescott filter: parameter selection and trend extraction' },
			{ name: 'Hamilton Filter',      file: 'bcf/tutorial-03-hamilton.ipynb',    bundled: true, description: 'Hamilton regression filter and comparison with HP' },
			{ name: 'Beveridge-Nelson',     file: 'bcf/tutorial-04-bn.ipynb',          bundled: true, description: 'Beveridge-Nelson decomposition via ARIMA psi-weights' },
			{ name: 'Baxter-King',          file: 'bcf/tutorial-05-bk.ipynb',          bundled: true, description: 'Baxter-King band-pass filter: frequency-band isolation' },
			{ name: 'Boosted HP',           file: 'bcf/tutorial-06-bhp.ipynb',         bundled: true, description: 'Boosted HP filter (Phillips & Shi 2021): iterated detrending' },
		],
		wikis: [
			{ name: 'Overview',        file: 'bcf/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'bcf/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'bcf/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'bcf/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'bcf/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'bcf/decision-guide.md',  bundled: true },
		],
		tooltips: {
			filter:    'Business cycle filter to apply. Each filter targets different frequency components of the series.',
			lambda:    'Smoothing parameter &#955; for the HP filter. Standard values: 1600 (quarterly), 100 (annual), 14400 (monthly).',
			h:         'Horizon h for the Hamilton filter. Hamilton recommends h = 8 for quarterly data (two years ahead).',
			p:         'Number of lags p used in the Hamilton regression. Typically p = 4 for quarterly data.',
			p_low:     'Lower period bound (in data frequency units) for the Baxter-King band-pass filter. Standard: 6 quarters.',
			p_high:    'Upper period bound for the Baxter-King band-pass filter. Standard: 32 quarters for business cycles.',
			K:         'Lead/lag truncation K for the Baxter-King filter. Higher K improves frequency precision but discards more observations.',
			maxiter:   'Maximum boosting iterations for the Boosted HP filter. The algorithm stops early if convergence is reached.',
			boost_tol: 'Convergence tolerance for the Boosted HP filter. Iteration stops when the &#8467;&#8322; norm of residual improvement falls below this value.',
		},
	},
};

export function openBcfWebview(
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
			title: BCF_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		BCF_VIEW_TYPE,
		BCF_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getBcfHtml());

	registerBcfWebviewHandlers(
		webviewInput,
		BCF_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
