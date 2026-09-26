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
import { IBertMetadata } from '../common/bert.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerBertWebviewHandlers } from '../handlers/bert.handler.js';
import { getBertHtml } from '../webviews/bert.template.js';

const BERT_VIEW_TYPE = 'pollis.bert';
const BERT_TITLE = 'BERT Embeddings';

const BERT_REFERENCES: IModelReference[] = [
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
		title: 'Transformers.jl: Transformers in Julia',
		authors: 'Cheng, Ching-Wen',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/chengchingwen/Transformers.jl',
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
		title: 'Deep Learning',
		authors: 'Goodfellow, Ian; Bengio, Yoshua; Courville, Aaron',
		year: 2016,
		journal: 'MIT Press',
		url: 'https://www.deeplearningbook.org/',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
		authors: 'Devlin, Jacob; Chang, Ming-Wei; Lee, Kenton; Toutanova, Kristina',
		year: 2019,
		journal: 'NAACL-HLT',
		url: 'https://arxiv.org/abs/1810.04805',
		openAccess: true,
	},
	{
		title: 'Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks',
		authors: 'Reimers, Nils; Gurevych, Iryna',
		year: 2019,
		journal: 'EMNLP',
		url: 'https://arxiv.org/abs/1908.10084',
		openAccess: true,
	},
	{
		title: 'Attention Is All You Need',
		authors: 'Vaswani, Ashish; Shazeer, Noam; Parmar, Niki; Uszkoreit, Jakob; Jones, Llion; Gomez, Aidan N.; Kaiser, Lukasz; Polosukhin, Illia',
		year: 2017,
		journal: 'NeurIPS',
		url: 'https://arxiv.org/abs/1706.03762',
		openAccess: true,
	},
];

const BERT_NOTEBOOK_SECTIONS = [
	{
		label: 'Basic',
		notebooks: [
			{
				name: 'BERT Embeddings',
				file: 'bert/tutorial-01-bert-embeddings.ipynb',
				bundled: true as const,
				description: 'Load a pre-trained BERT model via Transformers.jl and generate contextual text embeddings',
			},
			{
				name: 'Semantic Similarity',
				file: 'bert/tutorial-02-semantic-similarity.ipynb',
				bundled: true as const,
				description: 'Compute cosine similarity between sentence embeddings for semantic search',
			},
		],
	},
	{
		label: 'Advanced',
		notebooks: [
			{
				name: 'Fine-tuning BERT',
				file: 'bert/tutorial-03-fine-tuning.ipynb',
				bundled: true as const,
				description: 'Fine-tune a BERT model on a custom text classification dataset using Lux.jl',
			},
		],
	},
];

const BERT_METADATA: IBertMetadata = {
	bert: {
		packages: [
			{
				name: 'Transformers.jl',
				github: 'https://github.com/chengchingwen/Transformers.jl',
				papers: [],
			},
			{
				name: 'Lux.jl',
				github: 'https://github.com/LuxDL/Lux.jl',
				papers: [],
			},
		],
		notebooks: BERT_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		notebookSections: BERT_NOTEBOOK_SECTIONS,
		wikis: [
			{ name: 'Factsheet',      file: 'bert/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'bert/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'bert/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'bert/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'bert/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'bert/decision-guide.md', bundled: true },
			{ separator: true, label: 'Architecture' },
			{ name: 'Tokenisation',   file: 'bert/tokenisation.md',   bundled: true },
			{ name: 'Attention',      file: 'bert/attention.md',      bundled: true },
		],
		references: BERT_REFERENCES,
	},
};

export function openBertWebview(
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
			title: BERT_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		BERT_VIEW_TYPE,
		BERT_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getBertHtml());

	registerBertWebviewHandlers(
		webviewInput,
		BERT_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
