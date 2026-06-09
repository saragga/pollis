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
import { IClbtMetadata } from '../common/clbt.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerClbtWebviewHandlers } from '../handlers/clbt.handler.js';
import { getClbtHtml } from '../webviews/clbt.template.js';

const CLBT_VIEW_TYPE = 'pollis.clbt';
const CLBT_TITLE = 'ColBERT Retrieval';

const CLBT_REFERENCES: IModelReference[] = [
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
		title: 'ColBERT.jl: Late-Interaction Retrieval in Julia',
		authors: 'Dhruv Agarwal; contributors',
		year: 2024,
		journal: 'GitHub',
		url: 'https://github.com/codetalker7/ColBERT.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Introduction to Information Retrieval',
		authors: 'Manning, Christopher D.; Raghavan, Prabhakar; Schutze, Hinrich',
		year: 2008,
		journal: 'Cambridge University Press',
		url: 'https://nlp.stanford.edu/IR-book/',
		doi: '10.1017/CBO9780511809071',
		openAccess: true,
	},
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
		title: 'ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT',
		authors: 'Khattab, Omar; Zaharia, Matei',
		year: 2020,
		journal: 'SIGIR',
		url: 'https://arxiv.org/abs/2004.12832',
		openAccess: true,
	},
	{
		title: 'ColBERTv2: Effective and Efficient Retrieval via Lightweight Late Interaction',
		authors: 'Santhanam, Keshav; Khattab, Omar; Saad-Falcon, Jon; Potts, Christopher; Zaharia, Matei',
		year: 2022,
		journal: 'NAACL',
		url: 'https://arxiv.org/abs/2112.01488',
		openAccess: true,
	},
	{
		title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
		authors: 'Devlin, Jacob; Chang, Ming-Wei; Lee, Kenton; Toutanova, Kristina',
		year: 2019,
		journal: 'NAACL-HLT',
		url: 'https://arxiv.org/abs/1810.04805',
		openAccess: true,
	},
];

const CLBT_NOTEBOOK_SECTIONS = [
	{
		label: 'Basic',
		notebooks: [
			{
				name: 'ColBERT Indexing',
				file: 'clbt/tutorial-01-colbert-indexing.ipynb',
				bundled: true as const,
				description: 'Build a ColBERT index over a document collection using ColBERT.jl',
			},
			{
				name: 'ColBERT Search',
				file: 'clbt/tutorial-02-colbert-search.ipynb',
				bundled: true as const,
				description: 'Run ranked retrieval queries against a ColBERT index and inspect results',
			},
		],
	},
	{
		label: 'Advanced',
		notebooks: [
			{
				name: 'Classical Corpus Retrieval',
				file: 'clbt/tutorial-03-classical-corpus.ipynb',
				bundled: true as const,
				description: 'Apply ColBERT retrieval to a classical-text corpus (Homer, Confucian canon)',
			},
		],
	},
];

const CLBT_METADATA: IClbtMetadata = {
	clbt: {
		packages: [
			{
				name: 'ColBERT.jl',
				github: 'https://github.com/codetalker7/ColBERT.jl',
				papers: [],
			},
		],
		notebooks: CLBT_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		notebookSections: CLBT_NOTEBOOK_SECTIONS,
		wikis: [
			{ name: 'Factsheet',      file: 'clbt/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'clbt/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'clbt/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'clbt/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'clbt/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'clbt/decision-guide.md', bundled: true },
			{ separator: true, label: 'Retrieval' },
			{ name: 'Late Interaction', file: 'clbt/late-interaction.md', bundled: true },
			{ name: 'Index Structure',  file: 'clbt/index-structure.md',  bundled: true },
		],
		references: CLBT_REFERENCES,
	},
};

export function openClbtWebview(
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
			title: CLBT_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CLBT_VIEW_TYPE,
		CLBT_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getClbtHtml());

	registerClbtWebviewHandlers(
		webviewInput,
		CLBT_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
	);
}
