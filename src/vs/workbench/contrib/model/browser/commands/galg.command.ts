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
import { IGalgMetadata } from '../common/galg.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerGalgWebviewHandlers } from '../handlers/galg.handler.js';
import { getGalgHtml } from '../webviews/galg.template.js';

const GALG_VIEW_TYPE = 'pollis.galg';
const GALG_TITLE = 'Genetic Algorithms';

const GALG_REFERENCES: IModelReference[] = [
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
		title: 'Evolutionary.jl: A Julia package for evolutionary algorithms',
		authors: 'Poliak, Art',
		year: 2021,
		journal: 'GitHub',
		doi: '10.5281/zenodo.5781169',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Introduction to Evolutionary Computing',
		authors: 'Eiben, A. E.; Smith, J. E.',
		year: 2015,
		journal: 'Springer',
		doi: '10.1007/978-3-662-44874-8',
		openAccess: false,
	},
	{
		title: 'Genetic Algorithms in Search, Optimization, and Machine Learning',
		authors: 'Goldberg, David E.',
		year: 1989,
		journal: 'Addison-Wesley',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'The Compact Genetic Algorithm',
		authors: 'Harik, Georges R.; Lobo, Fernando G.; Goldberg, David E.',
		year: 1999,
		journal: 'IEEE Transactions on Evolutionary Computation',
		doi: '10.1109/4235.797971',
		openAccess: false,
	},
	{
		title: 'Biased Random-Key Genetic Algorithms for Combinatorial Optimization',
		authors: 'Gon&#231;alves, Jos&#233; Fernando; Resende, Mauricio G. C.',
		year: 2011,
		journal: 'Journal of Heuristics',
		doi: '10.1007/s10732-010-9143-1',
		openAccess: false,
	},
	{
		title: 'A Genetic Algorithm Tutorial',
		authors: 'Whitley, Darrell',
		year: 1994,
		journal: 'Statistics and Computing',
		doi: '10.1007/BF00175354',
		openAccess: false,
	},
];

export const GALG_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Classic GA',
				file: 'galg/tutorial-01-ga.ipynb',
				bundled: true,
				description: 'GA with Evolutionary.jl: selection, crossover, mutation, and convergence',
			},
			{
				name: 'Compact GA',
				file: 'galg/tutorial-02-cga.ipynb',
				bundled: true,
				description: 'Compact GA: probability vector representation and incremental updates',
			},
			{
				name: 'BRKGA',
				file: 'galg/tutorial-03-brkga.ipynb',
				bundled: true,
				description: 'BRKGA: biased random-key encoding and elite/non-elite crossover',
			},
		],
	},
];

const GALG_METADATA: IGalgMetadata = {
	galg: {
		packages: [
			{
				name: 'Evolutionary.jl',
				github: 'https://github.com/wildart/Evolutionary.jl',
				papers: [],
			},
		],
		notebookSections: GALG_NOTEBOOK_SECTIONS,
		notebooks: GALG_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'galg/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'galg/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'galg/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'galg/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'galg/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'galg/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'Classic GA',  file: 'galg/ga.md',    bundled: true },
			{ name: 'Compact GA',  file: 'galg/cga.md',   bundled: true },
			{ name: 'BRKGA',       file: 'galg/brkga.md', bundled: true },
		],
		references: GALG_REFERENCES,
	},
};

export function openGalgWebview(
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
			title: GALG_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		GALG_VIEW_TYPE,
		GALG_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getGalgHtml());

	registerGalgWebviewHandlers(
		webviewInput,
		GALG_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
