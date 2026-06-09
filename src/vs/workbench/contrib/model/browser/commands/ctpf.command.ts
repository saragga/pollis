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
import { ICtpfMetadata } from '../common/ctpf.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerCtpfWebviewHandlers } from '../handlers/ctpf.handler.js';
import { getCtpfHtml } from '../webviews/ctpf.template.js';

const CTPF_VIEW_TYPE = 'pollis.ctpf';
const CTPF_TITLE = 'Collaborative Topic Poisson Factorisation';

const CTPF_REFERENCES: IModelReference[] = [
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
		title: 'Probabilistic Topic Models',
		authors: 'Blei, David M.',
		year: 2012,
		journal: 'Communications of the ACM',
		doi: '10.1145/2133806.2133826',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Collaborative Topic Modeling for Recommending Scientific Articles',
		authors: 'Wang, Chong; Blei, David M.',
		year: 2011,
		journal: 'ACM SIGKDD',
		doi: '10.1145/2020408.2020480',
		openAccess: false,
	},
	{
		title: 'Scalable Recommendation with Hierarchical Poisson Factorization',
		authors: 'Gopalan, Prem; Hofman, Jake M.; Blei, David M.',
		year: 2014,
		journal: 'UAI',
		url: 'https://auai.org/uai2015/proceedings/papers/208.pdf',
		openAccess: true,
	},
];

const CTPF_METADATA: ICtpfMetadata = {
	ctpf: {
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
				name: 'CTPF',
				file: 'ctpf/tutorial-01-ctpf.ipynb',
				bundled: true,
				description: 'Collaborative Topic Poisson Factorisation: joint document modelling and recommendation using TopicModels.jl',
			},
		],
		wikis: [
			{ name: 'Factsheet',      file: 'ctpf/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'ctpf/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'ctpf/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'ctpf/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'ctpf/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'ctpf/decision-guide.md', bundled: true },
			{ separator: true, label: 'Components' },
			{ name: 'Topic Model',           file: 'ctpf/topic-model.md',           bundled: true },
			{ name: 'Poisson Factorisation', file: 'ctpf/poisson-factorisation.md', bundled: true },
			{ name: 'User-Item Ratings',     file: 'ctpf/user-item-ratings.md',     bundled: true },
		],
		references: CTPF_REFERENCES,
	},
};

export function openCtpfWebview(
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
			title: CTPF_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CTPF_VIEW_TYPE,
		CTPF_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCtpfHtml());

	registerCtpfWebviewHandlers(
		webviewInput,
		CTPF_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
