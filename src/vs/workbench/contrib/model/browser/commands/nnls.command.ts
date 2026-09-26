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
import { INnlsMetadata } from '../common/nnls.types.js';
import { registerNnlsWebviewHandlers } from '../handlers/nnls.handler.js';
import { getNnlsHtml } from '../webviews/nnls.template.js';

const NNLS_VIEW_TYPE = 'pollis.nnls';
const NNLS_TITLE = 'Non-Negative Least Squares (NNLS)';

const NNLS_METADATA: INnlsMetadata = {
	nnls: {
		packages: [
			{
				name: 'NonNegLeastSquares.jl',
				github: 'https://github.com/JuliaLinearAlgebra/NonNegLeastSquares.jl',
				papers: [
					{
						title: 'Solving Least Squares Problems',
						authors: 'Lawson, C. L., & Hanson, R. J.',
						year: 1987,
						url: 'https://doi.org/10.1137/1.9781611971217',
						openAccess: false,
					},
					{
						title: 'A fast non-negativity-constrained least squares algorithm',
						authors: 'Bro, R., & De Jong, S.',
						year: 1997,
						url: 'https://doi.org/10.1002/(SICI)1099-128X(199709/10)11:5<393::AID-CEM483>3.0.CO;2-L',
						openAccess: false,
					},
					{
						title: 'Toward faster nonnegative matrix factorization: A new algorithm and comparisons',
						authors: 'Kim, D., & Park, H.',
						year: 2008,
						url: 'https://doi.org/10.1109/ICDM.2008.149',
						openAccess: false,
					},
				],
			},
		],
		notebooks: [
			{ name: 'Quick Start',          file: 'nnls/tutorial-01-quickstart.ipynb',  bundled: true, description: 'Solve an NNLS problem and inspect the solution' },
			{ name: 'Algorithm Comparison', file: 'nnls/tutorial-02-algorithms.ipynb',  bundled: true, description: 'Compare pivot, FNNLS, ADMM, and block-pivot solvers' },
			{ name: 'Applications',         file: 'nnls/tutorial-03-applications.ipynb', bundled: true, description: 'Spectral unmixing, signal recovery, and NMF pre-processing' },
		],
		wikis: [
			{ name: 'Overview',       file: 'nnls/overview.md',       bundled: true },
			{ name: 'Factsheet',      file: 'nnls/factsheet.md',      bundled: true },
			{ name: 'Assumptions',    file: 'nnls/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'nnls/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'nnls/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'nnls/decision-guide.md', bundled: true },
		],
		tooltips: {
			A:   'm &#215; n coefficient matrix. Each column is a predictor; each row is an observation.',
			b:   'Response vector of length m. Pass a matrix (m &#215; k) to solve k systems simultaneously.',
			alg: 'Solver algorithm: :pivot (Lawson&#8211;Hanson, default), :fnnls (fast, dense), :admm (large sparse), :blockpivot (batch NMF), :nnls (classic).',
		},
	},
};

export function openNnlsWebview(
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
			title: NNLS_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		NNLS_VIEW_TYPE,
		NNLS_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getNnlsHtml());

	registerNnlsWebviewHandlers(
		webviewInput,
		NNLS_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
