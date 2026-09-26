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
import { IQrngMetadata } from '../common/qrng.types.js';
import { registerQrngWebviewHandlers } from '../handlers/qrng.handler.js';
import { getQrngHtml } from '../webviews/qrng.template.js';

const QRNG_VIEW_TYPE = 'pollis.qrng';
const QRNG_TITLE = 'Quasi-Random Numbers Generation';

const QRNG_METADATA: IQrngMetadata = {
	qrng: {
		packages: [
			{ name: 'QuasiMonteCarlo.jl', github: 'https://github.com/SciML/QuasiMonteCarlo.jl', papers: [] },
		],
		notebooks: [
			{ name: 'QMC Basics', file: 'qrng/tutorial-01-qmc-basics.ipynb', bundled: true, description: 'Introduction to quasi-random sampling and low-discrepancy sequences' },
			{ name: 'Sobol and Halton Sequences', file: 'qrng/tutorial-02-sobol-halton.ipynb', bundled: true, description: 'Sobol and Halton sequences: generation, properties, and convergence' },
			{ name: 'Latin Hypercube Sampling', file: 'qrng/tutorial-03-lhc.ipynb', bundled: true, description: 'Latin hypercube sampling for design of experiments and space-filling' },
			{ name: 'Kronecker and Golden Sequences', file: 'qrng/tutorial-04-kronecker-golden.ipynb', bundled: true, description: 'Additive recurrence and golden ratio sequences' },
		],
		wikis: [
			{ name: 'Overview',       file: 'qrng/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'qrng/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'qrng/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'qrng/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'qrng/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'qrng/decision-guide.md', bundled: true },
		],
		tooltips: {
			method: 'Sobol — (t,s)-net sequence, excellent for high-dimensional integration.\nHalton — prime-base van der Corput sequences, good up to ~10 dimensions.\nFaure — base-q permuted sequences, uniform marginals in all projections.\nLatin Hypercube — randomised stratified sampling, exact uniformity per axis.\nKronecker — additive recurrence with irrational α, near-optimal space coverage.\nGolden — golden ratio additive recurrence, very well-spaced in 1D and 2D.\nGrid — uniform Cartesian lattice, deterministic; n should equal k^d for some k.',
			n: 'Number of quasi-random points to generate. For Grid sampling n should equal k^d for integer k.',
			lb: 'Lower bounds vector, one entry per dimension. E.g. zeros(2) for a 2D unit hypercube.',
			ub: 'Upper bounds vector, one entry per dimension. E.g. ones(2) for a 2D unit hypercube.',
			alpha: 'Direction vector α for Kronecker sequences. Length must match the number of dimensions. Irrational values (e.g. sqrt(2), sqrt(3)) give the best coverage.',
		},
	},
};

export function openQrngWebview(
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
			title: QRNG_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		QRNG_VIEW_TYPE,
		QRNG_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getQrngHtml());

	registerQrngWebviewHandlers(
		webviewInput,
		QRNG_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
