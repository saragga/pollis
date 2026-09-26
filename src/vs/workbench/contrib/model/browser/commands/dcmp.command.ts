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
import { getMermaidUris } from '../../../mermaid/browser/mermaidHelper.js';
import { IDcmpMetadata } from '../common/dcmp.types.js';
import { IModelReference, IModelNotebookSection } from '../common/model.types.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { registerDcmpWebviewHandlers } from '../handlers/dcmp.handler.js';
import { getDcmpHtml } from '../webviews/dcmp.template.js';

const DCMP_VIEW_TYPE = 'pollis.dcmp';
const DCMP_TITLE = 'Distribution Comparison Plots';

const DCMP_REFERENCES: IModelReference[] = [
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
		title: 'StatsPlots.jl: Statistical Plotting Recipes for Julia',
		authors: 'JuliaPlots contributors',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/JuliaPlots/StatsPlots.jl',
		openAccess: true,
	},
	{
		title: 'HypothesisTests.jl: Hypothesis Testing in Julia',
		authors: 'JuliaStats contributors',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/JuliaStats/HypothesisTests.jl',
		openAccess: true,
	},
	{
		title: 'Distributions.jl: A Julia Package for Probability Distributions',
		authors: 'JuliaStats contributors',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/JuliaStats/Distributions.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Exploratory Data Analysis',
		authors: 'Tukey, John W.',
		year: 1977,
		journal: 'Pearson',
		url: 'https://www.pearson.com/en-us/subject-catalog/p/exploratory-data-analysis/P200000006166',
		openAccess: false,
	},
	{
		title: 'The Grammar of Graphics',
		authors: 'Wilkinson, Leland',
		year: 2005,
		journal: 'Springer (2nd ed.)',
		doi: '10.1007/0-387-28695-0',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Probability Plotting Methods for the Analysis of Data',
		authors: 'Wilk, Martin B.; Gnanadesikan, Ramanathan',
		year: 1968,
		journal: 'Biometrika',
		doi: '10.2307/2334448',
		openAccess: false,
	},
	{
		title: 'Corrgrams: Exploratory Displays for Correlation Matrices',
		authors: 'Friendly, Michael',
		year: 2002,
		journal: 'The American Statistician',
		doi: '10.1198/000313002533',
		openAccess: false,
	},
];

export const DCMP_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Distribution Comparison Plots',
		notebooks: [
			{ name: 'ECDF and CDF',       file: 'dcmp/tutorial-01-ecdf.ipynb',        bundled: true, description: 'Plot empirical cumulative distributions and overlay theoretical CDFs' },
			{ name: 'QQ Plots',           file: 'dcmp/tutorial-02-qq.ipynb',          bundled: true, description: 'Quantile-Quantile plots for normality assessment and distribution comparison' },
			{ name: 'Marginal Plots',     file: 'dcmp/tutorial-03-marginal.ipynb',    bundled: true, description: 'Joint scatter with histogram and KDE marginals on each axis' },
			{ name: 'Correlogram',        file: 'dcmp/tutorial-04-correlogram.ipynb', bundled: true, description: 'Pairwise scatter matrix with density diagonal for multivariate structure' },
		],
	},
];

