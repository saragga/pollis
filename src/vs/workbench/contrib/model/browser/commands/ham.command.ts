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
import { IHamMetadata } from '../common/ham.types.js';
import { registerHamWebviewHandlers } from '../handlers/ham.handler.js';
import { getHamHtml } from '../webviews/ham.template.js';

const HAM_VIEW_TYPE = 'pollis.ham';
const HAM_TITLE = 'Heterogeneous-Agent Models';

const HAM_METADATA: IHamMetadata = {
	ham: {
		packages: [
			{
				name: 'EconPDEs.jl',
				github: 'https://github.com/matthieugomez/EconPDEs.jl',
				papers: [
					{
						title: 'The Risk-Free Rate in Heterogeneous-Agent Incomplete-Insurance Economies',
						authors: 'Huggett, M.',
						year: 1993,
						url: 'https://doi.org/10.1016/0165-1889(93)90024-M',
						openAccess: false,
					},
					{
						title: 'Uninsured Idiosyncratic Risk and Aggregate Saving',
						authors: 'Aiyagari, S. R.',
						year: 1994,
						url: 'https://doi.org/10.2307/2118417',
						openAccess: false,
					},
					{
						title: 'Income and Wealth Distribution in Macroeconomics: A Continuous-Time Approach',
						authors: 'Achdou, Y., Han, J., Lasry, J. M., Lions, P. L., & Moll, B.',
						year: 2022,
						url: 'https://doi.org/10.1093/restud/rdab002',
						openAccess: true,
					},
					{
						title: 'Monetary Policy According to HANK',
						authors: 'Kaplan, G., Moll, B., & Violante, G. L.',
						year: 2018,
						url: 'https://doi.org/10.1257/aer.20160042',
						openAccess: false,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start',            file: 'ham/tutorial-01-quickstart.ipynb',   bundled: true, description: 'Solve a Huggett model and plot the value function and wealth distribution' },
			{ name: 'Aiyagari Model',          file: 'ham/tutorial-02-aiyagari.ipynb',     bundled: true, description: 'Compute the stationary equilibrium with aggregate capital and idiosyncratic risk' },
			{ name: 'Wealth Distribution',     file: 'ham/tutorial-03-distribution.ipynb', bundled: true, description: 'Extract and plot the cross-sectional wealth and consumption distributions' },
			{ name: 'Equilibrium Interest Rate', file: 'ham/tutorial-04-equilibrium.ipynb', bundled: true, description: 'Find the equilibrium risk-free rate clearing the asset market' },
		],
		wikis: [
			{ name: 'Overview',       file: 'ham/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'ham/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'ham/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'ham/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'ham/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'ham/decision-guide.md', bundled: true },
		],
		tooltips: {
			gamma: 'Coefficient of relative risk aversion. Higher values imply stronger preference for consumption smoothing.',
			rho:   'Subjective discount rate in continuous time. Sets the agent&#8217;s time preference.',
			sigma: 'Standard deviation of the idiosyncratic income shock in the diffusion process.',
			kappa: 'Mean-reversion speed of the income process. Higher values imply faster return to the long-run mean.',
			phi:   'Borrowing limit (ad hoc constraint). phi = 0 means no borrowing; negative values allow debt up to |phi|.',
			N:     'Number of grid points for the wealth state space discretisation. More points give higher accuracy.',
		},
	},
};

export function openHamWebview(
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
			title: HAM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		HAM_VIEW_TYPE,
		HAM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getHamHtml());

	registerHamWebviewHandlers(
		webviewInput,
		HAM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
