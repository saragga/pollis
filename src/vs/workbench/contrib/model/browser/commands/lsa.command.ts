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
import { ILsaMetadata } from '../common/lsa.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerLsaWebviewHandlers } from '../handlers/lsa.handler.js';
import { getLsaHtml } from '../webviews/lsa.template.js';

const LSA_VIEW_TYPE = 'pollis.lsa';
const LSA_TITLE = 'Latent Semantic Analysis';

const LSA_REFERENCES: IModelReference[] = [
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
		doi: '10.1017/CBO9780511809071',
		openAccess: true,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Indexing by Latent Semantic Analysis',
		authors: 'Deerwester, Scott; Dumais, Susan T.; Furnas, George W.; Landauer, Thomas K.; Harshman, Richard',
		year: 1990,
		journal: 'Journal of the American Society for Information Science',
		doi: '10.1002/(SICI)1097-4571(199009)41:6<391::AID-ASI1>3.0.CO;2-9',
		openAccess: false,
	},
	{
		title: 'Latent Semantic Analysis',
		authors: 'Dumais, Susan T.',
		year: 2004,
		journal: 'Annual Review of Information Science and Technology',
		doi: '10.1002/aris.1440380105',
		openAccess: false,
	},
];

const LSA_METADATA: ILsaMetadata = {
	lsa: {
		packages: [
			{
				name: 'TextAnalysis.jl',
				github: 'https://github.com/JuliaText/TextAnalysis.jl',
				papers: [],
			},
			{
				name: 'LinearAlgebra.jl',
				github: 'https://github.com/JuliaLang/LinearAlgebra.jl',
				papers: [],
			},
		],
		notebooks: [
			{
				name: 'LSA',
				file: 'lsa/tutorial-01-lsa.ipynb',
				bundled: true,
				description: 'Latent Semantic Analysis via truncated SVD on a TF-IDF matrix using TextAnalysis.jl and LinearAlgebra.jl',
			},
		],
		wikis: [
			{ name: 'Factsheet',      file: 'lsa/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'lsa/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'lsa/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'lsa/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'lsa/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'lsa/decision-guide.md', bundled: true },
			{ separator: true, label: 'Decomposition' },
			{ name: 'SVD',            file: 'lsa/svd.md',            bundled: true },
			{ name: 'Dimensionality', file: 'lsa/dimensionality.md', bundled: true },
		],
		references: LSA_REFERENCES,
	},
};

export function openLsaWebview(
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
			title: LSA_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		LSA_VIEW_TYPE,
		LSA_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getLsaHtml());

	registerLsaWebviewHandlers(
		webviewInput,
		LSA_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
