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
import { IEsMetadata } from '../common/es.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { registerEsWebviewHandlers } from '../handlers/es.handler.js';
import { getEsHtml } from '../webviews/es.template.js';

const ES_VIEW_TYPE = 'pollis.es';
const ES_TITLE = 'Evolution Strategies';

const ES_REFERENCES: IModelReference[] = [
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
		title: 'Evolutionary.jl: A Julia package for evolutionary algorithms',
		authors: 'Poliak, Art',
		year: 2021,
		journal: 'GitHub',
		doi: '10.5281/zenodo.5781169',
		openAccess: true,
	},
	{
		title: 'Optim: A Mathematical Optimization Package for Julia',
		authors: 'Mogensen, Patrick K.; Riseth, Asbjorn N.',
		year: 2018,
		journal: 'Journal of Open Source Software',
		doi: '10.21105/joss.00615',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Introduction to Evolutionary Computing',
		authors: 'Eiben, A. E.; Smith, J. E.',
		year: 2015,
		journal: 'Springer',
		doi: '10.1007/978-3-662-44874-8',
		openAccess: false,
	},
	{
		title: 'Evolution Strategies: A Comprehensive Introduction',
		authors: 'Beyer, Hans-Georg; Schwefel, Hans-Paul',
		year: 2002,
		journal: 'Natural Computing',
		doi: '10.1023/A:1015059928466',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Completely Derandomized Self-Adaptation in Evolution Strategies',
		authors: 'Hansen, Nikolaus; Ostermeier, Andreas',
		year: 2001,
		journal: 'Evolutionary Computation',
		doi: '10.1162/106365601750190398',
		openAccess: false,
	},
	{
		title: 'Exponential Natural Evolution Strategies',
		authors: 'Glasmachers, Tobias; Schaul, Tom; Yi, Sun; Wierstra, Daan; Schmidhuber, Juergen',
		year: 2010,
		journal: 'GECCO',
		doi: '10.1145/1830483.1830557',
		openAccess: false,
	},
	{
		title: 'Search Biases in Constrained Evolutionary Optimization',
		authors: 'Runarsson, Thomas P.; Yao, Xin',
		year: 2005,
		journal: 'IEEE Transactions on Systems, Man, and Cybernetics',
		doi: '10.1109/TSMCC.2005.843606',
		openAccess: false,
	},
	{
		title: 'Improving the CMA Evolution Strategy and Adapting its Parameters on the Fly',
		authors: 'da Silva Santos, Carlos M.; Machado, Marcos A. S.; Nascimento, Ivo C.',
		year: 2010,
		journal: 'GECCO',
		doi: '10.1145/1830483.1830556',
		openAccess: false,
	},
];

export const ES_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: '',
		notebooks: [
			{
				name: 'CMA-ES',
				file: 'es/tutorial-01-cmaes.ipynb',
				bundled: true,
				description: 'CMA-ES with Evolutionary.jl: covariance adaptation, bounds, and convergence',
			},
			{
				name: 'NES Variants',
				file: 'es/tutorial-02-nes.ipynb',
				bundled: true,
				description: 'Natural evolution strategies: xNES and dxNES with Evolutionary.jl',
			},
			{
				name: 'ISRES & ESCH',
				file: 'es/tutorial-03-isres-esch.ipynb',
				bundled: true,
				description: 'Constrained global search with ISRES and ESCH via NLopt.jl',
			},
		],
	},
];

const ES_METADATA: IEsMetadata = {
	es: {
		packages: [
			{
				name: 'Evolutionary.jl',
				github: 'https://github.com/wildart/Evolutionary.jl',
				papers: [],
			},
			{
				name: 'NLopt.jl',
				github: 'https://github.com/JuliaOpt/NLopt.jl',
				papers: [],
			},
		],
		notebookSections: ES_NOTEBOOK_SECTIONS,
		notebooks: ES_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      file: 'es/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'es/overview.md',        bundled: true },
			{ name: 'Assumptions',    file: 'es/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    file: 'es/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', file: 'es/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', file: 'es/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Algorithm Details' },
			{ name: 'CMA-ES',  file: 'es/cmaes.md',  bundled: true },
			{ name: 'xNES',    file: 'es/xnes.md',   bundled: true },
			{ name: 'dxNES',   file: 'es/dxnes.md',  bundled: true },
			{ name: 'GCMAES',  file: 'es/gcmaes.md', bundled: true },
			{ name: 'ISRES',   file: 'es/isres.md',  bundled: true },
			{ name: 'ESCH',    file: 'es/esch.md',   bundled: true },
		],
		references: ES_REFERENCES,
	},
};

export function openEsWebview(
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
			title: ES_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		ES_VIEW_TYPE,
		ES_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getEsHtml());

	registerEsWebviewHandlers(
		webviewInput,
		ES_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
