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
import { ISsmMetadata } from '../common/ssm.types.js';
import { IModelNotebookSection, IModelReference } from '../common/model.types.js';
import { registerSsmWebviewHandlers } from '../handlers/ssm.handler.js';
import { getSsmHtml } from '../webviews/ssm.template.js';

const SSM_VIEW_TYPE = 'pollis.ssm';
const SSM_TITLE = 'State-Space Inference Methods';

export const SSM_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Kalman Filters',
		notebooks: [
			{ name: 'Kalman Filter',            file: 'ssm/tutorial-01-kalman.ipynb',   bundled: true, description: 'Linear state-space models and the Kalman filter' },
			{ name: 'Extended Kalman Filter',   file: 'ssm/tutorial-02-ekf.ipynb',      bundled: true, description: 'Nonlinear filtering via Jacobian linearisation' },
			{ name: 'Unscented Kalman Filter',  file: 'ssm/tutorial-03-ukf.ipynb',      bundled: true, description: 'Sigma-point approximation for nonlinear systems' },
		],
	},
	{
		label: 'Particle Filters',
		notebooks: [
			{ name: 'Particle Filter',             file: 'ssm/tutorial-04-particle.ipynb', bundled: true, description: 'Sequential Monte Carlo for nonlinear / non-Gaussian models' },
			{ name: 'Rao-Blackwellized Filter',    file: 'ssm/tutorial-08-rbf.ipynb',      bundled: true, description: 'Combined analytical and particle-based state estimation' },
		],
	},
	{
		label: 'Case Studies',
		notebooks: [
			{ name: 'Dynamic Nelson-Siegel Model', file: 'ssm/tutorial-05-dns.ipynb', bundled: true, description: 'Term structure modelling with latent factors' },
		],
	},
];

const SSM_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Optimal State Estimation: Kalman, H-infinity, and Nonlinear Approaches',
		authors: 'Simon, Dan',
		year: 2006,
		journal: 'Wiley-Interscience',
		doi: '10.1002/0470045345',
		openAccess: false,
	},
	{
		title: 'Probabilistic Robotics',
		authors: 'Thrun, Sebastian; Burgard, Wolfram; Fox, Dieter',
		year: 2005,
		journal: 'MIT Press',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A New Approach to Linear Filtering and Prediction Problems',
		authors: 'Kalman, Rudolf E.',
		year: 1960,
		journal: 'Journal of Basic Engineering',
		doi: '10.1115/1.3662552',
		openAccess: false,
	},
	{
		title: 'A New Extension of the Kalman Filter to Nonlinear Systems',
		authors: 'Julier, Simon J.; Uhlmann, Jeffrey K.',
		year: 1997,
		journal: 'Proc. SPIE 3068, Signal Processing, Sensor Fusion, and Target Recognition VI',
		doi: '10.1117/12.280797',
		openAccess: false,
	},
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
		title: 'Rao-Blackwellised Particle Filtering for Dynamic Bayesian Networks',
		authors: 'Doucet, Arnaud; de Freitas, Joao F. G.; Murphy, Kevin P.; Russell, Stuart J.',
		year: 2000,
		journal: 'Proceedings of the 16th Conference on Uncertainty in Artificial Intelligence',
		openAccess: false,
	},
];

const SSM_METADATA: ISsmMetadata = {
	ssm: {
		packages: [
			{ name: 'LowLevelParticleFilters.jl', github: 'https://github.com/baggepinnen/LowLevelParticleFilters.jl', papers: [] },
		],
		notebooks: SSM_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		notebookSections: SSM_NOTEBOOK_SECTIONS,
		references: SSM_REFERENCES,
		wikis: [
			{ name: 'Overview',       file: 'ssm/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'ssm/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'ssm/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'ssm/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'ssm/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'ssm/decision-guide.md', bundled: true },
		],
		tooltips: {
			nx: 'Dimension of the latent state vector x_t. For a 2D position-velocity model, nx = 4.',
			ny: 'Dimension of the measurement vector y_t. Must match the number of signals measured at each time step.',
			nu: 'Dimension of the known input (control) vector u_t. Set to 0 if there are no external inputs.',
			nl: 'Dimension of the linear part of the state vector in the Rao-Blackwellized filter. This part is handled analytically.',
			nnl: 'Dimension of the nonlinear part of the state vector. Particle approximation is used for this part.',
			nParticles: 'Number of particles N. More particles give a better approximation at higher cost. 500–2000 is typical.',
			data: 'Named tuple or struct with fields .u (inputs) and .y (observations), one entry per time step.',
			qScale: 'Scale factor for the process noise covariance Q = sigma * I(nx). Larger values allow more uncertainty in the state dynamics.',
			rScale: 'Scale factor for the measurement noise covariance R = sigma * I(ny). Larger values indicate noisier observations.',
			mu0: 'Initial state estimate mu_0 (vector of length nx). Mean of the initial distribution x_0 ~ N(mu_0, Sigma_0).',
			sigma0: 'Initial error covariance Sigma_0. Reflects uncertainty in the initial state. Default I (identity matrix).',
			dynamics: 'Julia expression for the state transition function. For EKF/UKF: return a vector of length nx. For PF: the argument noise is a sample from the process noise distribution.',
			measurement: 'Julia expression for the observation function h(x, u, p, t). Should return a vector of length ny.',
		},
	},
};

export function openSsmWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	initialFilter?: string,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: SSM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		SSM_VIEW_TYPE,
		SSM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSsmHtml());

	registerSsmWebviewHandlers(
		webviewInput,
		SSM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialFilter,
	);
}
