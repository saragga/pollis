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
import { IEpiUdeMetadata } from '../common/epi-ude.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerEpiUdeWebviewHandlers } from '../handlers/epi-ude.handler.js';
import { getEpiUdeHtml } from '../webviews/epi-ude.template.js';

const EPI_UDE_VIEW_TYPE = 'pollis.epi-ude';
const EPI_UDE_TITLE = 'Epidemic SciML Tutorials';

const EPI_UDE_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'DiffEqFlux.jl &#8212; A Julia Library for Neural Differential Equations',
		authors: 'Rackauckas, Christopher; Ma, Yingbo; Martensen, Julius; Warner, Collin; Zubov, Kirill; Supekar, Rohit; Skinner, Dominic; Ramadhan, Ali; Edelman, Alan',
		year: 2019,
		journal: 'arXiv',
		doi: '10.48550/arXiv.1902.02376',
		openAccess: true,
	},
	{
		title: 'Lux: Explicitly Parameterized Neural Networks in Julia',
		authors: 'Pal, Avik',
		year: 2023,
		journal: 'GitHub',
		openAccess: true,
	},
	{ separator: true, label: 'Key Papers' },
	{
		title: 'Universal Differential Equations for Scientific Machine Learning',
		authors: 'Rackauckas, Christopher; Ma, Yingbo; Martensen, Julius; Warner, Collin; Zubov, Kirill; Supekar, Rohit; Skinner, Dominic; Ramadhan, Ali',
		year: 2020,
		journal: 'arXiv',
		doi: '10.48550/arXiv.2001.04385',
		openAccess: true,
	},
	{
		title: 'Bayesian Neural Ordinary Differential Equations',
		authors: 'Dandekar, Raj; Chung, Karen; Dixit, Vaibhav; Tarek, Mohamed; Garcia-Valadez, Aslan; Vemula, Krishna Vishal; Rackauckas, Christopher',
		year: 2022,
		journal: 'arXiv',
		doi: '10.48550/arXiv.2012.07244',
		openAccess: true,
	},
	{
		title: 'A Machine Learning-Aided Global Diagnostic and Comparative Tool to Assess Effect of Quarantine Control in COVID-19 Spread',
		authors: 'Dandekar, Raj; Rackauckas, Christopher; Barbastathis, George',
		year: 2020,
		journal: 'Patterns',
		doi: '10.1016/j.patter.2020.100145',
		openAccess: true,
	},
	{ separator: true, label: 'Tutorials' },
	{
		title: 'EpiSciML-Tutorials: Julia for Epidemiology with a Scientific Machine Learning Perspective',
		authors: 'Dandekar, Raj',
		year: 2021,
		journal: 'GitHub',
		openAccess: true,
	},
];

const EPI_UDE_METADATA: IEpiUdeMetadata = {
	epiUde: {
		packages: [
			{
				name: 'DiffEqFlux.jl',
				github: 'https://docs.sciml.ai/DiffEqFlux/stable/',
				papers: [],
				videos: [],
			},
			{
				name: 'Lux.jl',
				github: 'https://lux.csail.mit.edu/',
				papers: [],
				videos: [],
			},
			{
				name: 'SciML',
				github: 'https://sciml.ai/',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'Neural ODEs on Epidemiology Models',         file: 'epi-ude/tutorial-01-neural-ode.ipynb',         bundled: true, description: 'Train a Neural ODE on the 5-compartment SIRHD model and see why black-box networks fail at forecasting' },
			{ name: 'Universal Differential Equations (UDE)',     file: 'epi-ude/tutorial-02-ude.ipynb',               bundled: true, description: 'Replace interaction terms with neural networks in the SIRHD model and train the hybrid UDE' },
			{ name: '7-Compartment Model: Neural ODE vs UDE',     file: 'epi-ude/tutorial-03-7compartment.ipynb',      bundled: true, description: 'Compare Neural ODE and UDE extrapolation on a 7-compartment epidemic with a time-varying contact rate' },
			{ name: 'Bayesian Neural ODEs',                       file: 'epi-ude/tutorial-04-bayesian-neural-ode.ipynb', bundled: true, description: 'Add uncertainty quantification to Neural ODEs via NUTS sampling with AdvancedHMC.jl and Turing.jl' },
			{ name: 'SciML Optimisers + Symbolic Recovery',       file: 'epi-ude/tutorial-05-symbolic-recovery.ipynb', bundled: true, description: 'Chain ADAM and BFGS optimisers for a Lotka–Volterra UDE, then recover symbolic equations via SINDy' },
			{ name: 'QSIR — Italy Quarantine Diagnosis',     file: 'epi-ude/tutorial-06-qsir-italy.ipynb',        bundled: true, description: 'Fit a UDE-augmented SIR model to Italian COVID-19 data and recover the data-driven quarantine strength Q(t)' },
		],
		references: EPI_UDE_REFERENCES,
	},
};

export function openEpiUdeWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
): void {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: EPI_UDE_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		EPI_UDE_VIEW_TYPE,
		EPI_UDE_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getEpiUdeHtml());

	registerEpiUdeWebviewHandlers(
		webviewInput,
		EPI_UDE_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
