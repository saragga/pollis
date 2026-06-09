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
import { IRngMetadata } from '../common/rng.types.js';
import { registerRngWebviewHandlers } from '../handlers/rng.handler.js';
import { getRngHtml } from '../webviews/rng.template.js';

const RNG_VIEW_TYPE = 'pollis.rng';
const RNG_TITLE = 'Random Numbers Generation';

const RNG_METADATA: IRngMetadata = {
	rng: {
		packages: [
			{ name: 'Random', github: 'https://github.com/JuliaLang/julia/tree/master/stdlib/Random', papers: [] },
			{ name: 'StableRNGs.jl', github: 'https://github.com/JuliaRandom/StableRNGs.jl', papers: [] },
		],
		notebooks: [
			{ name: 'RNG Basics', file: 'rng/tutorial-01-rng-basics.ipynb', bundled: true, description: 'Introduction to RNG types, seeding, and basic usage' },
			{ name: 'Reproducibility', file: 'rng/tutorial-02-reproducibility.ipynb', bundled: true, description: 'Ensuring reproducible results with StableRNG and seeds' },
			{ name: 'Parallel RNG', file: 'rng/tutorial-03-parallel.ipynb', bundled: true, description: 'Using TaskLocalRNG for safe parallel random number generation' },
			{ name: 'Distributions', file: 'rng/tutorial-04-distributions.ipynb', bundled: true, description: 'Sampling from various distributions with different RNG backends' },
		],
		wikis: [
			{ name: 'Overview',        file: 'rng/overview.md',        bundled: true },
			{ name: 'Factsheet',       file: 'rng/factsheet.md',       bundled: true },
			{ name: 'Assumptions',     file: 'rng/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',     file: 'rng/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',  file: 'rng/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',  file: 'rng/decision-guide.md',  bundled: true },
		],
		tooltips: {
			rngType: 'StableRNG — cross-version stable (StableRNGs.jl), ideal for tests and reproducible pipelines.\nMersenneTwister — classic PRNG (Random stdlib), widely used, seedable.\nXoshiro — fast modern PRNG (Random stdlib, Julia 1.7+), default algorithm in Julia.\nTask Local RNG — task-local Xoshiro instance (Random stdlib), safe for parallel tasks.\nRandom Device — OS entropy source (Random stdlib), not seedable, suitable for cryptographic use.',
			seed: 'Integer seed for reproducibility. StableRNG requires a seed. TaskLocalRNG uses seed!(rng, n). RandomDevice does not support seeding.',
			operation: 'rand — uniform samples. randn — standard normal (μ=0, σ=1). randexp — exponential(λ=1). bitrand — random Bool array. shuffle — random permutation of a collection. randperm — integer permutation 1:n.',
			count: 'Number of values to generate (n). For shuffle, this is the length of the output collection.',
		},
	},
};

export function openRngWebview(
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
			title: RNG_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		RNG_VIEW_TYPE,
		RNG_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getRngHtml());

	registerRngWebviewHandlers(
		webviewInput,
		RNG_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
