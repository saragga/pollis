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
import { IEpiCompMetadata } from '../common/epi-comp.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerEpiCompWebviewHandlers } from '../handlers/epi-comp.handler.js';
import { getEpiCompHtml } from '../webviews/epi-comp.template.js';

const EPI_COMP_VIEW_TYPE = 'pollis.epi-comp';
const EPI_COMP_TITLE = 'Compartmental Models';

const EPI_COMP_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
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
		title: 'An Introduction to Mathematical Epidemiology',
		authors: 'Martcheva, Maia',
		year: 2015,
		journal: 'Springer',
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
		title: 'A Contribution to the Mathematical Theory of Epidemics',
		authors: 'Kermack, William O.; McKendrick, Anderson G.',
		year: 1927,
		journal: 'Proceedings of the Royal Society A',
		doi: '10.1098/rspa.1927.0118',
		openAccess: false,
	},
	{
		title: 'Contributions to the Mathematical Theory of Epidemics II',
		authors: 'Kermack, William O.; McKendrick, Anderson G.',
		year: 1932,
		journal: 'Proceedings of the Royal Society A',
		doi: '10.1098/rspa.1932.0171',
		openAccess: false,
	},
	{
		title: 'An SEIRD Epidemic Model for Predicting the Spread of COVID-19 over a Long Period',
		authors: 'Ghostine, Rabih; Gharamti, Mohamad; Hassrouny, Sally; Hoteit, Ibrahim',
		year: 2021,
		journal: 'Biology',
		doi: '10.3390/biology10060482',
		openAccess: true,
	},
];

const EPI_COMP_METADATA: IEpiCompMetadata = {
	epiComp: {
		packages: [
			{
				name: 'DifferentialEquations.jl',
				github: 'https://docs.sciml.ai/DiffEqDocs/stable/',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'SIR Model',  file: 'epi-comp/tutorial-01-sir.ipynb',   bundled: true, description: 'Simulate the classic SIR epidemic and explore how transmission rate and recovery rate shape outbreak size and duration' },
			{ name: 'SIS Model',  file: 'epi-comp/tutorial-02-sis.ipynb',   bundled: true, description: 'Model SIS endemic dynamics and find the equilibrium infected fraction above the epidemic threshold' },
			{ name: 'SEIR Model', file: 'epi-comp/tutorial-03-seir.ipynb',  bundled: true, description: 'Add an exposed latent period to the SIR model and study how incubation time affects outbreak timing' },
			{ name: 'SIRS Model', file: 'epi-comp/tutorial-04-sirs.ipynb',  bundled: true, description: 'Simulate waning immunity with the SIRS model and observe recurrent epidemic waves' },
			{ name: 'SEIRD Model', file: 'epi-comp/tutorial-05-seird.ipynb', bundled: true, description: 'Extend SEIR with a dead compartment to track disease-attributable mortality alongside epidemic dynamics' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'epi-comp/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'epi-comp/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'epi-comp/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'epi-comp/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'epi-comp/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'epi-comp/decision-guide.md', bundled: true },
			{ separator: true, label: 'Models' },
			{ name: 'SIR',   file: 'epi-comp/sir.md',   bundled: true },
			{ name: 'SIS',   file: 'epi-comp/sis.md',   bundled: true },
			{ name: 'SEIR',  file: 'epi-comp/seir.md',  bundled: true },
			{ name: 'SIRS',  file: 'epi-comp/sirs.md',  bundled: true },
			{ name: 'SEIRD', file: 'epi-comp/seird.md', bundled: true },
		],
		references: EPI_COMP_REFERENCES,
	},
};

export function openEpiCompWebview(
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
			title: EPI_COMP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		EPI_COMP_VIEW_TYPE,
		EPI_COMP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getEpiCompHtml());

	registerEpiCompWebviewHandlers(
		webviewInput,
		EPI_COMP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
