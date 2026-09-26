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
import { IRougeMetadata } from '../common/rouge.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerRougeWebviewHandlers } from '../handlers/rouge.handler.js';
import { getRougeHtml } from '../webviews/rouge.template.js';

const ROUGE_VIEW_TYPE = 'pollis.rouge';
const ROUGE_TITLE = 'ROUGE Evaluation';

const ROUGE_REFERENCES: IModelReference[] = [
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
	{ separator: true, label: 'Original Papers' },
	{
		title: 'ROUGE: A Package for Automatic Evaluation of Summaries',
		authors: 'Lin, Chin-Yew',
		year: 2004,
		journal: 'ACL Workshop on Text Summarization Branches Out',
		url: 'https://aclanthology.org/W04-1013',
		openAccess: true,
	},
];

const ROUGE_METADATA: IRougeMetadata = {
	rouge: {
		packages: [
			{
				name: 'TextAnalysis.jl',
				github: 'https://github.com/JuliaText/TextAnalysis.jl',
				papers: [],
			},
		],
		notebooks: [
			{
				name: 'ROUGE Evaluation',
				file: 'rouge/tutorial-01-rouge.ipynb',
				bundled: true,
				description: 'Evaluate summaries with ROUGE-1, ROUGE-2, ROUGE-L, and ROUGE-S using TextAnalysis.jl',
			},
		],
		wikis: [
			{ name: 'Factsheet',      file: 'rouge/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'rouge/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'rouge/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'rouge/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'rouge/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'rouge/decision-guide.md', bundled: true },
			{ separator: true, label: 'Metrics' },
			{ name: 'ROUGE-N',        file: 'rouge/rouge-n.md',        bundled: true },
			{ name: 'ROUGE-L',        file: 'rouge/rouge-l.md',        bundled: true },
			{ name: 'ROUGE-S',        file: 'rouge/rouge-s.md',        bundled: true },
		],
		references: ROUGE_REFERENCES,
	},
};

export function openRougeWebview(
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
			title: ROUGE_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		ROUGE_VIEW_TYPE,
		ROUGE_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getRougeHtml());

	registerRougeWebviewHandlers(
		webviewInput,
		ROUGE_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
