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
import { IMpnlpMetadata } from '../common/mpnlp.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerMpnlpWebviewHandlers } from '../handlers/mpnlp.handler.js';
import { getMpnlpHtml } from '../webviews/mpnlp.template.js';

const MPNLP_VIEW_TYPE = 'pollis.mpnlp';
const MPNLP_TITLE = 'Nonlinear Programming';

const MPNLP_REFERENCES: IModelReference[] = [
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
		title: 'JuMP: A Modeling Language for Mathematical Optimization',
		authors: 'Dunning, Iain; Huchette, Joey; Lubin, Miles',
		year: 2017,
		journal: 'SIAM Review',
		doi: '10.1137/15M1020575',
		openAccess: true,
	},
	{
		title: 'On the Implementation of an Interior-Point Filter Line-Search Algorithm for Large-Scale Nonlinear Programming',
		authors: 'Wachter, Andreas; Biegler, Lorenz T.',
		year: 2006,
		journal: 'Mathematical Programming',
		doi: '10.1007/s10107-004-0559-y',
		openAccess: false,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Numerical Optimization',
		authors: 'Nocedal, Jorge; Wright, Stephen J.',
		year: 2006,
		journal: 'Springer (2nd ed.)',
		doi: '10.1007/978-0-387-40065-5',
		openAccess: false,
	},
	{
		title: 'Nonlinear Programming',
		authors: 'Bazaraa, Mokhtar S.; Sherali, Hanif D.; Shetty, C. M.',
		year: 2006,
		journal: 'Wiley (3rd ed.)',
		doi: '10.1002/0471787779',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Nonlinear Programming',
		authors: 'Kuhn, Harold W.; Tucker, Albert W.',
		year: 1951,
		journal: 'Proceedings of the Second Berkeley Symposium',
		url: 'https://projecteuclid.org/euclid.bsmsp/1200500249',
		openAccess: true,
	},
];

export const MPNLP_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Nonlinear Programming',
		notebooks: [
			{ name: 'Basic NLP',      file: 'mpnlp/tutorial-01-basic-nlp.ipynb',      bundled: true, description: 'Formulate and solve a smooth nonlinear programme with JuMP and Ipopt' },
			{ name: 'MLE Estimation', file: 'mpnlp/tutorial-02-mle-estimation.ipynb', bundled: true, description: 'Maximum likelihood estimation as a nonlinear optimisation problem' },
		],
	},
	{
		label: 'Mixed-Integer NLP',
		notebooks: [
			{ name: 'Basic MINLP',    file: 'mpnlp/tutorial-03-basic-minlp.ipynb',    bundled: true, description: 'Formulate and solve a mixed-integer nonlinear programme with SCIP' },
		],
	},
	{
		label: 'Global NLP',
		notebooks: [
			{ name: 'Global NLP',     file: 'mpnlp/tutorial-04-global-nlp.ipynb',     bundled: true, description: 'Find certified global optima of nonconvex NLPs with EAGO and Couenne' },
		],
	},
];

const MPNLP_METADATA: IMpnlpMetadata = {
	mpnlp: {
		packages: [
			{ name: 'JuMP.jl',          github: 'https://github.com/jump-dev/JuMP.jl',             papers: [] },
			{ name: 'Ipopt.jl',         github: 'https://github.com/jump-dev/Ipopt.jl',            papers: [] },
			{ name: 'SCIP.jl',          github: 'https://github.com/scipopt/SCIP.jl',              papers: [] },
			{ name: 'Juniper.jl',       github: 'https://github.com/lanl-ansi/Juniper.jl',         papers: [] },
			{ name: 'EAGO.jl',           github: 'https://github.com/PSORLab/EAGO.jl',              papers: [] },
			{ name: 'AmplNLWriter.jl',  github: 'https://github.com/jump-dev/AmplNLWriter.jl',     papers: [] },
			{ name: 'Couenne_jll.jl',   github: 'https://github.com/JuliaBinaryWrappers/Couenne_jll.jl', papers: [] },
		],
		notebookSections: MPNLP_NOTEBOOK_SECTIONS,
		notebooks: MPNLP_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'mpnlp/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'mpnlp/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'mpnlp/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'mpnlp/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'mpnlp/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'mpnlp/decision-guide.md', bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'NLP',            file: 'mpnlp/nlp.md',            bundled: true },
			{ name: 'MINLP',          file: 'mpnlp/minlp.md',          bundled: true },
			{ name: 'Global NLP',     file: 'mpnlp/gnlp.md',           bundled: true },
			{ separator: true, label: 'Topics' },
			{ name: 'KKT Conditions', file: 'mpnlp/kkt.md',            bundled: true },
		],
		references: MPNLP_REFERENCES,
	},
};

export function openMpnlpWebview(
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
			title: MPNLP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		MPNLP_VIEW_TYPE,
		MPNLP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getMpnlpHtml());

	registerMpnlpWebviewHandlers(
		webviewInput,
		MPNLP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
