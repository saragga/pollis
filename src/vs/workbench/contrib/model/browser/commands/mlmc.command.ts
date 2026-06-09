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
import { IMlmcMetadata } from '../common/mlmc.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerMlmcWebviewHandlers } from '../handlers/mlmc.handler.js';
import { getMlmcHtml } from '../webviews/mlmc.template.js';

const MLMC_VIEW_TYPE = 'pollis.mlmc';
const MLMC_TITLE = 'Multilevel Monte Carlo';

const MLMC_REFERENCES: IModelReference[] = [
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
		title: 'MultilevelEstimators.jl: A Framework for Multilevel Monte Carlo in Julia',
		authors: 'Robbe, Pieterjan',
		year: 2019,
		journal: 'arXiv preprint',
		doi: '10.48550/arXiv.1910.07711',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Multilevel Monte Carlo Methods',
		authors: 'Giles, Michael B.',
		year: 2015,
		journal: 'Acta Numerica',
		doi: '10.1017/S096249291500001X',
		openAccess: false,
	},
	{
		title: 'Monte Carlo Statistical Methods',
		authors: 'Robert, Christian P.; Casella, George',
		year: 2004,
		journal: 'Springer (2nd ed.)',
		doi: '10.1007/978-1-4757-4145-2',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Multilevel Monte Carlo Path Simulation',
		authors: 'Giles, Michael B.',
		year: 2008,
		journal: 'Operations Research',
		doi: '10.1287/opre.1070.0496',
		openAccess: false,
	},
	{
		title: 'Monte Carlo Complexity of Global Solution of Integral Equations',
		authors: 'Heinrich, Stefan',
		year: 1998,
		journal: 'Journal of Complexity',
		doi: '10.1006/jcom.1998.0471',
		openAccess: false,
	},
	{
		title: 'Multilevel Quasi-Monte Carlo Methods for Lognormal Diffusion Problems',
		authors: 'Kuo, Frances Y.; Scheichl, Robert; Schwab, Christoph; Sloan, Ian H.; Ullmann, Elisabeth',
		year: 2017,
		journal: 'Mathematics of Computation',
		doi: '10.1090/mcom/3207',
		openAccess: false,
	},
];

export const MLMC_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'MLMC Basics',
				file: 'mlmc/tutorial-01-mlmc.ipynb',
				bundled: true,
				description: 'Multilevel Monte Carlo with MultilevelEstimators.jl: setup, sample functions, and variance analysis',
			},
			{
				name: 'MLQMC',
				file: 'mlmc/tutorial-02-mlqmc.ipynb',
				bundled: true,
				description: 'Multilevel Quasi-Monte Carlo with lattice rules: improved convergence rates over MLMC',
			},
			{
				name: 'Diagnostics',
				file: 'mlmc/tutorial-03-diagnostics.ipynb',
				bundled: true,
				description: 'Estimating convergence rates alpha, beta, gamma and verifying the complexity theorem',
			},
		],
	},
];

const MLMC_METADATA: IMlmcMetadata = {
	mlmc: {
		packages: [
			{
				name: 'MultilevelEstimators.jl',
				github: 'https://github.com/PieterjanRobbe/MultilevelEstimators.jl',
				papers: [],
			},
		],
		notebookSections: MLMC_NOTEBOOK_SECTIONS,
		notebooks: MLMC_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'mlmc/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'mlmc/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'mlmc/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'mlmc/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'mlmc/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'mlmc/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'MLMC Algorithm',           file: 'mlmc/mlmc-algorithm.md',           bundled: true },
			{ name: 'Complexity Theorem',        file: 'mlmc/complexity-theorem.md',        bundled: true },
			{ name: 'Quasi-Monte Carlo Extension', file: 'mlmc/qmc-extension.md',          bundled: true },
		],
		references: MLMC_REFERENCES,
	},
};

export function openMlmcWebview(
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
			title: MLMC_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MLMC_VIEW_TYPE,
		MLMC_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMlmcHtml());

	registerMlmcWebviewHandlers(
		webviewInput,
		MLMC_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
