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
import { ISmcMetadata } from '../common/smc.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerSmcWebviewHandlers } from '../handlers/smc.handler.js';
import { getSmcHtml } from '../webviews/smc.template.js';

const SMC_VIEW_TYPE = 'pollis.smc';
const SMC_TITLE = 'Sequential Monte Carlo';

const SMC_REFERENCES: IModelReference[] = [
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
		title: 'SequentialMonteCarlo.jl: An Efficient, Extensible Implementation of SMC',
		authors: 'Whiteley, Nick; Lee, Anthony; Sherlock, Chris',
		year: 2016,
		journal: 'arXiv preprint',
		doi: '10.48550/arXiv.1606.09396',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'An Introduction to Sequential Monte Carlo',
		authors: 'Chopin, Nicolas; Papaspiliopoulos, Omiros',
		year: 2020,
		journal: 'Springer',
		doi: '10.1007/978-3-030-47845-2',
		openAccess: false,
	},
	{
		title: 'Sequential Monte Carlo Methods in Practice',
		authors: 'Doucet, Arnaud; de Freitas, Nando; Gordon, Neil J.',
		year: 2001,
		journal: 'Springer',
		doi: '10.1007/978-1-4757-3437-9',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Sequential Monte Carlo Samplers',
		authors: 'Del Moral, Pierre; Doucet, Arnaud; Jasra, Ajay',
		year: 2006,
		journal: 'Journal of the Royal Statistical Society: Series B',
		doi: '10.1111/j.1467-9868.2006.00553.x',
		openAccess: false,
	},
	{
		title: 'Monte Carlo Filter and Smoother for Non-Gaussian Nonlinear State Space Models',
		authors: 'Kitagawa, Genshiro',
		year: 1996,
		journal: 'Journal of Computational and Graphical Statistics',
		doi: '10.1080/10618600.1996.10474692',
		openAccess: false,
	},
];

export const SMC_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'Particle Filter',
				file: 'smc/tutorial-01-filter.ipynb',
				bundled: true,
				description: 'Bootstrap particle filter for sequential state estimation in hidden Markov models',
			},
			{
				name: 'Particle Smoother',
				file: 'smc/tutorial-02-smoother.ipynb',
				bundled: true,
				description: 'Full-path smoothing via ancestor tracing and backward simulation',
			},
			{
				name: 'SMC Samplers',
				file: 'smc/tutorial-03-samplers.ipynb',
				bundled: true,
				description: 'SMC for static Bayesian inference: annealed targets and log marginal likelihood estimation',
			},
		],
	},
];

const SMC_METADATA: ISmcMetadata = {
	smc: {
		packages: [
			{
				name: 'SequentialMonteCarlo.jl',
				github: 'https://github.com/awllee/SequentialMonteCarlo.jl',
				papers: [],
			},
		],
		notebookSections: SMC_NOTEBOOK_SECTIONS,
		notebooks: SMC_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'smc/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'smc/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'smc/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'smc/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'smc/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'smc/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'Bootstrap Filter',    file: 'smc/bootstrap-filter.md',    bundled: true },
			{ name: 'Resampling Schemes',  file: 'smc/resampling-schemes.md',  bundled: true },
			{ name: 'Smoothing',           file: 'smc/smoothing.md',           bundled: true },
		],
		references: SMC_REFERENCES,
	},
};

export function openSmcWebview(
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
			title: SMC_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		SMC_VIEW_TYPE,
		SMC_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSmcHtml());

	registerSmcWebviewHandlers(
		webviewInput,
		SMC_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
