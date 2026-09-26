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
import { ICrnMetadata } from '../common/crn.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerCrnWebviewHandlers } from '../handlers/crn.handler.js';
import { getCrnHtml } from '../webviews/crn.template.js';

const CRN_VIEW_TYPE = 'pollis.crn';
const CRN_TITLE = 'Interaction Network Models';

const CRN_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Catalyst.jl: A Systems Biology Toolbox for Julia',
		authors: 'Loman, Torkel E.; Ma, Yingbo; Ilin, Vasily; Gowda, Shashi; Korsbo, Niklas; Yewale, Nikhil; Rackauckas, Christopher; Isaacson, Samuel A.',
		year: 2023,
		journal: 'PLOS Computational Biology',
		doi: '10.1371/journal.pcbi.1011530',
		openAccess: true,
	},
	{
		title: 'DifferentialEquations.jl: A Performant and Feature-Rich Ecosystem for Solving Differential Equations in Julia',
		authors: 'Rackauckas, Christopher; Nie, Qing',
		year: 2017,
		journal: 'Journal of Open Research Software',
		doi: '10.5334/jors.151',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'An Introduction to Systems Biology: Design Principles of Biological Circuits',
		authors: 'Alon, Uri',
		year: 2006,
		journal: 'Chapman and Hall / CRC',
		openAccess: false,
	},
	{
		title: 'Mathematical Biology I: An Introduction',
		authors: 'Murray, James D.',
		year: 2002,
		journal: 'Springer (3rd ed.)',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A Synthetic Oscillatory Network of Transcriptional Regulators',
		authors: 'Elowitz, Michael B.; Leibler, Stanislas',
		year: 2000,
		journal: 'Nature',
		doi: '10.1038/35002125',
		openAccess: false,
	},
	{
		title: 'Fluctuations and Irreversibility: An Experimental Demonstration of a Second-Law-Like Theorem Using Small Colloidal Systems',
		authors: 'Lotka, Alfred J.',
		year: 1925,
		journal: 'Proceedings of the National Academy of Sciences',
		doi: '10.1073/pnas.6.7.410',
		openAccess: true,
	},
	{
		title: 'Stochastic Simulation of Chemical Kinetics',
		authors: 'Gillespie, Daniel T.',
		year: 2007,
		journal: 'Annual Review of Physical Chemistry',
		doi: '10.1146/annurev.physchem.58.032806.104637',
		openAccess: false,
	},
];

const CRN_METADATA: ICrnMetadata = {
	crn: {
		packages: [
			{
				name: 'Catalyst.jl',
				github: 'https://docs.sciml.ai/Catalyst/stable/',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'Enzyme Kinetics',      file: 'crn/tutorial-01-chemical.ipynb',   bundled: true, description: 'Model Michaelis-Menten enzyme kinetics as a reaction network and simulate substrate depletion and product formation' },
			{ name: 'Gene Regulatory',      file: 'crn/tutorial-02-genetic.ipynb',    bundled: true, description: 'Build the repressilator three-gene oscillator and observe sustained limit-cycle oscillations in protein concentrations' },
			{ name: 'Predator-Prey',        file: 'crn/tutorial-03-ecological.ipynb', bundled: true, description: 'Express Lotka-Volterra predator-prey dynamics as a reaction network and analyse population cycles' },
			{ name: 'Epidemic as Network',  file: 'crn/tutorial-04-epidemic.ipynb',   bundled: true, description: 'Encode an SIR model as a Catalyst reaction network and compare ODE and stochastic Gillespie trajectories' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'crn/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'crn/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'crn/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'crn/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'crn/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'crn/decision-guide.md', bundled: true },
			{ separator: true, label: 'Models' },
			{ name: 'Chemical',   file: 'crn/chemical.md',   bundled: true },
			{ name: 'Genetic',    file: 'crn/genetic.md',    bundled: true },
			{ name: 'Ecological', file: 'crn/ecological.md', bundled: true },
			{ name: 'Epidemic',   file: 'crn/epidemic.md',   bundled: true },
		],
		references: CRN_REFERENCES,
	},
};

export function openCrnWebview(
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
			title: CRN_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CRN_VIEW_TYPE,
		CRN_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCrnHtml());

	registerCrnWebviewHandlers(
		webviewInput,
		CRN_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
