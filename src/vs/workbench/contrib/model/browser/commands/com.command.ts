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
import { IComMetadata } from '../common/com.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerComWebviewHandlers } from '../handlers/com.handler.js';
import { getComHtml } from '../webviews/com.template.js';

const COM_VIEW_TYPE = 'pollis.com';
const COM_TITLE = 'Co-Occurrence Matrix';

const COM_REFERENCES: IModelReference[] = [
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
		authors: 'Manning, Christopher D.; Schuetze, Hinrich',
		year: 1999,
		journal: 'MIT Press',
		url: 'https://nlp.stanford.edu/fsnlp/',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Distributional Structure',
		authors: 'Harris, Zellig S.',
		year: 1954,
		journal: 'Word',
		doi: '10.1080/00437956.1954.11659520',
		openAccess: false,
	},
	{
		title: 'Improving Distributional Similarity with Lessons Learned from Word Embeddings',
		authors: 'Levy, Omer; Goldberg, Yoav; Dagan, Ido',
		year: 2015,
		journal: 'Transactions of the Association for Computational Linguistics',
		doi: '10.1162/tacl_a_00134',
		openAccess: true,
	},
];

const COM_METADATA: IComMetadata = {
	com: {
		packages: [
			{
				name: 'TextAnalysis.jl',
				github: 'https://github.com/JuliaText/TextAnalysis.jl',
				papers: [],
			},
		],
		notebooks: [
			{
				name: 'Co-Occurrence Matrix',
				file: 'com/tutorial-01-com.ipynb',
				bundled: true,
				description: 'Build co-occurrence matrices, apply PPMI weighting, and explore distributional similarity with TextAnalysis.jl',
			},
		],
		wikis: [
			{ name: 'Factsheet',      file: 'com/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'com/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'com/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'com/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'com/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'com/decision-guide.md', bundled: true },
			{ separator: true, label: 'Weighting Schemes' },
			{ name: 'Raw Counts',     file: 'com/raw-counts.md',     bundled: true },
			{ name: 'PPMI',           file: 'com/ppmi.md',           bundled: true },
			{ name: 'PMI',            file: 'com/pmi.md',            bundled: true },
		],
		references: COM_REFERENCES,
	},
};

export function openComWebview(
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
			title: COM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		COM_VIEW_TYPE,
		COM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getComHtml());

	registerComWebviewHandlers(
		webviewInput,
		COM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
