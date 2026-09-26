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
import { IDsMetadata } from '../common/ds.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerDsWebviewHandlers } from '../handlers/ds.handler.js';
import { getDsHtml } from '../webviews/ds.template.js';

const DS_VIEW_TYPE = 'pollis.ds';
const DS_TITLE = 'Direct Search Methods';

const DS_REFERENCES: IModelReference[] = [
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
	{
		title: 'Introduction to Derivative-Free Optimization',
		authors: 'Conn, Andrew R.; Scheinberg, Katya; Vicente, Luis N.',
		year: 2009,
		journal: 'SIAM',
		doi: '10.1137/1.9780898718768',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A Simplex Method for Function Minimization',
		authors: 'Nelder, John A.; Mead, Roger',
		year: 1965,
		journal: 'The Computer Journal',
		doi: '10.1093/comjnl/7.4.308',
		openAccess: false,
	},
	{
		title: 'Optimization by Direct Search: New Perspectives on Some Classical and Modern Methods',
		authors: 'Kolda, Tamara G.; Lewis, Robert M.; Torczon, Virginia',
		year: 2003,
		journal: 'SIAM Review',
		doi: '10.1137/S003614450242889',
		openAccess: false,
	},
	{
		title: 'Mesh Adaptive Direct Search Algorithms for Constrained Optimization',
		authors: 'Audet, Charles; Dennis, John E.',
		year: 2006,
		journal: 'SIAM Journal on Optimization',
		doi: '10.1137/040603371',
		openAccess: false,
	},
	{
		title: 'Generating Set Search Methods',
		authors: 'Kolda, Tamara G.; Lewis, Robert M.; Torczon, Virginia',
		year: 2006,
		journal: 'SIAM Review',
		doi: '10.1137/S003614450242889',
		openAccess: false,
	},
];

const DS_METADATA: IDsMetadata = {
	ds: {
		packages: [
			{
				name: 'Optim.jl',
				github: 'https://github.com/JuliaNLSolvers/Optim.jl',
				papers: [
					{
						title: 'Optim: A mathematical optimization package for Julia',
						authors: 'Mogensen, Patrick Kofod; Riseth, Asbjorn Nilsen',
						year: 2018,
						journal: 'Journal of Open Source Software',
						doi: '10.21105/joss.00615',
						openAccess: true,
					},
				],
			},
			{
				name: 'DirectSearch.jl',
				github: 'https://github.com/ImperialCollegeLondon/DirectSearch.jl',
				papers: [],
			},
		],
		notebooks: [
			{
				name: 'Nelder-Mead Simplex',
				file: 'ds/tutorial-01-nelder-mead.ipynb',
				bundled: true,
				description: 'Derivative-free minimisation using the Nelder-Mead simplex algorithm in Optim.jl',
			},
			{
				name: 'Pattern Search (GPS)',
				file: 'ds/tutorial-02-pattern-search.ipynb',
				bundled: true,
				description: 'Generalized pattern search with structured coordinate polls in DirectSearch.jl',
			},
			{
				name: 'Mesh Adaptive Direct Search (MADS)',
				file: 'ds/tutorial-03-mads.ipynb',
				bundled: true,
				description: 'OrthoMADS algorithm with provable convergence guarantees via DirectSearch.jl',
			},
			{
				name: 'Generating Set Search (GSS)',
				file: 'ds/tutorial-04-gss.ipynb',
				bundled: true,
				description: 'Generating set search for non-smooth objectives via DirectSearch.jl',
			},
			{
				name: 'Benchmarking Direct Search Methods',
				file: 'ds/tutorial-05-benchmark.ipynb',
				bundled: true,
				description: 'Compare NelderMead, GPS, OrthoMADS and GSS on standard test functions',
			},
		],
		wikis: [
			{ name: 'Factsheet',              file: 'ds/factsheet.md',              bundled: true },
			{ name: 'Overview',               file: 'ds/overview.md',               bundled: true },
			{ name: 'Assumptions',            file: 'ds/assumptions.md',            bundled: true },
			{ name: 'Diagnostics',            file: 'ds/diagnostics.md',            bundled: true },
			{ name: 'Interpretation',         file: 'ds/interpretation.md',         bundled: true },
			{ name: 'Decision Guide',         file: 'ds/decision-guide.md',         bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'Nelder-Mead',            file: 'ds/nelder-mead.md',            bundled: true },
			{ name: 'Pattern Search',         file: 'ds/pattern-search.md',         bundled: true },
			{ name: 'MADS',                   file: 'ds/mads.md',                   bundled: true },
			{ name: 'Generating Set Search',  file: 'ds/generating-set-search.md',  bundled: true },
		],
		references: DS_REFERENCES,
	},
};

export function openDsWebview(
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
			title: DS_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DS_VIEW_TYPE,
		DS_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDsHtml());

	registerDsWebviewHandlers(
		webviewInput,
		DS_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
