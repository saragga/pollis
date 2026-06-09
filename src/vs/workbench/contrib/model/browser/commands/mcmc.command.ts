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
import { IMcmcMetadata } from '../common/mcmc.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerMcmcWebviewHandlers } from '../handlers/mcmc.handler.js';
import { getMcmcHtml } from '../webviews/mcmc.template.js';

const MCMC_VIEW_TYPE = 'pollis.mcmc';
const MCMC_TITLE = 'Markov Chain Monte Carlo';

const MCMC_REFERENCES: IModelReference[] = [
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
		journal: 'Proceedings of Machine Learning Research',
		doi: '10.48550/arXiv.1907.07111',
		openAccess: true,
	},
	{
		title: 'AdvancedHMC.jl: A Robust, Modular and Efficient Implementation of Advanced HMC Algorithms',
		authors: 'Xu, Kai; Ge, Hong; Tebbutt, Will; Tarek, Mohamed; Trapp, Martin; Ghahramani, Zoubin',
		year: 2020,
		journal: 'Proceedings of The 3rd Symposium on Advances in Approximate Bayesian Inference',
		doi: '10.48550/arXiv.1907.07114',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Monte Carlo Statistical Methods',
		authors: 'Robert, Christian P.; Casella, George',
		year: 2004,
		journal: 'Springer (2nd ed.)',
		doi: '10.1007/978-1-4757-4145-2',
		openAccess: false,
	},
	{
		title: 'Handbook of Markov Chain Monte Carlo',
		authors: 'Brooks, Steve; Gelman, Andrew; Jones, Galin; Meng, Xiao-Li',
		year: 2011,
		journal: 'Chapman & Hall/CRC',
		doi: '10.1201/b10905',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'MCMC Using Hamiltonian Dynamics',
		authors: 'Neal, Radford M.',
		year: 2011,
		journal: 'Handbook of Markov Chain Monte Carlo',
		doi: '10.1201/b10905',
		openAccess: true,
	},
	{
		title: 'The No-U-Turn Sampler: Adaptively Setting Path Lengths in Hamiltonian Monte Carlo',
		authors: 'Hoffman, Matthew D.; Gelman, Andrew',
		year: 2014,
		journal: 'Journal of Machine Learning Research',
		doi: '10.48550/arXiv.1111.4246',
		openAccess: true,
	},
];

export const MCMC_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'NUTS (Turing)',
				file: 'mcmc/tutorial-01-nuts.ipynb',
				bundled: true,
				description: 'Bayesian inference with the No-U-Turn Sampler using Turing.jl @model syntax',
			},
			{
				name: 'HMC (AdvancedHMC)',
				file: 'mcmc/tutorial-02-hmc.ipynb',
				bundled: true,
				description: 'Low-level Hamiltonian Monte Carlo with custom log-densities via AdvancedHMC.jl',
			},
			{
				name: 'Metropolis-Hastings',
				file: 'mcmc/tutorial-03-mh.ipynb',
				bundled: true,
				description: 'Random-walk Metropolis-Hastings sampler and proposal tuning with Turing.jl',
			},
		],
	},
];

const MCMC_METADATA: IMcmcMetadata = {
	mcmc: {
		packages: [
			{
				name: 'Turing.jl',
				github: 'https://github.com/TuringLang/Turing.jl',
				papers: [],
			},
			{
				name: 'AdvancedHMC.jl',
				github: 'https://github.com/TuringLang/AdvancedHMC.jl',
				papers: [],
			},
			{
				name: 'MCMCChains.jl',
				github: 'https://github.com/TuringLang/MCMCChains.jl',
				papers: [],
			},
		],
		notebookSections: MCMC_NOTEBOOK_SECTIONS,
		notebooks: MCMC_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'mcmc/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'mcmc/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'mcmc/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'mcmc/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'mcmc/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'mcmc/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'NUTS',                file: 'mcmc/nuts.md',                bundled: true },
			{ name: 'HMC',                 file: 'mcmc/hmc.md',                 bundled: true },
			{ name: 'Metropolis-Hastings', file: 'mcmc/metropolis-hastings.md', bundled: true },
		],
		references: MCMC_REFERENCES,
	},
};

export function openMcmcWebview(
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
			title: MCMC_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MCMC_VIEW_TYPE,
		MCMC_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMcmcHtml());

	registerMcmcWebviewHandlers(
		webviewInput,
		MCMC_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
