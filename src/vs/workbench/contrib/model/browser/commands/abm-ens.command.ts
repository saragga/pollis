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
import { IAbmEnsMetadata } from '../common/abm-ens.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerAbmEnsWebviewHandlers } from '../handlers/abm-ens.handler.js';
import { getAbmEnsHtml } from '../webviews/abm-ens.template.js';

const ABM_ENS_VIEW_TYPE = 'pollis.abm-ens';
const ABM_ENS_TITLE = 'Ensemble & Parameter Scanning';

const ABM_ENS_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Agents.jl: A performant and feature-full agent based modelling software of minimal code complexity',
		authors: 'Datseris, George; Vahdati, Ali R.; DuBois, Timothy C.',
		year: 2022,
		journal: 'SIMULATION',
		doi: '10.1177/00375497211068820',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'An Introduction to Agent-Based Modeling',
		authors: 'Wilensky, Uri; Rand, William',
		year: 2015,
		journal: 'MIT Press',
		openAccess: false,
	},
	{
		title: 'Complex Adaptive Systems: An Introduction to Computational Models of Social Life',
		authors: 'Miller, John H.; Page, Scott E.',
		year: 2007,
		journal: 'Princeton University Press',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Sensitivity analysis of agent-based models: A new protocol',
		authors: 'Saltelli, Andrea; Ratto, Marco; Andres, Terry; Campolongo, Francesca',
		year: 2008,
		journal: 'Environmental Modelling & Software',
		doi: '10.1016/j.envsoft.2008.01.006',
		openAccess: false,
	},
	{
		title: 'Global sensitivity analysis of agent-based models',
		authors: 'Ten Broeke, Guus; van Voorn, George; Ligtenberg, Arend',
		year: 2016,
		journal: 'Journal of Artificial Societies and Social Simulation',
		doi: '10.18564/jasss.2857',
		openAccess: true,
	},
];

const ABM_ENS_METADATA: IAbmEnsMetadata = {
	abmEns: {
		packages: [
			{
				name: 'Agents.jl',
				github: 'https://github.com/JuliaDynamics/Agents.jl',
				papers: [],
				videos: [
					{
						title: 'Agents.jl Tutorial',
						description: 'Step-by-step introduction to building agent-based models with Agents.jl',
						url: 'https://www.youtube.com/watch?v=QL-bDjzS1pg',
					},
				],
			},
		],
		notebooks: [
			{ name: 'Ensemble Runs',           file: 'abm-ens/tutorial-01-ensemble.ipynb',   bundled: true, description: 'Run multiple independent replications of a model and aggregate results with ensemblerun!' },
			{ name: 'Parameter Scanning',      file: 'abm-ens/tutorial-02-paramscan.ipynb',  bundled: true, description: 'Systematically vary model parameters and collect outcomes with paramscan' },
			{ name: 'Sensitivity Analysis',    file: 'abm-ens/tutorial-03-sensitivity.ipynb', bundled: true, description: 'Rank parameter importance using Sobol indices via global sensitivity analysis' },
		],
		wikis: [
			{ name: 'Factsheet',              file: 'abm-ens/factsheet.md',          bundled: true },
			{ name: 'Overview',               file: 'abm-ens/overview.md',            bundled: true },
			{ name: 'Assumptions',            file: 'abm-ens/assumptions.md',         bundled: true },
			{ name: 'Diagnostics',            file: 'abm-ens/diagnostics.md',         bundled: true },
			{ name: 'Interpretation',         file: 'abm-ens/interpretation.md',      bundled: true },
			{ name: 'Decision Guide',         file: 'abm-ens/decision-guide.md',      bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Ensemble Runs',          file: 'abm-ens/ensemble.md',            bundled: true },
			{ name: 'Parameter Scanning',     file: 'abm-ens/parameter-scanning.md',  bundled: true },
			{ name: 'Sensitivity Analysis',   file: 'abm-ens/sensitivity.md',         bundled: true },
		],
		references: ABM_ENS_REFERENCES,
	},
};

export function openAbmEnsWebview(
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
			title: ABM_ENS_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		ABM_ENS_VIEW_TYPE,
		ABM_ENS_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getAbmEnsHtml());

	registerAbmEnsWebviewHandlers(
		webviewInput,
		ABM_ENS_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
