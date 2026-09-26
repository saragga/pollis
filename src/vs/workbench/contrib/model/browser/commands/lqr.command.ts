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
import { ILqrMetadata } from '../common/lqr.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerLqrWebviewHandlers } from '../handlers/lqr.handler.js';
import { getLqrHtml } from '../webviews/lqr.template.js';

const LQR_VIEW_TYPE = 'pollis.lqr';
const LQR_TITLE = 'Linear Optimal Control';

const LQR_REFERENCES: IModelReference[] = [
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
		title: 'ControlSystems.jl — A Julia Package for Control Systems Design',
		authors: 'Johansson, Kalle; Öberg, Fredrik',
		year: 2019,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.01391',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Optimal Control: An Introduction',
		authors: 'Kirk, Donald E.',
		year: 2012,
		journal: 'Dover Publications',
		url: 'https://doverpublications.com/',
		openAccess: false,
	},
	{
		title: 'Linear Control Systems Analysis and Design',
		authors: 'D\'Azzo, John J.; Houpis, Constantine H.; Sheldon, Stuart N.',
		year: 2003,
		journal: 'CRC Press (5th ed.)',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'The Linear Quadratic Regulator Problem for Finite Horizon',
		authors: 'Kalman, Rudolf E.',
		year: 1960,
		journal: 'SIAM Journal on Control',
		doi: '10.1137/0108033',
		openAccess: false,
	},
	{
		title: 'A New Approach to Linear Filtering and Prediction Problems',
		authors: 'Kalman, Rudolf E.',
		year: 1960,
		journal: 'Journal of Basic Engineering',
		doi: '10.1115/1.3662552',
		openAccess: false,
	},
	{
		title: 'The Separation Principle for Linear Quadratic Gaussian Problem',
		authors: 'Wonham, W. Murray',
		year: 1968,
		journal: 'Journal of Electronics and Control',
		doi: '10.1080/00207216808937376',
		openAccess: false,
	},
];

const LQR_METADATA: ILqrMetadata = {
	lqr: {
		packages: [
			{
				name: 'ControlSystems.jl',
				github: 'https://github.com/juliacontrol/ControlSystems.jl',
				videos: [
					{
						title: 'Julia for Control Systems',
						description: 'Introduction to control systems design using Julia',
						url: 'https://www.youtube.com/watch?v=g9V8wVrVW8Q',
					},
				],
				papers: [],
			},
		],
		references: LQR_REFERENCES,
		notebooks: [
			{ name: 'State-Feedback Design', file: 'optimal-control/tutorial-01-statefeedback.ipynb', bundled: true, description: 'LQR state-feedback gain computation via dare() and pole placement' },
			{ name: 'Output-Feedback Design', file: 'optimal-control/tutorial-02-outputfeedback.ipynb', bundled: true, description: 'LQG observer design and output-feedback control via observer canonical form' },
			{ name: 'Finite Horizon', file: 'optimal-control/tutorial-03-finite.ipynb', bundled: true, description: 'Finite horizon LQR with time-varying gains via dynamic programming' },
			{ name: 'Infinite Horizon', file: 'optimal-control/tutorial-04-infinite.ipynb', bundled: true, description: 'Infinite horizon LQR steady-state gains and stability guarantees' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'optimal-control/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'optimal-control/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'optimal-control/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'optimal-control/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'optimal-control/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'optimal-control/decision-guide.md', bundled: true },
			{ separator: true, label: 'LQR / LQG Methods' },
			{ name: 'State-Feedback', file: 'optimal-control/statefeedback.md', bundled: true },
			{ name: 'Output-Feedback', file: 'optimal-control/outputfeedback.md', bundled: true },
			{ name: 'Finite Horizon', file: 'optimal-control/finitehorizon.md', bundled: true },
			{ name: 'Infinite Horizon', file: 'optimal-control/infinitehorizon.md', bundled: true },
		],
	},
};

export function openLqrWebview(
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
			title: LQR_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		LQR_VIEW_TYPE,
		LQR_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getLqrHtml());

	registerLqrWebviewHandlers(
		webviewInput,
		LQR_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
