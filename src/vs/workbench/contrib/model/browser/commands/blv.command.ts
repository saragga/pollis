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
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { IBlvMetadata } from '../common/blv.types.js';
import { registerBlvWebviewHandlers } from '../handlers/blv.handler.js';
import { getBlvHtml } from '../webviews/blv.template.js';

const BLV_VIEW_TYPE = 'pollis.blv';
const BLV_TITLE = 'Hierarchical Optimisation';

const BLV_REFERENCES: IModelReference[] = [
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
		title: 'BilevelJuMP.jl: Modeling Bilevel Optimization Problems in Julia',
		authors: 'Dias Garcia, Joaquim; Bodin, Guillaume; Street, Alexandre',
		year: 2022,
		journal: 'INFORMS Journal on Computing',
		doi: '10.1287/ijoc.2022.1181',
		openAccess: true,
	},
	{
		title: 'HiGHS: Serial and Parallel Solution of Linear Programming',
		authors: 'Huangfu, Qi; Hall, J.A.J.',
		year: 2018,
		journal: 'Mathematical Programming Computation',
		doi: '10.1007/s12532-017-0130-5',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Bilevel Programming Problems: Theory, Algorithms and Applications to Energy Networks',
		authors: 'Dempe, Stephan; Kalashnikov, Vyacheslav; Perez-Valdes, Gerardo A.; Kalashnykova, Nataliya',
		year: 2015,
		journal: 'Springer',
		doi: '10.1007/978-3-662-45827-3',
		openAccess: false,
	},
	{
		title: 'Introduction to Bilevel Programming',
		authors: 'Dempe, Stephan',
		year: 2002,
		journal: 'Kluwer Academic Publishers',
		doi: '10.1007/b101970',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A New Algorithm for the Bilevel Programming Problem',
		authors: 'Bard, Jonathan F.; Falk, James E.',
		year: 1982,
		journal: 'Management Science',
		doi: '10.1287/mnsc.28.6.683',
		openAccess: false,
	},
	{
		title: 'On the Computation of Stackelberg-Nash Equilibria',
		authors: 'Sherali, Hanif D.',
		year: 1984,
		journal: 'Operations Research',
		doi: '10.1287/opre.32.2.322',
		openAccess: false,
	},
];

export const BLV_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Bilevel Optimisation',
				file: 'blv/tutorial-01-bilevel.ipynb',
				bundled: true,
				description: 'Leader-follower optimisation via BilevelJuMP.jl; lower-level KKT conditions reformulated as MPEC and solved with HiGHS',
			},
		],
	},
];

const BLV_METADATA: IBlvMetadata = {
	blv: {
		packages: [
			{
				name: 'BilevelJuMP.jl',
				github: 'https://github.com/joaquimg/BilevelJuMP.jl',
				papers: [],
			},
			{
				name: 'HiGHS.jl',
				github: 'https://github.com/jump-dev/HiGHS.jl',
				papers: [],
			},
		],
		notebookSections: BLV_NOTEBOOK_SECTIONS,
		notebooks: BLV_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'blv/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'blv/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'blv/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'blv/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'blv/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'blv/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Formulation' },
			{ name: 'Bilevel Optimisation', file: 'blv/bilevel.md', bundled: true },
		],
		references: BLV_REFERENCES,
	},
};

export function openBlvWebview(
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
			title: BLV_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		BLV_VIEW_TYPE,
		BLV_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getBlvHtml());

	registerBlvWebviewHandlers(
		webviewInput,
		BLV_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
