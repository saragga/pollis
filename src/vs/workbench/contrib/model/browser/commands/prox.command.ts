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
import { IProxMetadata } from '../common/prox.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerProxWebviewHandlers } from '../handlers/prox.handler.js';
import { getProxHtml } from '../webviews/prox.template.js';

const PROX_VIEW_TYPE = 'pollis.prox';
const PROX_TITLE = 'Nonsmooth and Proximal Optimisation';

const PROX_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Julia: A Fresh Approach to Numerical Computing',
		authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/141000671',
		openAccess: false,
	},
	{
		title: 'ProximalAlgorithms.jl: Proximal algorithms for nonsmooth optimisation in Julia',
		authors: 'Themelis, Andreas; Stella, Lorenzo; Patrinos, Panagiotis',
		year: 2020,
		journal: 'GitHub',
		openAccess: true,
	},
	{
		title: 'ProximalOperators.jl: Proximal operators for nonsmooth optimisation',
		authors: 'Stella, Lorenzo; Themelis, Andreas; Patrinos, Panagiotis',
		year: 2017,
		journal: 'GitHub',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Proximal Algorithms',
		authors: 'Parikh, Neal; Boyd, Stephen',
		year: 2014,
		journal: 'Foundations and Trends in Optimization',
		doi: '10.1561/2400000003',
		openAccess: true,
	},
	{
		title: 'Convex Analysis and Minimization Algorithms I',
		authors: 'Hiriart-Urruty, Jean-Baptiste; Lemar&#233;chal, Claude',
		year: 1993,
		journal: 'Springer',
		doi: '10.1007/978-3-662-02796-7',
		openAccess: false,
	},
	{
		title: 'First-Order Methods in Optimization',
		authors: 'Beck, Amir',
		year: 2017,
		journal: 'SIAM',
		doi: '10.1137/1.9781611974997',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Minimization of Nonsmooth Functionals',
		authors: 'Polyak, Boris T.',
		year: 1969,
		journal: 'USSR Computational Mathematics and Mathematical Physics',
		doi: '10.1016/0041-5553(69)90061-5',
		openAccess: false,
	},
	{
		title: 'An Extension of the Method of Subgradients',
		authors: 'Lemar&#233;chal, Claude',
		year: 1975,
		journal: 'Symposia Mathematica',
		openAccess: false,
	},
	{
		title: 'A First-Order Primal-Dual Algorithm for Convex Problems with Applications to Imaging',
		authors: 'Chambolle, Antonin; Pock, Thomas',
		year: 2011,
		journal: 'Journal of Mathematical Imaging and Vision',
		doi: '10.1007/s10851-010-0251-1',
		openAccess: false,
	},
	{
		title: 'Splitting Algorithms for the Sum of Two Nonlinear Operators',
		authors: 'Lions, Pierre-Louis; Mercier, Bertrand',
		year: 1979,
		journal: 'SIAM Journal on Numerical Analysis',
		doi: '10.1137/0716071',
		openAccess: false,
	},
	{
		title: 'Monotone Operators and the Proximal Point Algorithm',
		authors: 'Rockafellar, R. Tyrrell',
		year: 1976,
		journal: 'SIAM Journal on Control and Optimization',
		doi: '10.1137/0314056',
		openAccess: false,
	},
];

export const PROX_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Subgradient',
				file: 'prox/tutorial-01-subgradient.ipynb',
				bundled: true,
				description: 'Subgradient method with diminishing step sizes for nonsmooth objectives',
			},
			{
				name: 'Bundle Methods',
				file: 'prox/tutorial-02-bundle.ipynb',
				bundled: true,
				description: 'Proximal bundle method: cutting-plane model with stability centre',
			},
			{
				name: 'Chambolle-Pock',
				file: 'prox/tutorial-03-chambolle-pock.ipynb',
				bundled: true,
				description: 'Primal-dual splitting for min f(x) + g(Kx) with ProximalAlgorithms.jl',
			},
			{
				name: 'Douglas-Rachford',
				file: 'prox/tutorial-04-douglas-rachford.ipynb',
				bundled: true,
				description: 'Operator splitting for min f(x) + g(x) with ProximalAlgorithms.jl',
			},
			{
				name: 'Proximal Point',
				file: 'prox/tutorial-05-proximal-point.ipynb',
				bundled: true,
				description: 'Classic proximal point algorithm for nonsmooth convex minimisation',
			},
		],
	},
];

const PROX_METADATA: IProxMetadata = {
	prox: {
		packages: [
			{
				name: 'ProximalAlgorithms.jl',
				github: 'https://github.com/JuliaFirstOrder/ProximalAlgorithms.jl',
				papers: [],
			},
			{
				name: 'ProximalOperators.jl',
				github: 'https://github.com/JuliaFirstOrder/ProximalOperators.jl',
				papers: [],
			},
		],
		notebookSections: PROX_NOTEBOOK_SECTIONS,
		notebooks: PROX_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'prox/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'prox/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'prox/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'prox/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'prox/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'prox/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'Subgradient',          file: 'prox/subgradient.md',          bundled: true },
			{ name: 'Bundle Methods',        file: 'prox/bundle.md',               bundled: true },
			{ name: 'Chambolle-Pock',        file: 'prox/chambolle-pock.md',       bundled: true },
			{ name: 'Douglas-Rachford',      file: 'prox/douglas-rachford.md',     bundled: true },
			{ name: 'Proximal Point',        file: 'prox/proximal-point.md',       bundled: true },
		],
		references: PROX_REFERENCES,
	},
};

export function openProxWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	initialModel?: string,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: PROX_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		PROX_VIEW_TYPE,
		PROX_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getProxHtml());

	registerProxWebviewHandlers(
		webviewInput,
		PROX_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
