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
import { ISlmMetadata } from '../common/slm.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerSlmWebviewHandlers } from '../handlers/slm.handler.js';
import { getSlmHtml } from '../webviews/slm.template.js';

const SLM_VIEW_TYPE = 'pollis.slm';
const SLM_TITLE = 'Statistical Language Model';

const SLM_REFERENCES: IModelReference[] = [
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
		title: 'TextAnalysis.jl: Julia NLP Toolkit',
		authors: 'JuliaText Contributors',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/JuliaText/TextAnalysis.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Speech and Language Processing',
		authors: 'Jurafsky, Daniel; Martin, James H.',
		year: 2024,
		journal: 'Pearson (3rd ed., draft)',
		url: 'https://web.stanford.edu/~jurafsky/slp3/',
		openAccess: true,
	},
	{
		title: 'Foundations of Statistical Natural Language Processing',
		authors: 'Manning, Christopher D.; Schutze, Hinrich',
		year: 1999,
		journal: 'MIT Press',
		doi: '10.7551/mitpress/3112.001.0001',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Estimation of Probabilities from Sparse Data for the Language Model Component of a Speech Recognizer',
		authors: 'Katz, Slava M.',
		year: 1987,
		journal: 'IEEE Transactions on Acoustics Speech and Signal Processing',
		doi: '10.1109/TASSP.1987.1165125',
		openAccess: false,
	},
	{
		title: 'A Bit of Progress in Language Modeling',
		authors: 'Goodman, Joshua T.',
		year: 2001,
		journal: 'Computer Speech and Language',
		doi: '10.1006/csla.2001.0174',
		openAccess: false,
	},
];

const SLM_METADATA: ISlmMetadata = {
	slm: {
		packages: [
			{
				name: 'TextAnalysis.jl',
				github: 'https://github.com/JuliaText/TextAnalysis.jl',
				papers: [],
			},
			{
				name: 'Languages.jl',
				github: 'https://github.com/JuliaText/Languages.jl',
				papers: [],
			},
		],
		notebooks: [
			{
				name: 'Unigram Model',
				file: 'lang-model/tutorial-01-unigram.ipynb',
				bundled: true,
				description: 'Unigram language model with maximum likelihood and Laplace smoothing',
			},
			{
				name: 'Bigram Model',
				file: 'lang-model/tutorial-02-bigram.ipynb',
				bundled: true,
				description: 'Bigram language model with MLE and Add-k smoothing using TextAnalysis.jl',
			},
			{
				name: 'Trigram Model',
				file: 'lang-model/tutorial-03-trigram.ipynb',
				bundled: true,
				description: 'Trigram language model with backoff and interpolation strategies',
			},
		],
		wikis: [
			{ name: 'Factsheet',      file: 'lang-model/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'lang-model/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'lang-model/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'lang-model/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'lang-model/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'lang-model/decision-guide.md', bundled: true },
			{ separator: true, label: 'Models' },
			{ name: 'Unigram',        file: 'lang-model/unigram.md',        bundled: true },
			{ name: 'Bigram',         file: 'lang-model/bigram.md',         bundled: true },
			{ name: 'Trigram',        file: 'lang-model/trigram.md',        bundled: true },
		],
		references: SLM_REFERENCES,
	},
};

export function openSlmWebview(
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
			title: SLM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		SLM_VIEW_TYPE,
		SLM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getSlmHtml());

	registerSlmWebviewHandlers(
		webviewInput,
		SLM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
