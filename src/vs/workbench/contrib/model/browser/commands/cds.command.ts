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
import { ICdsMetadata } from '../common/cds.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerCdsWebviewHandlers } from '../handlers/cds.handler.js';
import { getCdsHtml } from '../webviews/cds.template.js';

const CDS_VIEW_TYPE = 'pollis.cds';
const CDS_TITLE = 'Continuous Dynamical Systems';

const CDS_REFERENCES: IModelReference[] = [
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
		title: 'DynamicalSystems.jl: A Julia software library for chaos and nonlinear dynamics',
		authors: 'Datseris, George',
		year: 2018,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.00598',
		openAccess: true,
	},
	{
		title: 'DifferentialEquations.jl: A Performant and Feature-Rich Ecosystem for Solving Differential Equations in Julia',
		authors: 'Rackauckas, Christopher; Nie, Qing',
		year: 2017,
		journal: 'Journal of Open Research Software',
		doi: '10.5334/jors.151',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Nonlinear Dynamics and Chaos',
		authors: 'Strogatz, Steven H.',
		year: 2015,
		journal: 'Westview Press (2nd ed.)',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Deterministic Nonperiodic Flow',
		authors: 'Lorenz, Edward N.',
		year: 1963,
		journal: 'Journal of the Atmospheric Sciences',
		doi: '10.1175/1520-0469(1963)020<0130:DNF>2.0.CO;2',
		openAccess: false,
	},
];

export const CDS_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{ name: 'Lorenz System', file: 'cds/tutorial-01-lorenz.ipynb', bundled: true, description: 'Define and simulate the Lorenz system using CoupledODEs and trajectory' },
			{ name: 'Poincare Sections', file: 'cds/tutorial-02-poincare.ipynb', bundled: true, description: 'Compute Poincare sections of a continuous flow to reduce phase-space dimensionality' },
			{ name: 'Parameter Sensitivity', file: 'cds/tutorial-03-sensitivity.ipynb', bundled: true, description: 'Explore how trajectories change with system parameters using reinit! and re-simulation' },
		],
	},
];

const CDS_METADATA: ICdsMetadata = {
	cds: {
		packages: [
			{
				name: 'DynamicalSystems.jl',
				github: 'https://github.com/JuliaDynamics/DynamicalSystems.jl',
				papers: [],
			},
		],
		notebookSections: CDS_NOTEBOOK_SECTIONS,
		notebooks: CDS_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'cds/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'cds/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'cds/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'cds/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'cds/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'cds/decision-guide.md', bundled: true },
			{ separator: true, label: 'ODE Systems' },
			{ name: 'Solvers',           file: 'cds/solvers.md',   bundled: true },
			{ name: 'Poincare Sections', file: 'cds/poincare.md',  bundled: true },
		],
		references: CDS_REFERENCES,
	},
};

export function openCdsWebview(
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
			title: CDS_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CDS_VIEW_TYPE,
		CDS_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCdsHtml());

	registerCdsWebviewHandlers(
		webviewInput,
		CDS_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
