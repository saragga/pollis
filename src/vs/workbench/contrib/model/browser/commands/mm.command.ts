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
import { IMmMetadata } from '../common/mm.types.js';
import { registerMmWebviewHandlers } from '../handlers/mm.handler.js';
import { getMmHtml } from '../webviews/mm.template.js';

const MM_VIEW_TYPE = 'pollis.mm';
const MM_TITLE = 'Mixed-Effects Models';

const MM_METADATA: IMmMetadata = {
	mm: {
		packages: [
			{ name: 'MixedModels.jl', github: 'https://github.com/JuliaStats/MixedModels.jl', papers: [] },
		],
		notebooks: [
			{ name: 'LMM Basics', file: 'mm/tutorial-01-lmm.ipynb', bundled: true, description: 'Introduction to linear mixed-effects models' },
			{ name: 'GLMM Tutorial', file: 'mm/tutorial-02-glmm.ipynb', bundled: true, description: 'Generalized linear mixed-effects models with different families' },
			{ name: 'Random Effects', file: 'mm/tutorial-03-random-effects.ipynb', bundled: true, description: 'Crossed, nested, and correlated random effects' },
			{ name: 'Model Comparison', file: 'mm/tutorial-04-model-comparison.ipynb', bundled: true, description: 'Likelihood ratio tests and AIC/BIC model selection' },
		],
		wikis: [
			{ name: 'Overview',        file: 'mm/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'mm/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'mm/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'mm/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'mm/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'mm/decision-guide.md',  bundled: true },
		],
		tooltips: {
			formula: 'Julia formula using the @formula macro. Fixed effects go on the right of ~, random effects in parentheses. Examples:\n(1|group) — random intercept\n(0+x|group) — random slope only\n(1+x|group) — random intercept + slope\n(1|g1) + (1|g2) — crossed effects\n(1|g1/g2) — nested effects',
			data: 'DataFrame containing all variables referenced in the formula. Column names must match the formula symbols exactly.',
			family: 'Response distribution for GLMM. Bernoulli and Binomial for binary/proportion outcomes, Poisson or NegativeBinomial for counts, Gamma for positive continuous, InverseGaussian for positive skewed.',
			link: 'Link function connecting the linear predictor to the mean of the distribution. Each family has a canonical default link. Override only when the theory requires a different link.',
		},
	},
};

export function openMmWebview(
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
			title: MM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MM_VIEW_TYPE,
		MM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMmHtml());

	registerMmWebviewHandlers(
		webviewInput,
		MM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
