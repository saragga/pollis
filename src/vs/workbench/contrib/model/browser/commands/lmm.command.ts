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
import { ILmmMetadata } from '../common/lmm.types.js';
import { registerLmmWebviewHandlers } from '../handlers/lmm.handler.js';
import { getLmmHtml } from '../webviews/lmm.template.js';

const LMM_VIEW_TYPE = 'pollis.lmm';
const LMM_TITLE = 'Linear Mixed-Effects Models';

const LMM_METADATA: ILmmMetadata = {
	lmm: {
		packages: [
			{ name: 'MixedModels.jl',       github: 'https://github.com/JuliaStats/MixedModels.jl',          papers: [] },
			{ name: 'FixedEffectModels.jl', github: 'https://github.com/FixedEffects/FixedEffectModels.jl', papers: [] },
		],
		notebooks: [
			{ name: 'LMM Basics', file: 'lmm/tutorial-01-lmm-basics.ipynb', bundled: true, description: 'Introduction to linear mixed-effects models' },
			{ name: 'Random Effects', file: 'lmm/tutorial-02-lmm-random-effects.ipynb', bundled: true, description: 'Crossed, nested, and correlated random effects' },
			{ name: 'Model Comparison', file: 'lmm/tutorial-03-lmm-model-comparison.ipynb', bundled: true, description: 'Likelihood ratio tests and AIC/BIC model selection' },
			{ name: 'Diagnostics', file: 'lmm/tutorial-04-lmm-diagnostics.ipynb', bundled: true, description: 'Residual analysis and model checking for LMM' },
		],
		wikis: [
			{ name: 'Overview',        file: 'lmm/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'lmm/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'lmm/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'lmm/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'lmm/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'lmm/decision-guide.md',  bundled: true },
		],
		tooltips: {
			formula: 'MixedModels formula: random effects in parentheses.\n(1|group) — random intercept\n(0+x|group) — random slope only\n(1+x|group) — random intercept + slope\n(1|g1) + (1|g2) — crossed random effects\n(1|g1/g2) — nested random effects\n\nFixedEffectModels formula: absorb fixed effects with fe().\nfe(id) — entity fixed effects\nfe(id) + fe(t) — two-way (entity + time) FE\n(x_end ~ z_iv) — IV endogenous regressor',
			data: 'DataFrame containing all variables referenced in the formula. Column names must match the formula symbols exactly.',
		},
	},
};

export function openLmmWebview(
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
			title: LMM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		LMM_VIEW_TYPE,
		LMM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getLmmHtml());

	registerLmmWebviewHandlers(
		webviewInput,
		LMM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
