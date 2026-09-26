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
import { ITssmMetadata } from '../common/tssm.types.js';
import { IModelReference } from '../../../model/browser/common/model.types.js';
import { registerTssmWebviewHandlers } from '../handlers/tssm.handler.js';
import { getTssmHtml } from '../webviews/tssm.template.js';

const TSSM_VIEW_TYPE = 'pollis.tssm';
const TSSM_TITLE = 'State Space Models';

const TSSM_REFERENCES: IModelReference[] = [
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
		title: 'StateSpaceModels.jl: A Julia Package for Time-Series Analysis in a State-Space Framework',
		authors: 'Guilherme Bodin; Raphael Saavedra; Thuener Silva; Alexandre Street',
		year: 2021,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.02429',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Time Series Analysis by State Space Methods',
		authors: 'Durbin, James; Koopman, Siem Jan',
		year: 2012,
		journal: 'Oxford University Press (2nd ed.)',
		doi: '10.1093/acprof:oso/9780199641178.001.0001',
		openAccess: false,
	},
	{
		title: 'Forecasting, Structural Time Series Models and the Kalman Filter',
		authors: 'Harvey, Andrew C.',
		year: 1990,
		journal: 'Cambridge University Press',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'The Unscented Kalman Filter for Nonlinear Estimation',
		authors: 'Wan, Eric A.; Van Der Merwe, Rudolph',
		year: 2000,
		journal: 'Proceedings of the IEEE Adaptive Systems for Signal Processing, Communications, and Control Symposium',
		doi: '10.1109/ASSPCC.2000.882463',
		openAccess: false,
	},
	{
		title: 'Novel Approach to Nonlinear/Non-Gaussian Bayesian State Estimation',
		authors: 'Gordon, Neil J.; Salmond, David J.; Smith, Adrian F. M.',
		year: 1993,
		journal: 'IEE Proceedings F: Radar and Signal Processing',
		doi: '10.1049/ip-f-2.1993.0015',
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
		title: 'Maximum Likelihood Estimation of Misspecified Models',
		authors: 'White, Halbert',
		year: 1982,
		journal: 'Econometrica',
		doi: '10.2307/1912526',
		openAccess: false,
	},
];

const TSSM_METADATA: ITssmMetadata = {
	tssm: {
		packages: [
			{
				name: 'StateSpaceModels.jl',
				github: 'https://github.com/LAMPSPUC/StateSpaceModels.jl',
				papers: [],
				videos: [],
			},
			{
				name: 'LowLevelParticleFilters.jl',
				github: 'https://github.com/baggepinnen/LowLevelParticleFilters.jl',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'Local Level Model',       file: 'tssm/tutorial-01-local-level.ipynb',       bundled: true, description: 'Simulate a random walk plus noise using the Local Level model' },
			{ name: 'Local Linear Trend',      file: 'tssm/tutorial-02-local-linear-trend.ipynb', bundled: true, description: 'Simulate level and slope state with Gaussian noise' },
			{ name: 'Nonlinear SSM',           file: 'tssm/tutorial-03-nonlinear-ssm.ipynb',      bundled: true, description: 'Define nonlinear dynamics and measurement, simulate, then filter with UKF or Particle Filter' },
			{ name: 'Custom System Matrices',  file: 'tssm/tutorial-04-custom-ssm.ipynb',         bundled: true, description: 'User-defined T, Z, Q, H matrices and simulation' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'tssm/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'tssm/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'tssm/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'tssm/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'tssm/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'tssm/decision-guide.md', bundled: true },
			{ separator: true, label: 'State Space Models' },
			{ name: 'Linear Gaussian',  file: 'tssm/linear-gaussian.md',  bundled: true },
			{ name: 'Nonlinear SSM',    file: 'tssm/nonlinear-ssm.md',    bundled: true },
			{ name: 'Custom SSM',       file: 'tssm/custom-ssm.md',       bundled: true },
		],
		references: TSSM_REFERENCES,
	},
};

export function openTssmWebview(
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
			title: TSSM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		TSSM_VIEW_TYPE,
		TSSM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getTssmHtml());

	registerTssmWebviewHandlers(
		webviewInput,
		TSSM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
