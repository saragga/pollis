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
import { ILdaMetadata } from '../common/lda.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerLdaWebviewHandlers } from '../handlers/lda.handler.js';
import { getLdaHtml } from '../webviews/lda.template.js';

const LDA_VIEW_TYPE = 'pollis.lda';
const LDA_TITLE = 'Latent Dirichlet Allocation';

const LDA_REFERENCES: IModelReference[] = [
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
		title: 'TopicModels.jl',
		authors: 'Zeng, Jonathan',
		year: 2015,
		journal: 'GitHub',
		url: 'https://github.com/slycoder/TopicModels.jl',
		openAccess: true,
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
		title: 'Pattern Recognition and Machine Learning',
		authors: 'Bishop, Christopher M.',
		year: 2006,
		journal: 'Springer',
		doi: '10.1007/978-0-387-45528-0',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Latent Dirichlet Allocation',
		authors: 'Blei, David M.; Ng, Andrew Y.; Jordan, Michael I.',
		year: 2003,
		journal: 'Journal of Machine Learning Research',
		url: 'https://jmlr.org/papers/v3/blei03a.html',
		openAccess: true,
	},
	{
		title: 'The IBP Compound Dirichlet Process and its Application to Focused Topic Analysis',
		authors: 'Williamson, Sinead; Wang, Chong; Heller, Katherine A.; Blei, David M.',
		year: 2010,
		journal: 'ICML',
		url: 'https://icml.cc/Conferences/2010/papers/279.pdf',
		openAccess: true,
	},
];

const LDA_METADATA: ILdaMetadata = {
	lda: {
		packages: [
			{
				name: 'TopicModels.jl',
				github: 'https://github.com/slycoder/TopicModels.jl',
				papers: [],
			},
			{
				name: 'TextAnalysis.jl',
				github: 'https://github.com/JuliaText/TextAnalysis.jl',
				papers: [],
			},
		],
		notebooks: [
			{
				name: 'LDA',
				file: 'lda/tutorial-01-lda.ipynb',
				bundled: true,
				description: 'Latent Dirichlet Allocation topic modelling using TopicModels.jl',
			},
			{
				name: 'Focused LDA',
				file: 'lda/tutorial-02-flda.ipynb',
				bundled: true,
				description: 'Focused LDA topic modelling with background word separation using TopicModels.jl',
			},
		],
		wikis: [
			{ name: 'Factsheet',      file: 'lda/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'lda/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'lda/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'lda/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'lda/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'lda/decision-guide.md', bundled: true },
			{ separator: true, label: 'Models' },
			{ name: 'LDA',            file: 'lda/lda.md',            bundled: true },
			{ name: 'Focused LDA',    file: 'lda/flda.md',           bundled: true },
		],
		references: LDA_REFERENCES,
	},
};

export function openLdaWebview(
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
			title: LDA_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		LDA_VIEW_TYPE,
		LDA_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getLdaHtml());

	registerLdaWebviewHandlers(
		webviewInput,
		LDA_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
