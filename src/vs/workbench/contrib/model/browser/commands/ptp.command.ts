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
import { IPtpMetadata } from '../common/ptp.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerPtpWebviewHandlers } from '../handlers/ptp.handler.js';
import { getPtpHtml } from '../webviews/ptp.template.js';

const PTP_VIEW_TYPE = 'pollis.ptp';
const PTP_TITLE = 'Point Processes';

const PTP_REFERENCES: IModelReference[] = [
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
		title: 'An Introduction to the Theory of Point Processes, Vol. II: General Theory and Structure',
		authors: 'Daley, Daryl J.; Vere-Jones, David',
		year: 2008,
		journal: 'Springer (2nd ed.)',
		url: 'https://link.springer.com/book/9780387213378',
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
		title: 'Spectra of Some Self-Exciting and Mutually Exciting Point Processes',
		authors: 'Hawkes, Alan G.',
		year: 1971,
		journal: 'Biometrika',
		doi: '10.1093/biomet/58.1.83',
		openAccess: false,
	},
	{
		title: 'Some Statistical Methods Connected with Series of Events',
		authors: 'Cox, David R.',
		year: 1955,
		journal: 'Journal of the Royal Statistical Society, Series B',
		doi: '10.1111/j.2517-6161.1955.tb00188.x',
		openAccess: false,
	},
	{
		title: 'On Lewis Simulation Method for Point Processes',
		authors: 'Ogata, Yosihiko',
		year: 1981,
		journal: 'IEEE Transactions on Information Theory',
		doi: '10.1109/TIT.1981.1056305',
		openAccess: false,
	},
	{
		title: 'Space-Time Point-Process Models for Earthquake Occurrences',
		authors: 'Ogata, Yosihiko',
		year: 1998,
		journal: 'Annals of the Institute of Statistical Mathematics',
		doi: '10.1023/A:1003403601725',
		openAccess: false,
	},
];

export const PTP_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Poisson Processes',
		notebooks: [
			{ name: 'Poisson MLE', file: 'ptp/ptp-poisson-02-mle.ipynb', bundled: true, description: 'Maximum likelihood estimation of the Poisson rate: closed-form MLE and confidence intervals' },
			{ name: 'Poisson Bayesian', file: 'ptp/ptp-poisson-03-bayesian.ipynb', bundled: true, description: 'Bayesian inference for Poisson processes: conjugate Gamma prior and posterior updating' },
			{ name: 'Inhomogeneous Poisson', file: 'ptp/ptp-poisson-04-inhomogeneous.ipynb', bundled: true, description: 'Inhomogeneous Poisson processes: thinning algorithm, Lewis-Shedler method, and rate estimation' },
		],
	},
	{
		label: 'Hawkes Processes',
		notebooks: [
			{ name: 'Hawkes MLE', file: 'ptp/ptp-hawkes-02-mle.ipynb', bundled: true, description: 'MLE for Hawkes processes: log-likelihood function and numerical optimisation' },
			{ name: 'Hawkes Bayesian', file: 'ptp/ptp-hawkes-03-bayesian.ipynb', bundled: true, description: 'Bayesian estimation of Hawkes processes: MCMC sampling of (mu, alpha, beta)' },
			{ name: 'Hawkes Diagnostics', file: 'ptp/ptp-hawkes-04-diagnostics.ipynb', bundled: true, description: 'Hawkes process diagnostics: residual analysis via time-rescaling theorem and Q-Q plots' },
		],
	},
	{
		label: 'Advanced Topics',
		notebooks: [
			{ name: 'Cox Process', file: 'ptp/ptp-advanced-01-cox.ipynb', bundled: true, description: 'Cox processes: doubly stochastic Poisson processes with Gaussian process intensity' },
			{ name: 'Network Hawkes', file: 'ptp/ptp-advanced-02-network.ipynb', bundled: true, description: 'Network Hawkes processes: multivariate point processes with directed network interactions' },
			{ name: 'Goodness of Fit', file: 'ptp/ptp-advanced-03-gof.ipynb', bundled: true, description: 'Goodness-of-fit testing: time-rescaling theorem and Kolmogorov-Smirnov test for point processes' },
			{ name: 'Point Process Regression', file: 'ptp/ptp-advanced-04-regression.ipynb', bundled: true, description: 'Point process regression: incorporating covariates into the intensity function' },
		],
	},
];

const PTP_METADATA: IPtpMetadata = {
	ptp: {
		packages: [
			{
				name: 'PointProcesses.jl',
				github: 'https://github.com/JoseKling/PointProcesses.jl',
				papers: [],
			},
			{
				name: 'HawkesProcesses.jl',
				github: 'https://github.com/dm13450/HawkesProcesses.jl',
				papers: [],
			},
			{
				name: 'NetworkHawkesProcesses.jl',
				github: 'https://github.com/cswaney/NetworkHawkesProcesses.jl',
				papers: [],
			},
		],
		references: PTP_REFERENCES,
		notebookSections: PTP_NOTEBOOK_SECTIONS,
		notebooks: PTP_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'ptp/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'ptp/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'ptp/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'ptp/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'ptp/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'ptp/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Process Types' },
			{ name: 'Poisson Process',    file: 'ptp/poisson-process.md',  bundled: true },
			{ name: 'Hawkes Process',     file: 'ptp/hawkes-process.md',   bundled: true },
			{ name: 'Cox Process',        file: 'ptp/cox-process.md',      bundled: true },
			{ name: 'Network Hawkes',     file: 'ptp/network-hawkes.md',   bundled: true },
			{ name: 'Intensity Function', file: 'ptp/intensity-function.md', bundled: true },
			{ name: 'Goodness of Fit',    file: 'ptp/goodness-of-fit.md',  bundled: true },
		],
	},
};

export function openPtpWebview(
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
			title: PTP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		PTP_VIEW_TYPE,
		PTP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getPtpHtml());

	registerPtpWebviewHandlers(
		webviewInput,
		PTP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
