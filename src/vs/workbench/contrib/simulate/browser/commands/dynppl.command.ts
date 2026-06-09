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
import { IDynpplMetadata } from '../common/dynppl.types.js';
import { IModelReference } from '../../../model/browser/common/model.types.js';
import { registerDynpplWebviewHandlers } from '../handlers/dynppl.handler.js';
import { getDynpplHtml } from '../webviews/dynppl.template.js';

const DYNPPL_VIEW_TYPE = 'pollis.dynppl';
const DYNPPL_TITLE = 'Probabilistic Programming with Turing.jl';

const DYNPPL_REFERENCES: IModelReference[] = [
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
		title: 'Turing: A Language for Flexible Probabilistic Inference',
		authors: 'Ge, Hong; Xu, Kai; Ghahramani, Zoubin',
		year: 2018,
		journal: 'Proceedings of the 21st International Conference on Artificial Intelligence and Statistics (AISTATS)',
		url: 'http://proceedings.mlr.press/v84/ge18b.html',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Probabilistic Programming and Bayesian Methods for Hackers',
		authors: 'Davidson-Pilon, Cameron',
		year: 2015,
		journal: 'Addison-Wesley',
		url: 'https://github.com/CamDavidsonPilon/Probabilistic-Programming-and-Bayesian-Methods-for-Hackers',
		openAccess: true,
	},
	{
		title: 'Bayesian Data Analysis',
		authors: 'Gelman, Andrew; Carlin, John B.; Stern, Hal S.; Dunson, David B.; Vehtari, Aki; Rubin, Donald B.',
		year: 2013,
		journal: 'CRC Press (3rd ed.)',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'The No-U-Turn Sampler: Adaptively Setting Path Lengths in Hamiltonian Monte Carlo',
		authors: 'Hoffman, Matthew D.; Gelman, Andrew',
		year: 2014,
		journal: 'Journal of Machine Learning Research',
		url: 'https://jmlr.org/papers/v15/hoffman14a.html',
		openAccess: true,
	},
	{
		title: 'Hybrid Monte Carlo',
		authors: 'Duane, Simon; Kennedy, Anthony D.; Pendleton, Brian J.; Roweth, Duncan',
		year: 1987,
		journal: 'Physics Letters B',
		doi: '10.1016/0370-2693(87)91197-X',
		openAccess: false,
	},
	{
		title: 'Equation of State Calculations by Fast Computing Machines',
		authors: 'Metropolis, Nicholas; Rosenbluth, Arianna W.; Rosenbluth, Marshall N.; Teller, Augusta H.; Teller, Edward',
		year: 1953,
		journal: 'Journal of Chemical Physics',
		doi: '10.1063/1.1699114',
		openAccess: false,
	},
];

const DYNPPL_METADATA: IDynpplMetadata = {
	dynppl: {
		packages: [
			{
				name: 'Turing.jl',
				github: 'https://github.com/TuringLang/Turing.jl',
				papers: [],
				videos: [],
			},
			{
				name: 'MCMCChains.jl',
				github: 'https://github.com/TuringLang/MCMCChains.jl',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'No-U-Turn Sampler',      file: 'dynppl/tutorial-01-nuts.ipynb',  bundled: true, description: 'Adaptive HMC with NUTS — define a model and sample with the Turing default' },
			{ name: 'Hamiltonian Monte Carlo', file: 'dynppl/tutorial-02-hmc.ipynb',   bundled: true, description: 'Explicit step size and leapfrog trajectory via HMC' },
			{ name: 'Metropolis-Hastings',     file: 'dynppl/tutorial-03-mh.ipynb',    bundled: true, description: 'Gradient-free random-walk MCMC for discrete or non-differentiable models' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'dynppl/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'dynppl/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'dynppl/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'dynppl/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'dynppl/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'dynppl/decision-guide.md', bundled: true },
			{ separator: true, label: 'Samplers' },
			{ name: 'NUTS',                  file: 'dynppl/nuts.md',                  bundled: true },
			{ name: 'Hamiltonian Monte Carlo', file: 'dynppl/hmc.md',                 bundled: true },
			{ name: 'Metropolis-Hastings',   file: 'dynppl/metropolis-hastings.md',   bundled: true },
		],
		references: DYNPPL_REFERENCES,
	},
};

export function openDynpplWebview(
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
			title: DYNPPL_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DYNPPL_VIEW_TYPE,
		DYNPPL_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDynpplHtml());

	registerDynpplWebviewHandlers(
		webviewInput,
		DYNPPL_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
