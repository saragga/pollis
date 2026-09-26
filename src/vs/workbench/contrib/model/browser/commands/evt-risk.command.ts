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
import { IEvtRiskMetadata } from '../common/evt-risk.types.js';
import { registerEvtRiskWebviewHandlers } from '../handlers/evt-risk.handler.js';
import { getEvtRiskHtml } from '../webviews/evt-risk.template.js';

const EVT_RISK_VIEW_TYPE = 'pollis.evtRisk';
const EVT_RISK_TITLE = 'Extreme Value Risk Measures';

const EVT_RISK_METADATA: IEvtRiskMetadata = {
	evtRisk: {
		packages: [
			{
				name: 'Extremes.jl',
				github: 'https://github.com/jojal5/Extremes.jl',
				papers: [
					{
						title: 'Extremes.jl: Extreme Value Analysis in Julia',
						authors: 'Jalbert, J., Farmer, M., Gobeil, G., & Roy, P.',
						year: 2024,
						url: 'https://doi.org/10.18637/jss.v109.i06',
						openAccess: true,
					},
					{
						title: 'Modelling Extremal Events for Insurance and Finance',
						authors: 'Embrechts, P., Klüppelberg, C., & Mikosch, T.',
						year: 1997,
						url: 'https://doi.org/10.1007/978-3-642-33483-2',
						openAccess: false,
					},
					{
						title: 'Estimation of Tail-Related Risk Measures for Heteroscedastic Financial Time Series',
						authors: 'McNeil, A. J., & Frey, R.',
						year: 2000,
						url: 'https://doi.org/10.1016/S0927-5398(00)00012-8',
						openAccess: false,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start',                     file: 'evt-risk/tutorial-01-quickstart.ipynb',    bundled: true, description: 'Introduction to Extreme Value risk measures' },
			{ name: 'Return Level Estimation',         file: 'evt-risk/tutorial-02-return-levels.ipynb', bundled: true, description: 'Compute return levels from fitted GEV models' },
			{ name: 'Peaks-Over-Threshold Analysis',   file: 'evt-risk/tutorial-03-pot.ipynb',           bundled: true, description: 'Peaks-Over-Threshold analysis with GP distribution' },
			{ name: 'Extreme Value VaR and ES', file: 'evt-risk/tutorial-04-var-es.ipynb',        bundled: true, description: 'Value at Risk and Expected Shortfall via Extreme Value methods' },
		],
		wikis: [
			{ name: 'Overview',       file: 'evt-risk/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'evt-risk/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'evt-risk/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'evt-risk/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'evt-risk/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'evt-risk/decision-guide.md', bundled: true },
		],
		tooltips: {
			data:      'Data series (e.g., daily losses or log-losses). For return levels the series should be block maxima; for POT and tail risk use the raw loss series.',
			periods:   'Space-separated list of return periods T (in the same time unit as blocks). Example: 10 50 100 gives the 10-, 50-, and 100-period return levels.',
			threshold: 'Threshold u for Peaks-Over-Threshold analysis. Observations exceeding u are modelled with the Generalized Pareto distribution. Choose u using the mean excess plot.',
			alpha:     'Significance level &#945; for EVT-based VaR and Expected Shortfall. 0.05 gives the 95% measure; 0.01 gives the 99% measure.',
			method:    'Estimation method applied when fitting GEV (Return Levels) or GP (Peaks-Over-Threshold, Tail Risk). Maximum Likelihood is the default. Probability-Weighted Moments is faster and closed-form. Bayesian Estimation yields posterior distributions.',
		},
	},
};

export function openEvtRiskWebview(
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
			title: EVT_RISK_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		EVT_RISK_VIEW_TYPE,
		EVT_RISK_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getEvtRiskHtml());

	registerEvtRiskWebviewHandlers(
		webviewInput,
		EVT_RISK_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