const DCMP_METADATA: IDcmpMetadata = {
	dcmp: {
		packages: [
			{ name: 'StatsPlots.jl',      github: 'https://github.com/JuliaPlots/StatsPlots.jl',      papers: [] },
			{ name: 'HypothesisTests.jl', github: 'https://github.com/JuliaStats/HypothesisTests.jl', papers: [] },
			{ name: 'Distributions.jl',   github: 'https://github.com/JuliaStats/Distributions.jl',   papers: [] },
		],
		notebookSections: DCMP_NOTEBOOK_SECTIONS,
		notebooks: DCMP_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      description: 'Quick-reference: plot types, Julia packages, and when to use each',       file: 'dcmp/factsheet.md',      bundled: true },
			{ name: 'Overview',       description: 'When and why to compare distributions visually',                            file: 'dcmp/overview.md',        bundled: true },
			{ name: 'Assumptions',    description: 'Data requirements for valid distribution comparison plots',                  file: 'dcmp/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    description: 'Detecting heavy tails, skew, and deviations from reference distributions',  file: 'dcmp/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', description: 'How to read quantile, density, and correlation plots',                      file: 'dcmp/interpretation.md',  bundled: true },
			{ name: 'Decision Guide', description: 'Which comparison plot fits your distributional question',                   file: 'dcmp/decision-guide.md',  bundled: true },
			{ separator: true, label: 'Plot Types' },
			{ name: 'ECDF',           description: 'Empirical cumulative distribution for any continuous variable',             file: 'dcmp/ecdf.md',            bundled: true },
			{ name: 'QQ Plot',        description: 'Quantile-quantile comparison against a reference distribution',             file: 'dcmp/qq.md',              bundled: true },
			{ name: 'Marginal Plot',  description: 'Joint scatter with per-axis marginal distributions',                        file: 'dcmp/marginal.md',        bundled: true },
			{ name: 'Correlogram',    description: 'Pairwise correlations across all variables as a matrix',                    file: 'dcmp/correlogram.md',     bundled: true },
		],
		references: DCMP_REFERENCES,
		conceptMap: {
			center: 'Comparing Distributions',
			nodes: [
				{ id: 'root', label: 'Comparing Distributions', kind: 'center' },
				// Questions the comparison answers (concepts)
				{ id: 'q_shape', label: 'Overall shape', kind: 'concept' },
				{ id: 'q_ref', label: 'Fit to a reference law', kind: 'concept' },
				{ id: 'q_dep', label: 'Dependence between variables', kind: 'concept' },
				// Underlying statistical notions (concepts)
				{ id: 'c_quant', label: 'Quantiles', kind: 'concept' },
				{ id: 'c_corr', label: 'Correlation', kind: 'concept' },
				// Plots that answer them (this webview's toggles)
				{ id: 'ecdf', label: 'ECDF', kind: 'topic', model: 'ecdf' },
				{ id: 'qq', label: 'QQ Plot', kind: 'topic', model: 'qq' },
				{ id: 'marginal', label: 'Marginal Plot', kind: 'topic', model: 'marginal' },
				{ id: 'correlogram', label: 'Correlogram', kind: 'topic', model: 'correlogram' },
				// Where the idea continues (related webviews / package)
				{ id: 'r_cviz', label: 'Core Statistical Plots', kind: 'related', command: 'chiara.explore.dvcs.histogram' },
				{ id: 'r_mviz', label: 'Multivariate Plots', kind: 'related', command: 'chiara.explore.dvmulti.corner' },
				{ id: 'r_dstats', label: 'Descriptive Statistics', kind: 'related', command: 'chiara.explore.dstats' },
				{ id: 'ext', label: 'StatsPlots.jl', kind: 'external', url: 'https://github.com/JuliaPlots/StatsPlots.jl' },
			],
			edges: [
				{ from: 'root', to: 'q_shape', label: 'asks about' },
				{ from: 'root', to: 'q_ref', label: 'asks about' },
				{ from: 'root', to: 'q_dep', label: 'asks about' },
				{ from: 'q_shape', to: 'ecdf', label: 'read from' },
				{ from: 'q_shape', to: 'c_quant', label: 'summarised by' },
				{ from: 'c_quant', to: 'qq', label: 'compared in' },
				{ from: 'q_ref', to: 'qq', label: 'read from' },
				{ from: 'q_dep', to: 'marginal', label: 'shown by' },
				{ from: 'q_dep', to: 'c_corr', label: 'measured by' },
				{ from: 'c_corr', to: 'correlogram', label: 'visualised by' },
				{ from: 'q_shape', to: 'r_cviz', label: 'per variable in' },
				{ from: 'q_dep', to: 'r_mviz', label: 'many variables in' },
				{ from: 'root', to: 'r_dstats', label: 'numerically in' },
				{ from: 'root', to: 'ext', label: 'plotted with' },
			],
		},
	},
};

export function openDcmpWebview(
	webviewWorkbenchService: IWebviewWorkbenchService,
	openerService: IOpenerService,
	editorService: IEditorService,
	quickInputService: IQuickInputService,
	commandService: ICommandService,
	clipboardService: IClipboardService,
	notificationService: INotificationService,
	notebookEditorModelResolverService: INotebookEditorModelResolverService,
	notebookKernelService: INotebookKernelService,
	languageService: ILanguageService,
	themeService: IThemeService,
	fileService: IFileService,
	pathService: IPathService,
	workspaceContextService: IWorkspaceContextService,
	initialModel?: string,
): void {
	const mermaid = getMermaidUris();
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: DCMP_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [mermaid.distRoot] },
			extension: undefined,
		},
		DCMP_VIEW_TYPE,
		DCMP_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDcmpHtml(mermaid.js));

	registerDcmpWebviewHandlers(
		webviewInput,
		DCMP_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		notebookEditorModelResolverService,
		notebookKernelService,
		languageService,
		themeService,
		fileService,
		pathService,
		workspaceContextService,
		initialModel,
	);
}
