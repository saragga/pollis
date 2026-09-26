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
import { ISdeMetadata } from '../common/sde.types.js';
import { IModelReference } from '../../../model/browser/common/model.types.js';
import { registerSdeWebviewHandlers } from '../handlers/sde.handler.js';
import { getSdeHtml } from '../webviews/sde.template.js';

const SDE_VIEW_TYPE = 'pollis.sde';
const SDE_TITLE = 'Diffusion Processes';

const SDE_REFERENCES: IModelReference[] = [
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
		title: 'An Introduction to Stochastic Differential Equations',
		authors: 'Evans, Lawrence C.',
		year: 2013,
		journal: 'American Mathematical Society',
		url: 'https://math.berkeley.edu/~evans/SDE.course.pdf',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Adaptive Stepsize Based on Control Theory for Stochastic Differential Equations',
		authors: 'Burrage, Kevin; Burrage, Pamela; Higham, Desmond; Kloeden, Peter; Platen, Eckhard',
		year: 2004,
		journal: 'Numerical Algorithms',
		doi: '10.1023/B:NUMA.0000027736.85078.be',
		openAccess: false,
	},
];

const SDE_METADATA: ISdeMetadata = {
	sde: {
		packages: [
			{
				name: 'StochasticDiffEq.jl',
				github: 'https://github.com/SciML/StochasticDiffEq.jl',
				videos: [],
				papers: [],
			},
			{
				name: 'DifferentialEquations.jl',
				github: 'https://github.com/SciML/DifferentialEquations.jl',
				videos: [],
				papers: [],
			},
		],
		notebooks: [
			{ name: 'Additive Noise', file: 'sde/tutorial-01-additive.ipynb', bundled: true, description: 'Define and solve an Itô SDE with constant diffusion using Euler-Maruyama' },
			{ name: 'Multiplicative Noise', file: 'sde/tutorial-02-multiplicative.ipynb', bundled: true, description: 'State-dependent diffusion with the SRIW1 adaptive Itô solver' },
			{ name: 'Stratonovich', file: 'sde/tutorial-03-stratonovich.ipynb', bundled: true, description: 'Stratonovich interpretation using EulerHeun; compare with Itô solution' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'sde/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'sde/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'sde/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'sde/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'sde/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'sde/decision-guide.md', bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Additive Noise',      file: 'sde/additive.md',      bundled: true },
			{ name: 'Multiplicative Noise', file: 'sde/multiplicative.md', bundled: true },
			{ name: 'Stratonovich',        file: 'sde/stratonovich.md',   bundled: true },
		],
		references: SDE_REFERENCES,
	},
};

export function openSdeWebview(
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
			title: SDE_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		SDE_VIEW_TYPE,
		SDE_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSdeHtml());

	registerSdeWebviewHandlers(
		webviewInput,
		SDE_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
