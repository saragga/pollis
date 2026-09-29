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
import { IGtMetadata } from '../common/gt.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerGtWebviewHandlers } from '../handlers/gt.handler.js';
import { getGtHtml } from '../webviews/gt.template.js';

const GT_VIEW_TYPE = 'pollis.gt';
const GT_TITLE = 'Game Theory';

const GT_REFERENCES: IModelReference[] = [
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
		title: 'GameTheory.jl: A Julia package for game theory',
		authors: 'QuantEcon',
		year: 2020,
		journal: 'GitHub',
		url: 'https://github.com/QuantEcon/GameTheory.jl',
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
		title: 'A Course in Game Theory',
		authors: 'Osborne, Martin J.; Rubinstein, Ariel',
		year: 1994,
		journal: 'MIT Press (freely available online)',
		url: 'https://arielrubinstein.org/gt/arielDocs/',
		openAccess: true,
	},
	{
		title: 'Game Theory',
		authors: 'Fudenberg, Drew; Tirole, Jean',
		year: 1991,
		journal: 'MIT Press',
		url: 'https://mitpress.mit.edu/9780262061414/game-theory/',
		openAccess: false,
	},
	{
		title: 'Evolution and the Theory of Games',
		authors: 'Maynard Smith, John',
		year: 1982,
		journal: 'Cambridge University Press',
		doi: '10.1017/CBO9780511806292',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Equilibrium Points in N-Person Games',
		authors: 'Nash, John F.',
		year: 1950,
		journal: 'Proceedings of the National Academy of Sciences',
		doi: '10.1073/pnas.36.1.48',
		openAccess: false,
	},
	{
		title: 'Non-Cooperative Games',
		authors: 'Nash, John F.',
		year: 1951,
		journal: 'Annals of Mathematics',
		doi: '10.2307/1969529',
		openAccess: false,
	},
	{
		title: 'Zur Theorie der Gesellschaftsspiele',
		authors: 'von Neumann, John',
		year: 1928,
		journal: 'Mathematische Annalen',
		doi: '10.1007/BF01448847',
		openAccess: false,
	},
	{
		title: 'The Logic of Animal Conflict',
		authors: 'Maynard Smith, John; Price, George R.',
		year: 1973,
		journal: 'Nature',
		doi: '10.1038/246015a0',
		openAccess: false,
	},
	{
		title: 'Computing Nash Equilibria by Iterated Polymatrix Approximation',
		authors: 'Govindan, Srihari; Wilson, Robert',
		year: 2003,
		journal: 'Journal of Economic Dynamics and Control',
		doi: '10.1016/S0165-1889(02)00100-4',
		openAccess: false,
	},
];

const GT_METADATA: IGtMetadata = {
	gt: {
		packages: [
			{
				name: 'GameTheory.jl',
				github: 'https://github.com/QuantEcon/GameTheory.jl',
				papers: [],
				videos: [
					{
						title: 'QuantEcon: Game Theory in Julia',
						description: 'Introduction to game theory concepts and GameTheory.jl via QuantEcon lectures',
						url: 'https://quantecon.org/lectures/',
					},
				],
			},
			{
				name: 'BaryPlots.jl',
				github: 'https://github.com/datadreamscorp/BaryPlots.jl',
				papers: [],
				videos: [],
			},
		],
		notebooks: [
			{ name: 'Normal-Form Games', file: 'game-theory/tutorial-01-normal-form.ipynb', bundled: true, description: 'Represent and solve normal-form games: find pure and mixed Nash equilibria via support enumeration and LRS' },
			{ name: 'Zero-Sum Games', file: 'game-theory/tutorial-02-zero-sum.ipynb', bundled: true, description: 'Solve two-player zero-sum games via linear programming; compute minimax strategies and game value' },
			{ name: 'Evolutionary Game Theory', file: 'game-theory/tutorial-03-evolutionary.ipynb', bundled: true, description: 'Simulate replicator dynamics and visualise population trajectories in the simplex via BaryPlots.jl' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'game-theory/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'game-theory/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'game-theory/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'game-theory/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'game-theory/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'game-theory/decision-guide.md', bundled: true },
			{ separator: true, label: 'Game Types' },
			{ name: 'Normal-Form Games',     file: 'game-theory/normal-form.md',   bundled: true },
			{ name: 'Zero-Sum Games',        file: 'game-theory/zero-sum.md',      bundled: true },
			{ name: 'Evolutionary Dynamics', file: 'game-theory/evolutionary.md',  bundled: true },
		],
		references: GT_REFERENCES,
	},
};

export function openGtWebview(
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
			title: GT_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		GT_VIEW_TYPE,
		GT_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getGtHtml());

	registerGtWebviewHandlers(
		webviewInput,
		GT_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
