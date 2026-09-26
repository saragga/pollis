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
import { IPtpsMetadata } from '../common/ptps.types.js';
import { IModelReference, IModelNotebookSection } from '../../../model/browser/common/model.types.js';
import { registerPtpsWebviewHandlers } from '../handlers/ptps.handler.js';
import { getPtpsHtml } from '../webviews/ptps.template.js';

const PTPS_VIEW_TYPE = 'pollis.ptps';
const PTPS_TITLE = 'Point Process Simulation';

const PTPS_REFERENCES: IModelReference[] = [
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
		title: 'An Introduction to the Theory of Point Processes, Vol. I: Elementary Theory and Methods',
		authors: 'Daley, Daryl J.; Vere-Jones, David',
		year: 2003,
		journal: 'Springer (2nd ed.)',
		url: 'https://link.springer.com/book/9780387955414',
		openAccess: false,
	},
	{
		title: 'Stochastic Processes',
		authors: 'Ross, Sheldon M.',
		year: 2014,
		journal: 'Wiley (3rd ed.)',
		url: 'https://www.wiley.com/en-us/Stochastic+Processes%2C+3rd+Edition-p-9780471120629',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'On Lewis Simulation Method for Point Processes',
		authors: 'Ogata, Yosihiko',
		year: 1981,
		journal: 'IEEE Transactions on Information Theory',
		doi: '10.1109/TIT.1981.1056305',
		openAccess: false,
	},
	{
		title: 'Simulation of Nonhomogeneous Poisson Processes by Thinning',
		authors: 'Lewis, Peter A.W.; Shedler, Gerald S.',
		year: 1979,
		journal: 'Naval Research Logistics Quarterly',
		doi: '10.1002/nav.3800260304',
		openAccess: false,
	},
	{
		title: 'Spectra of Some Self-Exciting and Mutually Exciting Point Processes',
		authors: 'Hawkes, Alan G.',
		year: 1971,
		journal: 'Biometrika',
		doi: '10.1093/biomet/58.1.83',
		openAccess: false,
	},
];

export const PTPS_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Poisson Processes',
		notebooks: [
			{ name: 'Poisson Simulation', file: 'ptp/ptp-poisson-01-simulation.ipynb', bundled: true, description: 'Homogeneous Poisson process: direct simulation via exponential inter-arrival times' },
			{ name: 'Inhomogeneous Poisson', file: 'ptp/ptp-inhomogeneous-01-simulation.ipynb', bundled: true, description: 'Inhomogeneous Poisson process: Lewis-Shedler thinning with a time-varying rate' },
		],
	},
	{
		label: 'Hawkes Processes',
		notebooks: [
			{ name: 'Hawkes Simulation', file: 'ptp/ptp-hawkes-01-simulation.ipynb', bundled: true, description: 'Hawkes process simulation via Ogata thinning: self-excitation and branching structure' },
			{ name: 'Network Hawkes', file: 'ptp/ptp-network-01-simulation.ipynb', bundled: true, description: 'Multivariate Network Hawkes simulation: directed cross-excitation via weight matrix W' },
		],
	},
	{
		label: 'Advanced',
		notebooks: [
			{ name: 'Cox Process', file: 'ptp/ptp-cox-01-simulation.ipynb', bundled: true, description: 'Log-Gaussian Cox process: GP intensity sampling then conditional Poisson simulation' },
		],
	},
];

const PTPS_METADATA: IPtpsMetadata = {
	ptps: {
		packages: [
			{ name: 'PointProcesses.jl', github: 'https://github.com/JoseKling/PointProcesses.jl', papers: [] },
			{ name: 'HawkesProcesses.jl', github: 'https://github.com/dmillot/HawkesProcesses.jl', papers: [] },
			{ name: 'NetworkHawkesProcesses.jl', github: 'https://github.com/cswaney/NetworkHawkesProcesses.jl', papers: [] },
		],
		notebookSections: PTPS_NOTEBOOK_SECTIONS,
		notebooks: PTPS_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'ptp/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'ptp/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'ptp/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'ptp/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'ptp/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'ptp/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Process Types' },
			{ name: 'Poisson Process',    file: 'ptp/poisson-process.md',    bundled: true },
			{ name: 'Hawkes Process',     file: 'ptp/hawkes-process.md',     bundled: true },
			{ name: 'Cox Process',        file: 'ptp/cox-process.md',        bundled: true },
			{ name: 'Network Hawkes',     file: 'ptp/network-hawkes.md',     bundled: true },
			{ name: 'Intensity Function', file: 'ptp/intensity-function.md', bundled: true },
			{ name: 'Goodness of Fit',    file: 'ptp/goodness-of-fit.md',   bundled: true },
		],
		references: PTPS_REFERENCES,
	},
};

export function openPtpsWebview(
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
			title: PTPS_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		PTPS_VIEW_TYPE,
		PTPS_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getPtpsHtml());

	registerPtpsWebviewHandlers(
		webviewInput,
		PTPS_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
