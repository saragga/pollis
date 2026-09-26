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
import { IExpMetadata } from '../common/exp.types.js';
import { registerExpWebviewHandlers } from '../handlers/exp.handler.js';
import { getExpHtml } from '../webviews/exp.template.js';

const EXP_VIEW_TYPE = 'pollis.exp';
const EXP_TITLE = 'Expectations';

const EXP_METADATA: IExpMetadata = {
	exp: {
		packages: [
			{
				name: 'Expectations.jl',
				github: 'https://github.com/QuantEcon/Expectations.jl',
				papers: [],
			},
		],
		notebooks: [
			{ name: 'Quick Start',       file: 'exp/tutorial-01-quickstart.ipynb',  bundled: true, description: 'Compute E[f(X)] for standard distributions using the expectation operator' },
			{ name: 'Distributions',     file: 'exp/tutorial-02-distributions.ipynb', bundled: true, description: 'Normal, Gamma, Beta, Exponential, Uniform and ChiSq with automatic quadrature selection' },
			{ name: 'Quadrature Methods', file: 'exp/tutorial-03-quadrature.ipynb', bundled: true, description: 'Gauss-Hermite, Gauss-Laguerre and Gauss-Legendre quadrature in depth' },
			{ name: 'Mixture Models',    file: 'exp/tutorial-04-mixtures.ipynb',    bundled: true, description: 'Component-wise expectations and mixture weights via MixtureModel' },
		],
		wikis: [
			{ name: 'Overview',        file: 'exp/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'exp/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'exp/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'exp/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'exp/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'exp/decision-guide.md',  bundled: true },
		],
		tooltips: {
			distribution: 'Univariate distribution from Distributions.jl. Determines the quadrature rule: Gauss-Hermite for Normal/LogNormal, Gauss-Laguerre for Gamma/Exponential/ChiSq, Gauss-Legendre for Uniform/Beta.',
			f:            'Function whose expectation E[f(X)] is computed. Written as a Julia anonymous function, e.g. x -> x^2 or x -> log(x).',
			nodes:        'Number of quadrature nodes n. Higher values give more accurate approximations. Typical range: 10&#8211;100.',
			param1:       'First parameter of the selected distribution (meaning depends on distribution).',
			param2:       'Second parameter of the selected distribution (meaning depends on distribution).',
		},
	},
};

export function openExpWebview(
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
			title: EXP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		EXP_VIEW_TYPE,
		EXP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getExpHtml());

	registerExpWebviewHandlers(
		webviewInput,
		EXP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
