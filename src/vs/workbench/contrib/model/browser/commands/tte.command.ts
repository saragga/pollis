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
import { ITteMetadata } from '../common/tte.types.js';
import { registerTteWebviewHandlers } from '../handlers/tte.handler.js';
import { getTteHtml } from '../webviews/tte.template.js';

const TTE_VIEW_TYPE = 'pollis.tte';
const TTE_TITLE = 'Time-to-Event Analysis';

const TTE_METADATA: ITteMetadata = {
	tte: {
		packages: [
			{ name: 'Survival.jl',  github: 'https://github.com/JuliaStats/Survival.jl',  papers: [] },
			{ name: 'LSurvival.jl', github: 'https://github.com/alexpkeil1/LSurvival.jl', papers: [] },
		],
		notebooks: [
			{ name: 'Kaplan-Meier & Nelson-Aalen', file: 'tte/tutorial-01-km-na.ipynb', bundled: true, description: 'Non-parametric estimation of the survival and cumulative hazard functions' },
			{ name: 'Aalen-Johansen Estimator',    file: 'tte/tutorial-02-aj.ipynb',    bundled: true, description: 'Competing-risks cumulative incidence via the Aalen-Johansen estimator' },
			{ name: 'Cox Proportional Hazards',    file: 'tte/tutorial-03-cox.ipynb',   bundled: true, description: 'Semi-parametric regression with proportional hazards' },
			{ name: 'Accelerated Failure Time',    file: 'tte/tutorial-04-aft.ipynb',   bundled: true, description: 'Parametric survival regression with AFT models' },
		],
		wikis: [
			{ name: 'Overview',       file: 'tte/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'tte/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'tte/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'tte/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'tte/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'tte/decision-guide.md', bundled: true },
		],
		tooltips: {
			time:       'Column name for observed event or censoring times.',
			event:      'Column name for the event indicator. Use 0 for censored observations and 1 for events. For Aalen-Johansen, integer codes identify competing event types.',
			data:       'Julia DataFrame containing the survival data.',
			covariates: 'Right-hand side of the survival formula — covariate terms separated by +, e.g. age + treatment. Leave blank for an intercept-only model.',
			dist:       'Baseline distribution for the AFT model. Determines the shape of the log-survival function.',
		},
	},
};

export function openTteWebview(
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
			title: TTE_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		TTE_VIEW_TYPE,
		TTE_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getTteHtml());

	registerTteWebviewHandlers(
		webviewInput,
		TTE_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialMethod,
	);
}
