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
import { IFoMetadata } from '../common/fo.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerFoWebviewHandlers } from '../handlers/fo.handler.js';
import { getFoHtml } from '../webviews/fo.template.js';

const FO_VIEW_TYPE = 'pollis.fo';
const FO_TITLE = 'First-Order Methods';

const FO_REFERENCES: IModelReference[] = [
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
		title: 'Optim: A mathematical optimization package for Julia',
		authors: 'Mogensen, Patrick Kofod; Riseth, Asbjorn Nilsen',
		year: 2018,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.00615',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Numerical Optimization',
		authors: 'Nocedal, Jorge; Wright, Stephen J.',
		year: 2006,
		journal: 'Springer (2nd ed.)',
		doi: '10.1007/978-0-387-40065-5',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Function Minimization by Conjugate Gradients',
		authors: 'Fletcher, Roger; Reeves, Colin M.',
		year: 1964,
		journal: 'Computer Journal',
		doi: '10.1093/comjnl/7.2.149',
		openAccess: false,
	},
	{
		title: 'Note sur la convergence de methodes de directions conjuguees',
		authors: 'Polak, Elijah; Ribiere, Gerard',
		year: 1969,
		journal: 'Revue Francaise Informatique Recherche Operationnelle',
		openAccess: false,
	},
	{
		title: 'A New Conjugate Gradient Method with Guaranteed Descent and an Efficient Line Search',
		authors: 'Hager, William W.; Zhang, Hongchao',
		year: 2005,
		journal: 'SIAM Journal on Optimization',
		doi: '10.1137/030601880',
		openAccess: false,
	},
];

const FO_METADATA: IFoMetadata = {
	fo: {
		packages: [
			{
				name: 'Optim.jl',
				github: 'https://github.com/JuliaNLSolvers/Optim.jl',
				papers: [],
			},
		],
		notebooks: [
			{
				name: 'Gradient Descent',
				file: 'fo/tutorial-01-gradient-descent.ipynb',
				bundled: true,
				description: 'Steepest descent with Wolfe line search using GradientDescent() in Optim.jl',
			},
			{
				name: 'Conjugate Gradient',
				file: 'fo/tutorial-02-conjugate-gradient.ipynb',
				bundled: true,
				description: 'Hager-Zhang conjugate gradient with guaranteed descent via ConjugateGradient()',
			},
			{
				name: 'Line Search Options',
				file: 'fo/tutorial-03-linesearch.ipynb',
				bundled: true,
				description: 'Customising line search: step bounds, Wolfe conditions, and backtracking strategies',
			},
			{
				name: 'Benchmarking First-Order Methods',
				file: 'fo/tutorial-04-benchmark.ipynb',
				bundled: true,
				description: 'Compare GradientDescent and ConjugateGradient on standard test functions',
			},
		],
		wikis: [
			{ name: 'Factsheet',             file: 'fo/factsheet.md',             bundled: true },
			{ name: 'Overview',              file: 'fo/overview.md',              bundled: true },
			{ name: 'Assumptions',           file: 'fo/assumptions.md',           bundled: true },
			{ name: 'Diagnostics',           file: 'fo/diagnostics.md',           bundled: true },
			{ name: 'Interpretation',        file: 'fo/interpretation.md',        bundled: true },
			{ name: 'Decision Guide',        file: 'fo/decision-guide.md',        bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'Gradient Descent',      file: 'fo/gradient-descent.md',      bundled: true },
			{ name: 'Conjugate Gradient',    file: 'fo/conjugate-gradient.md',    bundled: true },
		],
		references: FO_REFERENCES,
	},
};

export function openFoWebview(
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
			title: FO_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		FO_VIEW_TYPE,
		FO_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getFoHtml());

	registerFoWebviewHandlers(
		webviewInput,
		FO_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
