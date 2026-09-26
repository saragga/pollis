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
import { IAdlpMetadata } from '../common/adlp.types.js';
import { registerAdlpWebviewHandlers } from '../handlers/adlp.handler.js';
import { getAdlpHtml } from '../webviews/adlp.template.js';

const ADLP_VIEW_TYPE = 'pollis.adlp';
const ADLP_TITLE = 'AD Log-Likelihood';

const ADLP_METADATA: IAdlpMetadata = {
	adlp: {
		packages: [
			{
				name: 'DistributionsAD.jl',
				github: 'https://github.com/TuringLang/DistributionsAD.jl',
				papers: [
					{ title: 'Automatic Differentiation in Machine Learning: a Survey', authors: 'Baydin, A.G., Pearlmutter, B.A., Radul, A.A. & Siskind, J.M.', year: 2018, url: 'https://jmlr.org/papers/v18/17-468.html', openAccess: true },
					{ title: 'Zygote: a Differentiable Programming System to Bridge Machine Learning and Scientific Computing', authors: 'Innes, M. et al.', year: 2019, url: 'https://arxiv.org/abs/1907.07587', openAccess: true },
					{ title: 'Forward-Mode Automatic Differentiation in Julia', authors: 'Revels, J., Lubin, M. & Papamarkou, T.', year: 2016, url: 'https://arxiv.org/abs/1607.07892', openAccess: true },
				],
			},
		],
		notebooks: [
			{ name: 'Distribution Estimation via AD', file: 'adlp/tutorial-01-distribution.ipynb', bundled: true, description: 'Estimating distribution parameters using automatic differentiation of the log-likelihood' },
			{ name: 'Linear Regression via AD',       file: 'adlp/tutorial-02-linear.ipynb',       bundled: true, description: 'Bayesian and MLE linear regression using differentiable log-likelihood' },
			{ name: 'Logistic Regression via AD',     file: 'adlp/tutorial-03-logistic.ipynb',     bundled: true, description: 'Binary classification via differentiable cross-entropy / log-likelihood' },
		],
		wikis: [
			{ name: 'Overview',                  file: 'adlp/overview.md',                  bundled: true },
			{ name: 'Automatic Differentiation', file: 'adlp/autodiff.md',                  bundled: true },
			{ name: 'ChainRules Integration',    file: 'adlp/chainrules.md',                bundled: true },
			{ name: 'Zygote Backend',            file: 'adlp/zygote.md',                    bundled: true },
			{ name: 'ForwardDiff Backend',       file: 'adlp/forwarddiff.md',               bundled: true },
			{ name: 'Distribution Estimation',   file: 'adlp/distribution-estimation.md',   bundled: true },
			{ name: 'Unconstrained Optimisation', file: 'adlp/unconstrained.md',            bundled: true },
		],
	},
};

export function openAdlpWebview(
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
			title: ADLP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		ADLP_VIEW_TYPE,
		ADLP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getAdlpHtml());

	registerAdlpWebviewHandlers(
		webviewInput,
		ADLP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
