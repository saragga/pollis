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
import { IHareMetadata } from '../common/hare.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerHareWebviewHandlers } from '../handlers/hare.handler.js';
import { getHareHtml } from '../webviews/hare.template.js';

const HARE_VIEW_TYPE = 'pollis.hare';
const HARE_TITLE = 'Linear Models with Heteroskedasticity';

const HARE_REFERENCES: IModelReference[] = [
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
		title: 'Estimating Regression Models with Multiplicative Heteroscedasticity',
		authors: 'Harvey, Andrew C.',
		year: 1976,
		journal: 'Econometrica',
		doi: '10.2307/1913974',
		openAccess: false,
	},
	{
		title: 'A New Test for Heteroskedasticity',
		authors: 'Glejser, Herbert',
		year: 1969,
		journal: 'Journal of the American Statistical Association',
		doi: '10.1080/01621459.1969.10500975',
		openAccess: false,
	},
	{
		title: 'A Heteroskedasticity-Consistent Covariance Matrix Estimator and a Direct Test for Heteroskedasticity',
		authors: 'White, Halbert',
		year: 1980,
		journal: 'Econometrica',
		doi: '10.2307/1912934',
		openAccess: false,
	},
];

const HARE_METADATA: IHareMetadata = {
	hare: {
		packages: [
			{
				name: 'HARE.jl',
				github: 'https://github.com/Trumpingtons/HARE.jl',
				videos: [
					{
						title: 'Julia in Academia',
						description: 'Overview of Julia for academic and scientific computing',
						url: 'https://www.youtube.com/watch?v=wPFPT-Ech2c',
					},
				],
				papers: [],
			},
		],
		references: HARE_REFERENCES,
		notebooks: [
			{ name: 'Exponential', file: 'lm-hetero/tutorial-01-exponential.ipynb', bundled: true, description: 'Exponential variance FGLS: Var(u) = sigma^2 * exp(z alpha) via two-step FWLS and MLE' },
			{ name: 'Power',      file: 'lm-hetero/tutorial-02-power.ipynb',       bundled: true, description: 'Power variance FGLS: std(u) proportional to |z alpha|^p via two-step FWLS and MLE' },
			{ name: 'Quadratic',  file: 'lm-hetero/tutorial-03-quadratic.ipynb',   bundled: true, description: 'Quadratic variance FGLS: Var(u) proportional to (z alpha)^2 via two-step FWLS and MLE' },
			{ name: 'Linear',     file: 'lm-hetero/tutorial-04-linear.ipynb',      bundled: true, description: 'Linear variance FGLS: Var(u) proportional to z alpha via two-step FWLS and MLE' },
		],
		wikis: [
			{ name: 'Factsheet',      file: 'lm-hetero/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'lm-hetero/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'lm-hetero/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'lm-hetero/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'lm-hetero/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'lm-hetero/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Variance Models' },
			{ name: 'Exponential',    file: 'lm-hetero/exponential.md',     bundled: true },
			{ name: 'Power',          file: 'lm-hetero/power.md',           bundled: true },
			{ name: 'Quadratic',      file: 'lm-hetero/quadratic.md',       bundled: true },
			{ name: 'Linear',         file: 'lm-hetero/linear.md',          bundled: true },
		],
	},
};

export function openHareWebview(
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
			title: HARE_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		HARE_VIEW_TYPE,
		HARE_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getHareHtml());

	registerHareWebviewHandlers(
		webviewInput,
		HARE_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
