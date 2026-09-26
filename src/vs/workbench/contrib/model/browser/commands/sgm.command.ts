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
import { ISgmMetadata } from '../common/sgm.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerSgmWebviewHandlers } from '../handlers/sgm.handler.js';
import { getSgmHtml } from '../webviews/sgm.template.js';

const SGM_VIEW_TYPE = 'pollis.sgm';
const SGM_TITLE = 'Stochastic Gradient Methods';

const SGM_REFERENCES: IModelReference[] = [
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
		title: 'Flux: Elegant Machine Learning with Julia',
		authors: 'Innes, Mike; Saba, Elliot; Fischer, Keno; Gandhi, Dhairya; Rudilosso, Marco Concetto; Joy, Neethu Mariam; Karmali, Tejan; Pal, Avik; Shah, Viral',
		year: 2018,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.00602',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Deep Learning',
		authors: 'Goodfellow, Ian; Bengio, Yoshua; Courville, Aaron',
		year: 2016,
		journal: 'MIT Press',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A Stochastic Approximation Method',
		authors: 'Robbins, Herbert; Monro, Sutton',
		year: 1951,
		journal: 'Annals of Mathematical Statistics',
		doi: '10.1214/aoms/1177729586',
		openAccess: false,
	},
	{
		title: 'Adaptive Subgradient Methods for Online Learning and Stochastic Optimization',
		authors: 'Duchi, John; Hazan, Elad; Singer, Yoram',
		year: 2011,
		journal: 'Journal of Machine Learning Research',
		openAccess: true,
	},
	{
		title: 'Adam: A Method for Stochastic Optimization',
		authors: 'Kingma, Diederik P.; Ba, Jimmy Lei',
		year: 2015,
		journal: 'International Conference on Learning Representations',
		doi: '10.48550/arXiv.1412.6980',
		openAccess: true,
	},
];

const SGM_METADATA: ISgmMetadata = {
	sgm: {
		packages: [
			{
				name: 'Optimisers.jl',
				github: 'https://github.com/FluxML/Optimisers.jl',
				papers: [],
			},
		],
		notebooks: [
			{
				name: 'SGD',
				file: 'sgm/tutorial-01-sgd.ipynb',
				bundled: true,
				description: 'Stochastic gradient descent with Optimisers.jl: setup, training loop, and learning rate scheduling',
			},
			{
				name: 'Adam',
				file: 'sgm/tutorial-02-adam.ipynb',
				bundled: true,
				description: 'Adam optimizer with adaptive moment estimates using Optimisers.jl',
			},
			{
				name: 'AdaGrad and AdaMax',
				file: 'sgm/tutorial-03-adagrad-adamax.ipynb',
				bundled: true,
				description: 'AdaGrad for sparse features and AdaMax with L-infinity norm update',
			},
			{
				name: 'Benchmarking Stochastic Optimizers',
				file: 'sgm/tutorial-04-benchmark.ipynb',
				bundled: true,
				description: 'Compare SGD, Adam, AdaMax, and AdaGrad on regression and neural network training tasks',
			},
		],
		wikis: [
			{ name: 'Factsheet',             file: 'sgm/factsheet.md',             bundled: true },
			{ name: 'Overview',              file: 'sgm/overview.md',              bundled: true },
			{ name: 'Assumptions',           file: 'sgm/assumptions.md',           bundled: true },
			{ name: 'Diagnostics',           file: 'sgm/diagnostics.md',           bundled: true },
			{ name: 'Interpretation',        file: 'sgm/interpretation.md',        bundled: true },
			{ name: 'Decision Guide',        file: 'sgm/decision-guide.md',        bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'SGD',                   file: 'sgm/sgd.md',                   bundled: true },
			{ name: 'Adam',                  file: 'sgm/adam.md',                  bundled: true },
			{ name: 'AdaMax',                file: 'sgm/adamax.md',               bundled: true },
			{ name: 'AdaGrad',               file: 'sgm/adagrad.md',              bundled: true },
		],
		references: SGM_REFERENCES,
	},
};

export function openSgmWebview(
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
			title: SGM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		SGM_VIEW_TYPE,
		SGM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSgmHtml());

	registerSgmWebviewHandlers(
		webviewInput,
		SGM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
