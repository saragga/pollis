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
import { ILmarMetadata } from '../common/lmar.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerLmarWebviewHandlers } from '../handlers/lmar.handler.js';
import { getLmarHtml } from '../webviews/lmar.template.js';

const LMAR_VIEW_TYPE = 'pollis.lmar';
const LMAR_TITLE = 'Linear Models with Autocorrelation';

const LMAR_REFERENCES: IModelReference[] = [
	{ separator: true, label: 'Software' },
	{
		title: 'Julia: A Fresh Approach to Numerical Computing',
		authors: 'Bezanson, Jeff; Edelman, Alan; Karpinski, Stefan; Shah, Viral B.',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/141000671',
		openAccess: false,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Econometric Analysis',
		authors: 'Greene, William H.',
		year: 2018,
		journal: 'Pearson (8th ed.)',
		url: 'https://www.pearson.com/en-us/subject-catalog/p/econometric-analysis/P200000006119',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Estimation of the First-Order Moving Average Model with Positive Residual Autocorrelation',
		authors: 'Beach, Charles M.; MacKinnon, James G.',
		year: 1978,
		journal: 'Econometrica',
		doi: '10.2307/1911252',
		openAccess: false,
	},
	{
		title: 'Trend Estimators and Serial Correlation',
		authors: 'Prais, Sigbert J.; Winsten, Christopher B.',
		year: 1954,
		journal: 'Cowles Commission Discussion Paper',
		url: 'https://cowles.yale.edu/sites/default/files/files/pub/d00/d0383.pdf',
		openAccess: true,
	},
];

const LMAR_METADATA: ILmarMetadata = {
	lmar: {
		packages: [
			{
				name: 'HARE.jl',
				github: 'https://github.com/Trumpingtons/HARE.jl',
				papers: [],
				videos: [
					{
						title: 'Julia in Academia',
						description: 'Overview of Julia for academic and scientific computing',
						url: 'https://www.youtube.com/watch?v=wPFPT-Ech2c',
					},
				],
			},
		],
		notebooks: [
			{ name: 'Prais-Winsten (Two-Step)',   file: 'lm-ar1/tutorial-01-pw-twostep.ipynb',      bundled: true, description: 'Two-step Prais-Winsten FGLS: estimate rho from OLS residuals, then apply GLS transformation preserving the first observation' },
			{ name: 'Prais-Winsten (Iterated)',   file: 'lm-ar1/tutorial-02-pw-iterated.ipynb',     bundled: true, description: 'Iterated Prais-Winsten: cycle between rho estimation and GLS until convergence' },
			{ name: 'Hildreth-Lu',                file: 'lm-ar1/tutorial-03-hildreth-lu.ipynb',     bundled: true, description: 'Hildreth-Lu grid search over rho in (-1, 1) minimising the sum of squared residuals' },
			{ name: 'Beach-MacKinnon (MLE)',       file: 'lm-ar1/tutorial-04-beach-mackinnon.ipynb', bundled: true, description: 'Beach-MacKinnon exact MLE: joint estimation of beta and rho for asymptotically efficient inference' },
		],
		wikis: [
			{ name: 'Factsheet',             file: 'lm-ar1/factsheet.md',      bundled: true },
			{ name: 'Overview',              file: 'lm-ar1/overview.md',        bundled: true },
			{ name: 'Assumptions',           file: 'lm-ar1/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',           file: 'lm-ar1/diagnostics.md',     bundled: true },
			{ name: 'Interpretation',        file: 'lm-ar1/interpretation.md',  bundled: true },
			{ name: 'Decision Guide',        file: 'lm-ar1/decision-guide.md',  bundled: true },
			{ separator: true, label: 'AR(1) Methods' },
			{ name: 'Prais-Winsten',         file: 'lm-ar1/prais-winsten.md',   bundled: true },
			{ name: 'Hildreth-Lu',           file: 'lm-ar1/hildreth-lu.md',     bundled: true },
			{ name: 'Beach-MacKinnon (MLE)', file: 'lm-ar1/beach-mackinnon.md', bundled: true },
		],
		references: LMAR_REFERENCES,
	},
};

export function openLmarWebview(
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
			title: LMAR_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		LMAR_VIEW_TYPE,
		LMAR_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getLmarHtml());

	registerLmarWebviewHandlers(
		webviewInput,
		LMAR_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
