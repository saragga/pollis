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
import { IGlmmMetadata } from '../common/glmm.types.js';
import { registerGlmmWebviewHandlers } from '../handlers/glmm.handler.js';
import { getGlmmHtml } from '../webviews/glmm.template.js';

const GLMM_VIEW_TYPE = 'pollis.glmm';
const GLMM_TITLE = 'Generalized Linear Mixed-Effects Models';

const GLMM_METADATA: IGlmmMetadata = {
	glmm: {
		packages: [
			{ name: 'MixedModels.jl', github: 'https://github.com/JuliaStats/MixedModels.jl', papers: [] },
		],
		notebooks: [
			{ name: 'GLMM Basics', file: 'glmm/tutorial-01-glmm-basics.ipynb', bundled: true, description: 'Introduction to generalized linear mixed-effects models' },
			{ name: 'Binary GLMM', file: 'glmm/tutorial-02-glmm-binary.ipynb', bundled: true, description: 'Logistic mixed-effects models for binary outcomes' },
			{ name: 'Count GLMM', file: 'glmm/tutorial-03-glmm-count.ipynb', bundled: true, description: 'Poisson and Negative Binomial mixed-effects models' },
			{ name: 'Model Comparison', file: 'glmm/tutorial-04-glmm-model-comparison.ipynb', bundled: true, description: 'Model selection and likelihood ratio tests for GLMM' },
		],
		wikis: [
			{ name: 'Overview',        file: 'glmm/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'glmm/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'glmm/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'glmm/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'glmm/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'glmm/decision-guide.md',  bundled: true },
		],
		tooltips: {
			formula: 'MixedModels formula: random effects in parentheses.\n(1|group) — random intercept\n(1+x|group) — random intercept + slope\n(0+x|group) — random slope only\n(1|g1) + (1|g2) — crossed random effects\n(1|g1/g2) — nested random effects',
			data: 'DataFrame containing all variables referenced in the formula. Column names must match the formula symbols exactly.',
			family: 'Response distribution for the GLMM.\nBernoulli — binary 0/1 outcome\nBinomial — proportion or count with known N\nPoisson — count data\nNegativeBinomial — overdispersed counts\nGamma — positive skewed continuous\nInverseGaussian — positive heavy-tailed continuous',
			link: 'Link function connecting the linear predictor to the mean. The default for each family is shown in parentheses — override only when theory requires a different link.',
		},
	},
};

export function openGlmmWebview(
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
			title: GLMM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		GLMM_VIEW_TYPE,
		GLMM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getGlmmHtml());

	registerGlmmWebviewHandlers(
		webviewInput,
		GLMM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
