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
import { ISdeaMetadata } from '../common/sdea.types.js';
import { IModelReference } from '../../../model/browser/common/model.types.js';
import { registerSdeaWebviewHandlers } from '../handlers/sdea.handler.js';
import { getSdeaHtml } from '../webviews/sdea.template.js';

const SDEA_VIEW_TYPE = 'pollis.sdea';
const SDEA_TITLE = 'SDE Ensemble Analysis';

const SDEA_REFERENCES: IModelReference[] = [
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
		title: 'DifferentialEquations.jl: A Performant and Feature-Rich Ecosystem for Solving Differential Equations in Julia',
		authors: 'Rackauckas, Christopher; Nie, Qing',
		year: 2017,
		journal: 'Journal of Open Research Software',
		doi: '10.5334/jors.151',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Stochastic Differential Equations: An Introduction with Applications',
		authors: 'Øksendal, Bernt',
		year: 2003,
		journal: 'Springer (6th ed.)',
		doi: '10.1007/978-3-642-14394-6',
		openAccess: false,
	},
	{
		title: 'A First Passage Time Primer for Stochastic Differential Equations',
		authors: 'Tuckwell, Henry C.',
		year: 1988,
		journal: 'Cambridge University Press',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Parallel Methods for Stochastic Differential Equations and Statistical Simulation',
		authors: 'Rackauckas, Christopher; et al.',
		year: 2020,
		journal: 'arXiv',
		url: 'https://arxiv.org/abs/2012.12720',
		openAccess: true,
	},
];

const SDEA_METADATA: ISdeaMetadata = {
	sdea: {
		packages: [
			{
				name: 'DifferentialEquations.jl',
				github: 'https://github.com/SciML/DifferentialEquations.jl',
				videos: [],
				papers: [],
			},
			{
				name: 'StochasticDiffEq.jl',
				github: 'https://github.com/SciML/StochasticDiffEq.jl',
				videos: [],
				papers: [],
			},
		],
		notebooks: [
			{ name: 'Path Statistics', file: 'sdea/tutorial-01-path-statistics.ipynb', bundled: true, description: 'Compute mean and variance envelopes over SDE trajectories using EnsembleProblem' },
			{ name: 'First Passage Time', file: 'sdea/tutorial-02-first-passage.ipynb', bundled: true, description: 'Estimate hitting-time distributions using ContinuousCallback and ensemble termination' },
			{ name: 'Invariant Distribution', file: 'sdea/tutorial-03-invariant.ipynb', bundled: true, description: 'Estimate the stationary distribution from terminal values of a long-horizon ensemble' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'sdea/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'sdea/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'sdea/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'sdea/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'sdea/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'sdea/decision-guide.md', bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Path Statistics',       file: 'sdea/path-statistics.md',  bundled: true },
			{ name: 'First Passage Time',    file: 'sdea/first-passage.md',    bundled: true },
			{ name: 'Invariant Distribution', file: 'sdea/invariant.md',       bundled: true },
		],
		references: SDEA_REFERENCES,
	},
};

export function openSdeaWebview(
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
			title: SDEA_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		SDEA_VIEW_TYPE,
		SDEA_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSdeaHtml());

	registerSdeaWebviewHandlers(
		webviewInput,
		SDEA_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
