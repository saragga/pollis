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
import { IChaosMetadata } from '../common/chaos.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerChaosWebviewHandlers } from '../handlers/chaos.handler.js';
import { getChaosHtml } from '../webviews/chaos.template.js';

const CHAOS_VIEW_TYPE = 'pollis.chaos';
const CHAOS_TITLE = 'Chaos Characterisation';

const CHAOS_REFERENCES: IModelReference[] = [
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
		title: 'Nonlinear Time Series Analysis',
		authors: 'Kantz, Holger; Schreiber, Thomas',
		year: 2004,
		journal: 'Cambridge University Press (2nd ed.)',
		openAccess: false,
	},
	{
		title: 'Chaos: Making a New Science',
		authors: 'Gleick, James',
		year: 1987,
		journal: 'Viking Penguin',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Lyapunov Characteristic Exponents for smooth dynamical systems and for Hamiltonian systems; a method for computing all of them',
		authors: 'Benettin, Giancarlo; Galgani, Luigi; Giorgilli, Antonio; Strelcyn, Jean-Marie',
		year: 1980,
		journal: 'Meccanica',
		doi: '10.1007/BF02128236',
		openAccess: false,
	},
	{
		title: 'Characterization of Strange Attractors',
		authors: 'Grassberger, Peter; Procaccia, Itamar',
		year: 1983,
		journal: 'Physical Review Letters',
		doi: '10.1103/PhysRevLett.50.346',
		openAccess: false,
	},
	{
		title: 'Recurrence Plots of Dynamical Systems',
		authors: 'Eckmann, Jean-Pierre; Kamphorst, S. Oliffson; Ruelle, David',
		year: 1987,
		journal: 'Europhysics Letters',
		doi: '10.1209/0295-5075/4/9/004',
		openAccess: false,
	},
];

const CHAOS_METADATA: IChaosMetadata = {
	chaos: {
		packages: [
			{
				name: 'DynamicalSystems.jl',
				github: 'https://github.com/JuliaDynamics/DynamicalSystems.jl',
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
			{ name: 'Lyapunov Exponents',     file: 'dyn-chaos/tutorial-01-lyapunov.ipynb',    bundled: true, description: 'Compute the full Lyapunov spectrum and maximal exponent to quantify sensitivity to initial conditions' },
			{ name: 'Fractal Dimension',       file: 'dyn-chaos/tutorial-02-fractal-dim.ipynb', bundled: true, description: 'Estimate the correlation dimension of an attractor using the Grassberger-Procaccia algorithm' },
			{ name: 'Recurrence Analysis',     file: 'dyn-chaos/tutorial-03-rqa.ipynb',         bundled: true, description: 'Build a recurrence matrix and compute RQA measures (RR, DET, LAM) for a time series' },
		],
		wikis: [
			{ name: 'Factsheet',              file: 'dyn-chaos/factsheet.md',      bundled: true },
			{ name: 'Overview',               file: 'dyn-chaos/overview.md',        bundled: true },
			{ name: 'Assumptions',            file: 'dyn-chaos/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',            file: 'dyn-chaos/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',         file: 'dyn-chaos/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',         file: 'dyn-chaos/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Characterisation Methods' },
			{ name: 'Lyapunov Exponents',     file: 'dyn-chaos/lyapunov.md',        bundled: true },
			{ name: 'Fractal Dimension',       file: 'dyn-chaos/fractal-dim.md',     bundled: true },
			{ name: 'Recurrence Analysis',     file: 'dyn-chaos/rqa.md',             bundled: true },
		],
		references: CHAOS_REFERENCES,
	},
};

export function openChaosWebview(
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
			title: CHAOS_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CHAOS_VIEW_TYPE,
		CHAOS_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getChaosHtml());

	registerChaosWebviewHandlers(
		webviewInput,
		CHAOS_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
