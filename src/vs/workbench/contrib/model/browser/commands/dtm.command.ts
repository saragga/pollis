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
import { IDtmMetadata } from '../common/dtm.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerDtmWebviewHandlers } from '../handlers/dtm.handler.js';
import { getDtmHtml } from '../webviews/dtm.template.js';

const DTM_VIEW_TYPE = 'pollis.dtm';
const DTM_TITLE = 'Document-Term Matrix & TF-IDF';

const DTM_REFERENCES: IModelReference[] = [
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
		title: 'Introduction to Information Retrieval',
		authors: 'Manning, Christopher D.; Raghavan, Prabhakar; Schutze, Hinrich',
		year: 2008,
		journal: 'Cambridge University Press',
		url: 'https://nlp.stanford.edu/IR-book/',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'A Statistical Interpretation of Term Specificity and Its Application in Retrieval',
		authors: 'Sparck Jones, Karen',
		year: 1972,
		journal: 'Journal of Documentation',
		doi: '10.1108/eb026526',
		openAccess: false,
	},
	{
		title: 'Term-Weighting Approaches in Automatic Text Retrieval',
		authors: 'Salton, Gerard; Buckley, Christopher',
		year: 1988,
		journal: 'Information Processing & Management',
		doi: '10.1016/0306-4573(88)90021-0',
		openAccess: false,
	},
];

const DTM_METADATA: IDtmMetadata = {
	dtm: {
		packages: [
			{
				name: 'TextAnalysis.jl',
				github: 'https://github.com/JuliaText/TextAnalysis.jl',
				papers: [],
			},
		],
		notebooks: [
			{
				name: 'Document-Term Matrix & TF-IDF',
				file: 'dtm/tutorial-01-dtm-tfidf.ipynb',
				bundled: true,
				description: 'Build document-term matrices and compute TF-IDF weights using TextAnalysis.jl',
			},
		],
		wikis: [
			{ name: 'Factsheet',      file: 'dtm/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'dtm/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'dtm/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'dtm/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'dtm/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'dtm/decision-guide.md', bundled: true },
			{ separator: true, label: 'Weighting Schemes' },
			{ name: 'TF-IDF',         file: 'dtm/tf-idf.md',         bundled: true },
			{ name: 'BM25',           file: 'dtm/bm25.md',           bundled: true },
		],
		references: DTM_REFERENCES,
	},
};

export function openDtmWebview(
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
			title: DTM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DTM_VIEW_TYPE,
		DTM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDtmHtml());

	registerDtmWebviewHandlers(
		webviewInput,
		DTM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
