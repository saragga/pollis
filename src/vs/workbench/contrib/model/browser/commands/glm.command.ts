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
import { IGlmMetadata } from '../common/glm.types.js';
import { registerGlmWebviewHandlers } from '../handlers/glm.handler.js';
import { getGlmHtml } from '../webviews/glm.template.js';

const GLM_VIEW_TYPE = 'pollis.glm';
const GLM_TITLE = 'Generalized Linear Models';

const GLM_METADATA: IGlmMetadata = {
	glm: {
		packages: [
			{ name: 'GLM.jl',                github: 'https://github.com/JuliaStats/GLM.jl',                papers: [] },
			{ name: 'CovarianceMatrices.jl',  github: 'https://github.com/gragusa/CovarianceMatrices.jl',  papers: [] },
		],
		notebooks: [
			{ name: 'Binary Response', file: 'glm/tutorial-01-binary.ipynb', bundled: true, description: 'Logistic regression with Bernoulli and Binomial families' },
			{ name: 'Count Data', file: 'glm/tutorial-02-count.ipynb', bundled: true, description: 'Poisson and Negative Binomial regression for count outcomes' },
			{ name: 'Positive Continuous', file: 'glm/tutorial-03-continuous.ipynb', bundled: true, description: 'Gamma and Inverse Gaussian regression for positive responses' },
			{ name: 'Model Selection', file: 'glm/tutorial-04-model-selection.ipynb', bundled: true, description: 'Deviance, AIC/BIC and likelihood ratio tests for GLMs' },
		],
		wikis: [
			{ name: 'Overview',        file: 'glm/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'glm/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'glm/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'glm/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'glm/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'glm/decision-guide.md',  bundled: true },
		],
		tooltips: {
			formula: 'Julia formula using the @formula macro. The response goes left of ~, predictors right. Use + for additive effects, * for interactions (includes main effects), : for interaction only.\nExamples:\ny ~ x1 + x2\ny ~ x1 * x2  (= x1 + x2 + x1:x2)\ny ~ log(x)  — transformed predictor',
			data: 'DataFrame containing all variables referenced in the formula. Column names must match the formula symbols exactly.',
			family: 'Response distribution.\nBernoulli — binary 0/1 outcome\nBinomial — proportion or count with known N (fractional use)\nPoisson — count data\nNegativeBinomial — overdispersed counts\nGeometric — trials until first success (special case of NegBin with r=1)\nGamma — positive skewed continuous\nInverseGaussian — positive heavy-tailed continuous',
			link: 'Link function connecting the linear predictor to the mean. The default for each family is shown in parentheses — override only when theory requires a different link.',
		},
	},
};

export function openGlmWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	initialFamily?: string
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: GLM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		GLM_VIEW_TYPE,
		GLM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getGlmHtml());

	registerGlmWebviewHandlers(
		webviewInput,
		GLM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialFamily
	);
}
