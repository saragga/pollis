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
import { ISregMetadata } from '../common/sreg.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerSregWebviewHandlers } from '../handlers/sreg.handler.js';
import { getSregHtml } from '../webviews/sreg.template.js';

const SREG_VIEW_TYPE = 'pollis.sreg';
const SREG_TITLE = 'Symbolic Regression';

const SREG_REFERENCES: IModelReference[] = [
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
		title: 'Interpretable Machine Learning for Science with PySR and SymbolicRegression.jl',
		authors: 'Cranmer, Miles',
		year: 2023,
		journal: 'arXiv',
		doi: '10.48550/arXiv.2305.01582',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Genetic Programming: On the Programming of Computers by Means of Natural Selection',
		authors: 'Koza, John R.',
		year: 1992,
		journal: 'MIT Press',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Distilling Free-Form Natural Laws from Experimental Data',
		authors: 'Schmidt, Michael; Lipson, Hod',
		year: 2009,
		journal: 'Science',
		doi: '10.1126/science.1165893',
		openAccess: false,
	},
	{
		title: 'Discovering Symbolic Models from Deep Learning with Inductive Biases',
		authors: 'Cranmer, Miles; Sanchez-Gonzalez, Alvaro; Battaglia, Peter; Xu, Rui; Cranmer, Kyle; Spergel, David; Ho, Shirley',
		year: 2020,
		journal: 'NeurIPS',
		doi: '10.48550/arXiv.2006.11287',
		openAccess: true,
	},
];

export const SREG_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Basic Search',
				file: 'sreg/tutorial-01-basic.ipynb',
				bundled: true,
				description: 'Run equation_search on a toy dataset and inspect the Pareto frontier of discovered expressions',
			},
			{
				name: 'Custom Operators',
				file: 'sreg/tutorial-02-operators.ipynb',
				bundled: true,
				description: 'Define custom binary and unary operators and control expression complexity with maxsize',
			},
			{
				name: 'Pareto Analysis',
				file: 'sreg/tutorial-03-pareto.ipynb',
				bundled: true,
				description: 'Analyse complexity-accuracy trade-offs using calculate_pareto_frontier and string_tree',
			},
		],
	},
];

const SREG_METADATA: ISregMetadata = {
	sreg: {
		packages: [
			{
				name: 'SymbolicRegression.jl',
				github: 'https://github.com/MilesCranmer/SymbolicRegression.jl',
				papers: [],
			},
		],
		notebookSections: SREG_NOTEBOOK_SECTIONS,
		notebooks: SREG_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'sreg/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'sreg/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'sreg/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'sreg/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'sreg/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'sreg/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'Expression Trees',   file: 'sreg/expression-trees.md',   bundled: true },
			{ name: 'Operators',          file: 'sreg/operators.md',           bundled: true },
			{ name: 'Pareto Frontier',    file: 'sreg/pareto-frontier.md',     bundled: true },
		],
		references: SREG_REFERENCES,
	},
};

export function openSregWebview(
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
			title: SREG_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		SREG_VIEW_TYPE,
		SREG_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSregHtml());

	registerSregWebviewHandlers(
		webviewInput,
		SREG_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
