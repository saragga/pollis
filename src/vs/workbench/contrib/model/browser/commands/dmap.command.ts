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
import { IDmapMetadata } from '../common/dmap.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerDmapWebviewHandlers } from '../handlers/dmap.handler.js';
import { getDmapHtml } from '../webviews/dmap.template.js';

const DMAP_VIEW_TYPE = 'pollis.dmap';
const DMAP_TITLE = 'Discrete Maps';

const DMAP_REFERENCES: IModelReference[] = [
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
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Chaos: An Introduction to Dynamical Systems',
		authors: 'Alligood, Kathleen T.; Sauer, Tim D.; Yorke, James A.',
		year: 1996,
		journal: 'Springer',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A Two-Dimensional Mapping with a Strange Attractor',
		authors: 'Henon, Michel',
		year: 1976,
		journal: 'Communications in Mathematical Physics',
		doi: '10.1007/BF01608556',
		openAccess: false,
	},
];

export const DMAP_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{ name: 'Henon Map', file: 'dmap/tutorial-01-henon.ipynb', bundled: true, description: 'Iterate the Henon map and explore sensitivity to initial conditions' },
			{ name: 'Bifurcation Diagram', file: 'dmap/tutorial-02-bifurcation.ipynb', bundled: true, description: 'Build a bifurcation diagram by sweeping a parameter and recording attractors' },
			{ name: 'Lyapunov Exponents', file: 'dmap/tutorial-03-lyapunov.ipynb', bundled: true, description: 'Compute maximal Lyapunov exponent to classify orbits as periodic or chaotic' },
		],
	},
];

const DMAP_METADATA: IDmapMetadata = {
	dmap: {
		packages: [
			{
				name: 'DynamicalSystems.jl',
				github: 'https://github.com/JuliaDynamics/DynamicalSystems.jl',
				papers: [],
			},
		],
		notebookSections: DMAP_NOTEBOOK_SECTIONS,
		notebooks: DMAP_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'dmap/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'dmap/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'dmap/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'dmap/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'dmap/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'dmap/decision-guide.md', bundled: true },
			{ separator: true, label: 'Maps' },
			{ name: 'Fixed Points', file: 'dmap/fixed-points.md', bundled: true },
			{ name: 'Bifurcation',  file: 'dmap/bifurcation.md', bundled: true },
		],
		references: DMAP_REFERENCES,
	},
};

export function openDmapWebview(
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
			title: DMAP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DMAP_VIEW_TYPE,
		DMAP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDmapHtml());

	registerDmapWebviewHandlers(
		webviewInput,
		DMAP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
