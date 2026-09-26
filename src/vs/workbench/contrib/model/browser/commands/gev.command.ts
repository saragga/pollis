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
import { IGevMetadata } from '../common/gev.types.js';
import { registerGevWebviewHandlers } from '../handlers/gev.handler.js';
import { getGevHtml } from '../webviews/gev.template.js';

const GEV_VIEW_TYPE = 'pollis.gev';
const GEV_TITLE = 'Generalized Extreme Value Distribution';

const GEV_METADATA: IGevMetadata = {
	gev: {
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
						title: 'An Introduction to Statistical Modeling of Extreme Values',
						authors: 'Coles, S.',
						year: 2001,
						url: 'https://doi.org/10.1007/978-1-4471-3675-0',
						openAccess: false,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start',          file: 'gev/tutorial-01-quickstart.ipynb',   bundled: true, description: 'Fit a GEV distribution to block maxima and extract parameters' },
			{ name: 'Parameter Estimation', file: 'gev/tutorial-02-estimation.ipynb',   bundled: true, description: 'Maximum likelihood estimation and uncertainty quantification for GEV' },
			{ name: 'Return Levels',        file: 'gev/tutorial-03-returnlevels.ipynb', bundled: true, description: 'Compute and plot return levels from a fitted GEV model' },
		],
		wikis: [
			{ name: 'Overview',       file: 'gev/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'gev/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'gev/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'gev/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'gev/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'gev/decision-guide.md', bundled: true },
		],
		tooltips: {
			data:   'Vector of block maxima (e.g., annual maxima of daily losses). The GEV is fitted to this series.',
			method: 'Estimation method. Maximum Likelihood is the default and most widely used. Probability-Weighted Moments is faster and closed-form. Bayesian Estimation yields posterior distributions for the parameters.',
			mu:     'Location parameter &#956;. Shifts the distribution along the real line.',
			sigma:  'Scale parameter &#963; &gt; 0. Controls the spread of the distribution.',
			xi:     'Shape parameter &#958;. &#958; &gt; 0: heavy tail (Fr&#233;chet); &#958; = 0: Gumbel; &#958; &lt; 0: bounded tail (Weibull).',
			x:      'Point at which to evaluate the pdf and cdf.',
			p:      'Probability level for the quantile. E.g., 0.99 gives the 99th percentile (1-in-100 event); 0.999 gives the 99.9th percentile.',
			n:      'Number of random samples to generate.',
		},
	},
};

export function openGevWebview(
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
			title: GEV_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		GEV_VIEW_TYPE,
		GEV_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getGevHtml());

	registerGevWebviewHandlers(
		webviewInput,
		GEV_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
