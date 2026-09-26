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
import { IPgoMetadata } from '../common/pgo.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerPgoWebviewHandlers } from '../handlers/pgo.handler.js';
import { getPgoHtml } from '../webviews/pgo.template.js';

const PGO_VIEW_TYPE = 'pollis.pgo';
const PGO_TITLE = 'Principled Global Search with Local Refinement';

const PGO_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Julia: A Fresh Approach to Numerical Computing',
		authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/141000671',
		openAccess: false,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Introduction to Global Optimization',
		authors: 'Neumaier, Arnold',
		year: 2004,
		journal: 'Cambridge University Press',
		doi: '10.1017/CBO9780511569029',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Stochastic Global Optimization Methods Part I: Clustering Methods',
		authors: 'Rinnooy Kan, A. H. G.; Timmer, G. T.',
		year: 1987,
		journal: 'Mathematical Programming',
		doi: '10.1007/BF02592071',
		openAccess: false,
	},
	{
		title: 'An Adaptive Approach to Stochastic Global Optimization',
		authors: 'Madsen, Kaj; Zertchaninov, Serguei',
		year: 1998,
		journal: 'Technical Report',
		openAccess: false,
	},
	{
		title: 'Lipschitz Global Optimization',
		authors: 'Strongin, Roman G.; Sergeyev, Yaroslav D.',
		year: 2000,
		journal: 'Springer',
		doi: '10.1007/978-1-4615-4677-1',
		openAccess: false,
	},
];

export const PGO_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'MLSL',
				file: 'pgo/tutorial-01-mlsl.ipynb',
				bundled: true,
				description: 'Multi-Level Single-Linkage with NLopt.jl: multi-start local search with clustering to avoid repeated basins',
			},
			{
				name: 'StoGO-R',
				file: 'pgo/tutorial-02-stogo-r.ipynb',
				bundled: true,
				description: 'Randomised stochastic branch-and-bound with NLopt.jl: gradient-based bounding with random branching',
			},
			{
				name: 'AGS',
				file: 'pgo/tutorial-03-ags.ipynb',
				bundled: true,
				description: 'Adaptive Global Search with NLopt.jl: Lipschitz model-based global optimisation',
			},
		],
	},
];

const PGO_METADATA: IPgoMetadata = {
	pgo: {
		packages: [
			{
				name: 'NLopt.jl',
				github: 'https://github.com/JuliaOpt/NLopt.jl',
				papers: [],
			},
		],
		notebookSections: PGO_NOTEBOOK_SECTIONS,
		notebooks: PGO_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'pgo/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'pgo/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'pgo/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'pgo/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'pgo/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'pgo/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'MLSL',    file: 'pgo/mlsl.md',    bundled: true },
			{ name: 'StoGO-R', file: 'pgo/stogo-r.md', bundled: true },
			{ name: 'AGS',     file: 'pgo/ags.md',     bundled: true },
		],
		references: PGO_REFERENCES,
	},
};

export function openPgoWebview(
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
			title: PGO_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		PGO_VIEW_TYPE,
		PGO_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getPgoHtml());

	registerPgoWebviewHandlers(
		webviewInput,
		PGO_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
