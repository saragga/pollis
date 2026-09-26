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
import { INscrMetadata } from '../common/nscr.types.js';
import { registerNscrWebviewHandlers } from '../handlers/nscr.handler.js';
import { getNscrHtml } from '../webviews/nscr.template.js';

const NSCR_VIEW_TYPE = 'pollis.nscr';
const NSCR_TITLE = 'Net Survival & Competing Risks';

const NSCR_METADATA: INscrMetadata = {
	nscr: {
		packages: [
			{ name: 'NetSurvival.jl', github: 'https://github.com/JuliaSurv/NetSurvival.jl', papers: [] },
		],
		notebooks: [
			{ name: 'Cumulative Incidence Functions', file: 'nscr/tutorial-01-cif.ipynb',    bundled: true, description: 'Competing-risks analysis using cumulative incidence functions' },
			{ name: 'Net Survival Estimation',        file: 'nscr/tutorial-02-ns.ipynb',     bundled: true, description: 'Population-based net survival with Pohar-Perme and Ederer estimators' },
			{ name: 'Grafféo\'s Log-Rank Test',       file: 'nscr/tutorial-03-lr.ipynb',     bundled: true, description: 'Non-parametric comparison of net survival curves' },
		],
		wikis: [
			{ name: 'Overview',       file: 'nscr/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'nscr/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'nscr/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'nscr/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'nscr/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'nscr/decision-guide.md', bundled: true },
		],
		tooltips: {
			time:     'Column name for observed event or censoring times.',
			event:    'Column name for event type. Use 0 for censored observations; integer codes ≥ 1 identify each competing event.',
			data:     'Julia DataFrame containing the survival data.',
			cause:    'Integer code identifying the cause of interest for the cumulative incidence function.',
			method:   'Net survival estimator. Pohar-Perme is the recommended unbiased estimator for population-based studies.',
			expected: 'Variable or expression providing the expected (population) hazard at each observation, typically derived from a population mortality ratetable.',
			group:    'Column name for the grouping variable used to compare net survival curves in the log-rank test.',
		},
	},
};

export function openNscrWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	initialMethod?: string,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: NSCR_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		NSCR_VIEW_TYPE,
		NSCR_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getNscrHtml());

	registerNscrWebviewHandlers(
		webviewInput,
		NSCR_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialMethod,
	);
}
