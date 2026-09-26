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
import { ICtmMetadata } from '../common/ctm.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerCtmWebviewHandlers } from '../handlers/ctm.handler.js';
import { getCtmHtml } from '../webviews/ctm.template.js';

const CTM_VIEW_TYPE = 'pollis.ctm';
const CTM_TITLE = 'Correlated Topic Model';

const CTM_REFERENCES: IModelReference[] = [
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
		title: 'Correlated Topic Models',
		authors: 'Blei, David M.; Lafferty, John D.',
		year: 2006,
		journal: 'Advances in Neural Information Processing Systems',
		url: 'https://proceedings.neurips.cc/paper/2005/hash/9e82757e9a1c12cb710ad680db11f6f1-Abstract.html',
		openAccess: true,
	},
	{
		title: 'Latent Dirichlet Allocation',
		authors: 'Blei, David M.; Ng, Andrew Y.; Jordan, Michael I.',
		year: 2003,
		journal: 'Journal of Machine Learning Research',
		url: 'https://jmlr.org/papers/v3/blei03a.html',
		openAccess: true,
	},
];

const CTM_METADATA: ICtmMetadata = {
	ctm: {
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
				name: 'CTM',
				file: 'ctm/tutorial-01-ctm.ipynb',
				bundled: true,
				description: 'Correlated Topic Model with logistic-normal prior for capturing topic correlations using TopicModels.jl',
			},
			{
				name: 'Focused CTM',
				file: 'ctm/tutorial-02-fctm.ipynb',
				bundled: true,
				description: 'Focused CTM with background word separation using TopicModels.jl',
			},
		],
		wikis: [
			{ name: 'Factsheet',      file: 'ctm/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'ctm/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'ctm/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'ctm/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'ctm/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'ctm/decision-guide.md', bundled: true },
			{ separator: true, label: 'Models' },
			{ name: 'CTM',            file: 'ctm/ctm.md',            bundled: true },
			{ name: 'Focused CTM',    file: 'ctm/fctm.md',           bundled: true },
		],
		references: CTM_REFERENCES,
	},
};

export function openCtmWebview(
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
			title: CTM_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		CTM_VIEW_TYPE,
		CTM_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getCtmHtml());

	registerCtmWebviewHandlers(
		webviewInput,
		CTM_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
