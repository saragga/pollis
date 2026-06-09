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
import { IIdoMetadata } from '../common/ido.types.js';
import { registerIdoWebviewHandlers } from '../handlers/ido.handler.js';
import { getIdoHtml } from '../webviews/ido.template.js';

const IDO_VIEW_TYPE = 'pollis.ido';
const IDO_TITLE = 'Infinite-Dimensional Optimisation';

const IDO_METADATA: IIdoMetadata = {
	ido: {
		packages: [
			{
				name: 'InfiniteOpt.jl',
				github: 'https://github.com/infiniteopt/InfiniteOpt.jl',
				papers: [
					{
						title: 'A unifying modeling abstraction for infinite-dimensional optimization',
						authors: 'Pulsipher, J. A., Zhang, W., Hongisto, T. J., & Zavala, V. M.',
						year: 2022,
						url: 'https://par.nsf.gov/servlets/purl/10388096',
						openAccess: false,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start',           file: 'ido/tutorial-01-quickstart.ipynb',    bundled: true, description: 'Formulate and solve an infinite-dimensional optimisation problem using InfiniteOpt.jl' },
			{ name: 'Optimal Control',        file: 'ido/tutorial-02-optcontrol.ipynb',    bundled: true, description: 'ODE-constrained optimal control with state and control variables over a time horizon' },
			{ name: 'Integral Objectives',    file: 'ido/tutorial-03-integral.ipynb',      bundled: true, description: 'Minimise integral objectives using Gaussian quadrature and orthogonal collocation' },
			{ name: 'Infinite Parameters',    file: 'ido/tutorial-04-parameters.ipynb',    bundled: true, description: 'Define infinite and finite parameters, add supports, and query solution values' },
		],
		wikis: [
			{ name: 'Overview',        file: 'ido/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'ido/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'ido/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'ido/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'ido/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'ido/decision-guide.md',  bundled: true },
		],
		tooltips: {
			optimizer:   'Solver passed to set_optimizer. Ipopt is the default for nonlinear continuous problems; HiGHS for linear/quadratic; Juniper for mixed-integer nonlinear.',
			T:           'Time horizon [0, T]. Defines the upper bound of the infinite parameter domain.',
			t0:          'Initial time t&#8320;. Defines the lower bound of the infinite parameter domain. Usually 0.',
			N:           'Number of orthogonal collocation supports n. Higher values increase accuracy and computation time. Typical range: 10&#8211;200.',
			deriv:       'Derivative approximation method. OrthogonalCollocation(k) uses k-th degree Gauss-Legendre collocation; Trapezoid uses the trapezoidal rule; BSpline uses B-spline basis functions.',
			objective:   'Julia expression for the objective integrand f(t, x(t), u(t)). Written as a Julia expression, e.g. u^2 or (x - x_ref)^2 + u^2.',
			n_x:         'Number of state variables x&#8321;(t), &#8230;, x_n(t). Each is an infinite variable over the time domain.',
			n_u:         'Number of control variables u&#8321;(t), &#8230;, u_n(t). Each is an infinite variable that the optimiser selects freely.',
		},
	},
};

export function openIdoWebview(
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
			title: IDO_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		IDO_VIEW_TYPE,
		IDO_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getIdoHtml());

	registerIdoWebviewHandlers(
		webviewInput,
		IDO_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
