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
import { ILlmTaMetadata } from '../common/llm-ta.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerLlmTaWebviewHandlers } from '../handlers/llm-ta.handler.js';
import { getLlmTaHtml } from '../webviews/llm-ta.template.js';

const LLM_TA_VIEW_TYPE = 'pollis.llm-ta';
const LLM_TA_TITLE = 'LLM Text Analysis';

const LLM_TA_REFERENCES: IModelReference[] = [
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
		title: 'Speech and Language Processing',
		authors: 'Jurafsky, Daniel; Martin, James H.',
		year: 2024,
		journal: 'Pearson (3rd ed., draft)',
		url: 'https://web.stanford.edu/~jurafsky/slp3/',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Attention Is All You Need',
		authors: 'Vaswani, Ashish; Shazeer, Noam; Parmar, Niki; Uszkoreit, Jakob; Jones, Llion; Gomez, Aidan N.; Kaiser, Lukasz; Polosukhin, Illia',
		year: 2017,
		journal: 'NeurIPS',
		url: 'https://arxiv.org/abs/1706.03762',
		openAccess: true,
	},
	{
		title: 'Language Models are Few-Shot Learners',
		authors: 'Brown, Tom B.; Mann, Benjamin; Ryder, Nick; Subbiah, Melanie; Kaplan, Jared; Dhariwal, Prafulla; Neelakantan, Arvind; Shyam, Pranav; Sastry, Girish; Askell, Amanda; Agarwal, Sandhini; Herbert-Voss, Ariel; Krueger, Gretchen; Henighan, Tom; Child, Rewon; Ramesh, Aditya; Ziegler, Daniel M.; Wu, Jeffrey; Winter, Clemens; Hesse, Christopher; Chen, Mark; Sigler, Eric; Litwin, Mateusz; Gray, Scott; Chess, Benjamin; Clark, Jack; Berner, Christopher; McCandlish, Sam; Radford, Alec; Sutskever, Ilya; Amodei, Dario',
		year: 2020,
		journal: 'NeurIPS',
		url: 'https://arxiv.org/abs/2005.14165',
		openAccess: true,
	},
	{
		title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
		authors: 'Lewis, Patrick; Perez, Ethan; Piktus, Aleksandra; Petroni, Fabio; Karpukhin, Vladimir; Goyal, Naman; Kuttler, Heinrich; Lewis, Mike; Yih, Wen-tau; Rocktaschel, Tim; Riedel, Sebastian; Kiela, Douwe',
		year: 2020,
		journal: 'NeurIPS',
		url: 'https://arxiv.org/abs/2005.11401',
		openAccess: true,
	},
];

const LLM_TA_METADATA: ILlmTaMetadata = {
	llmTa: {
		packages: [
			{
				name: 'LLMTextAnalysis.jl',
				github: 'https://github.com/svilupp/LLMTextAnalysis.jl',
				papers: [],
			},
		],
		notebooks: [
			{
				name: 'Document Tagging',
				file: 'llm-ta/tutorial-01-tagging.ipynb',
				bundled: true,
				description: 'Tag a corpus with predefined labels using LLMs — build_index + aitag with GPT-4o-mini',
			},
			{
				name: 'Document Classification',
				file: 'llm-ta/tutorial-02-classification.ipynb',
				bundled: true,
				description: 'Classify documents into mutually exclusive categories using aiclassify',
			},
			{
				name: 'Corpus Summarisation',
				file: 'llm-ta/tutorial-03-summarisation.ipynb',
				bundled: true,
				description: 'Summarise a document corpus with aisummarize — extract key themes and insights',
			},
			{
				name: 'Semantic Q&A',
				file: 'llm-ta/tutorial-04-qa.ipynb',
				bundled: true,
				description: 'Answer questions about a document corpus using retrieval-augmented generation (aiask)',
			},
		],
		wikis: [
			{ name: 'Factsheet',      file: 'llm-ta/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'llm-ta/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'llm-ta/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'llm-ta/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'llm-ta/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'llm-ta/decision-guide.md', bundled: true },
			{ separator: true, label: 'Analysis Modes' },
			{ name: 'Tagging',        file: 'llm-ta/tagging.md',        bundled: true },
			{ name: 'Classification', file: 'llm-ta/classification.md', bundled: true },
			{ name: 'Summarisation',  file: 'llm-ta/summarisation.md',  bundled: true },
			{ name: 'Q&A',            file: 'llm-ta/qa.md',             bundled: true },
		],
		references: LLM_TA_REFERENCES,
	},
};

export function openLlmTaWebview(
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
			title: LLM_TA_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		LLM_TA_VIEW_TYPE,
		LLM_TA_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getLlmTaHtml());

	registerLlmTaWebviewHandlers(
		webviewInput,
		LLM_TA_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
