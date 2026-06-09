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
import { ICestMetadata } from '../common/cest.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerCestWebviewHandlers } from '../handlers/cest.handler.js';
import { getCestHtml } from '../webviews/cest.template.js';

const CEST_VIEW_TYPE = 'pollis.cest';
const CEST_TITLE = 'Contagion Models';

const CEST_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Pathogen.jl: Infectious Disease Transmission Network Modeling with Julia',
		authors: 'Angevaare, Justin; Feng, Zeny; Deardon, Rob',
		year: 2022,
		journal: 'Journal of Statistical Software',
		doi: '10.18637/jss.v104.i04',
		openAccess: true,
	},
	{
		title: 'Turing.jl: A Language for Flexible Probabilistic Inference',
		authors: 'Ge, Hong; Xu, Kai; Ghahramani, Zoubin',
		year: 2018,
		journal: 'Proceedings of Machine Learning Research',
		doi: '10.17863/CAM.42246',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Bayesian Data Analysis',
		authors: 'Gelman, Andrew; Carlin, John B.; Stern, Hal S.; Dunson, David B.; Vehtari, Aki; Rubin, Donald B.',
		year: 2013,
		journal: 'Chapman and Hall / CRC (3rd ed.)',
		openAccess: false,
	},
	{
		title: 'Infectious Diseases of Humans: Dynamics and Control',
		authors: 'Anderson, Roy M.; May, Robert M.',
		year: 1991,
		journal: 'Oxford University Press',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Individual-Level Models of Infectious Disease: Epiillm',
		authors: 'Warriyar, Vineetha; Deardon, Rob',
		year: 2018,
		journal: 'The R Journal',
		doi: '10.32614/RJ-2018-065',
		openAccess: true,
	},
	{
		title: 'A New Framework and Software to Estimate Time-Varying Reproduction Numbers during Epidemics',
		authors: 'Cori, Anne; Ferguson, Neil M.; Fraser, Christophe; Cauchemez, Simon',
		year: 2013,
		journal: 'American Journal of Epidemiology',
		doi: '10.1093/aje/kwt133',
		openAccess: true,
	},
	{
		title: 'Practical Considerations for Measuring the Effective Reproductive Number, Rt',
		authors: 'Gostic, Katelyn M.; McGough, Lauren; Baskerville, Edward B.; Abbott, Sam; Joshi, Keya; Tedijanto, Christine; Kahn, Rebecca; Niehus, Rene; Hay, James A.; De Salazar, Pablo M.; Hellewell, Joel; Meakin, Sophie; Munday, James D.; Bosse, Nikos I.; Sherrat, Katharine; Thompson, Robin N.; White, Laura F.; Huisman, Jana S.; Ukachukwu, Jantje; Baguelin, Marc; Dorigatti, Ilaria; Cori, Anne; Donnelly, Christl A.; Riley, Steven; Lipsitch, Marc; Atchison, Christina; Jombart, Thibaut; Procter, Simon R.; Knight, Gwenan M.',
		year: 2020,
		journal: 'PLOS Computational Biology',
		doi: '10.1371/journal.pcbi.1008409',
		openAccess: true,
	},
];

const CEST_METADATA: ICestMetadata = {
	cest: {
		packages: [
			{
				name: 'Pathogen.jl',
				github: 'https://github.com/jangevaare/Pathogen.jl',
				papers: [],
				videos: [],
			},
			{
				name: 'Rt-without-renewal',
				github: 'https://github.com/CDCgov/Rt-without-renewal',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'Rt Estimation',  file: 'cest/tutorial-01-rt.ipynb',   bundled: true, description: 'Estimate the time-varying effective reproduction number R(t) from daily case counts using a latent Gaussian random walk on the log-Rt scale' },
			{ name: 'SIR Inference',  file: 'cest/tutorial-02-sir.ipynb',  bundled: true, description: 'Recover transmission rate beta and removal rate gamma of an individual-level SIR model from observed event times using Pathogen.jl MCMC' },
			{ name: 'SEIR Inference', file: 'cest/tutorial-03-seir.ipynb', bundled: true, description: 'Infer all SEIR transition rates and reconstruct the posterior who-infected-whom transmission network with credible intervals' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'cest/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'cest/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'cest/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'cest/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'cest/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'cest/decision-guide.md', bundled: true },
			{ separator: true, label: 'Models' },
			{ name: 'Rt Estimation',  file: 'cest/rt.md',   bundled: true },
			{ name: 'SIR Inference',  file: 'cest/sir.md',  bundled: true },
			{ name: 'SEIR Inference', file: 'cest/seir.md', bundled: true },
		],
		references: CEST_REFERENCES,
	},
};

export function openCestWebview(
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
			title: CEST_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CEST_VIEW_TYPE,
		CEST_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCestHtml());

	registerCestWebviewHandlers(
		webviewInput,
		CEST_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
