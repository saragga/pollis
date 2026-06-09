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
import { IAttrMetadata } from '../common/attr.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerAttrWebviewHandlers } from '../handlers/attr.handler.js';
import { getAttrHtml } from '../webviews/attr.template.js';

const ATTR_VIEW_TYPE = 'pollis.attr';
const ATTR_TITLE = 'Attractor & Basin Analysis';

const ATTR_REFERENCES: IModelReference[] = [
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
		title: 'Nonlinear Dynamics and Chaos',
		authors: 'Strogatz, Steven H.',
		year: 2015,
		journal: 'Westview Press (2nd ed.)',
		openAccess: false,
	},
	{
		title: 'An Introduction to Dynamical Systems and Chaos',
		authors: 'Layek, G. C.',
		year: 2015,
		journal: 'Springer',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Attractors on an N-Torus: Quasiperiodicity versus Chaos',
		authors: 'Grebogi, Celso; Ott, Edward; Yorke, James A.',
		year: 1985,
		journal: 'Physica D: Nonlinear Phenomena',
		doi: '10.1016/0167-2789(85)90182-4',
		openAccess: false,
	},
	{
		title: 'Effortless estimation of basins of attraction',
		authors: 'Datseris, George; Wagemakers, Alexandre',
		year: 2022,
		journal: 'Chaos',
		doi: '10.1063/5.0076568',
		openAccess: true,
	},
	{
		title: 'Continuation of bifurcations for dynamical systems',
		authors: 'Kuehn, Christian',
		year: 2015,
		journal: 'Springer',
		openAccess: false,
	},
];

const ATTR_METADATA: IAttrMetadata = {
	attr: {
		packages: [
			{
				name: 'Attractors.jl',
				github: 'https://github.com/JuliaDynamics/Attractors.jl',
				papers: [],
				videos: [
					{
						title: 'Julia in Academia',
						description: 'Overview of Julia for academic and scientific computing',
						url: 'https://www.youtube.com/watch?v=wPFPT-Ech2c',
					},
				],
			},
		],
		notebooks: [
			{ name: 'Finding Attractors',      file: 'dyn-attr/tutorial-01-attractors.ipynb',   bundled: true, description: 'Find all attractors of a system using AttractorsViaRecurrences on a state-space grid' },
			{ name: 'Basins of Attraction',    file: 'dyn-attr/tutorial-02-basins.ipynb',        bundled: true, description: 'Map the basin of attraction for each attractor and compute basin fractions' },
			{ name: 'Bifurcation Diagrams',    file: 'dyn-attr/tutorial-03-bifurcation.ipynb',   bundled: true, description: 'Trace how attractors change as a parameter varies using global_continuation' },
		],
		wikis: [
			{ name: 'Factsheet',              file: 'dyn-attr/factsheet.md',      bundled: true },
			{ name: 'Overview',               file: 'dyn-attr/overview.md',        bundled: true },
			{ name: 'Assumptions',            file: 'dyn-attr/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',            file: 'dyn-attr/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',         file: 'dyn-attr/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',         file: 'dyn-attr/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Analysis Methods' },
			{ name: 'Attractor Finding',      file: 'dyn-attr/attractors.md',      bundled: true },
			{ name: 'Basins of Attraction',   file: 'dyn-attr/basins.md',           bundled: true },
			{ name: 'Bifurcation Diagrams',   file: 'dyn-attr/bifurcation.md',      bundled: true },
		],
		references: ATTR_REFERENCES,
	},
};

export function openAttrWebview(
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
			title: ATTR_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		ATTR_VIEW_TYPE,
		ATTR_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getAttrHtml());

	registerAttrWebviewHandlers(
		webviewInput,
		ATTR_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
