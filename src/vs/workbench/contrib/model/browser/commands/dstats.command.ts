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
import { IDstatsMetadata } from '../common/dstats.types.js';
import { IModelReference } from '../common/model.types.js';
import { registerDstatsWebviewHandlers } from '../handlers/dstats.handler.js';
import { getDstatsHtml } from '../webviews/dstats.template.js';

const DSTATS_VIEW_TYPE = 'pollis.dstats';
const DSTATS_TITLE = 'Descriptive Statistics';

const DSTATS_REFERENCES: IModelReference[] = [
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
		title: 'StatsBase.jl: Basic Statistics for Julia',
		authors: 'JuliaStats Contributors',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/JuliaStats/StatsBase.jl',
		openAccess: true,
	},
	{
		title: 'FreqTables.jl: Frequency Tables in Julia',
		authors: 'Milan Bouchet-Valat',
		year: 2023,
		journal: 'GitHub',
		url: 'https://github.com/nalimilan/FreqTables.jl',
		openAccess: true,
	},
	{ separator: true, label: 'Textbooks' },
	{
		title: 'Statistics',
		authors: 'Freedman, David; Pisani, Robert; Purves, Roger',
		year: 2007,
		journal: 'W. W. Norton (4th ed.)',
		openAccess: false,
	},
	{
		title: 'The Art of Statistics: Learning from Data',
		authors: 'Spiegelhalter, David',
		year: 2019,
		journal: 'Pelican Books',
		openAccess: false,
	},
	{ separator: true, label: 'Original Papers' },
	{
		title: 'Note on Regression and Inheritance in the Case of Two Parents',
		authors: 'Galton, Francis',
		year: 1889,
		journal: 'Proceedings of the Royal Society of London',
		doi: '10.1098/rspl.1888.0082',
		openAccess: true,
	},
	{
		title: 'The Proof and Measurement of Association between Two Things',
		authors: 'Spearman, Charles',
		year: 1904,
		journal: 'American Journal of Psychology',
		doi: '10.2307/1412159',
		openAccess: false,
	},
];

const DSTATS_NOTEBOOK_SECTIONS = [
	{
		label: 'Basic',
		notebooks: [
			{
				name: 'Summary Statistics',
				file: 'dstats/tutorial-01-summary-statistics.ipynb',
				bundled: true as const,
				description: 'Compute mean, median, std, quantiles, skewness and kurtosis with StatsBase.jl',
			},
			{
				name: 'Frequency Tables',
				file: 'dstats/tutorial-02-frequency-tables.ipynb',
				bundled: true as const,
				description: 'Build frequency and cross-tabulation tables for categorical data with FreqTables.jl',
			},
		],
	},
	{
		label: 'Advanced',
		notebooks: [
			{
				name: 'Correlation Analysis',
				file: 'dstats/tutorial-03-correlation.ipynb',
				bundled: true as const,
				description: 'Compute and visualise Pearson and Spearman correlation matrices with Statistics.jl',
			},
		],
	},
];

const DSTATS_METADATA: IDstatsMetadata = {
	dstats: {
		packages: [
			{
				name: 'StatsBase.jl',
				github: 'https://github.com/JuliaStats/StatsBase.jl',
				papers: [],
			},
			{
				name: 'FreqTables.jl',
				github: 'https://github.com/nalimilan/FreqTables.jl',
				papers: [],
			},
			{
				name: 'Statistics.jl',
				github: 'https://github.com/JuliaStats/Statistics.jl',
				papers: [],
			},
		],
		notebooks: DSTATS_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		notebookSections: DSTATS_NOTEBOOK_SECTIONS,
		wikis: [
			{ name: 'Factsheet',      file: 'dstats/factsheet.md',      bundled: true },
			{ name: 'Overview',       file: 'dstats/overview.md',       bundled: true },
			{ name: 'Assumptions',    file: 'dstats/assumptions.md',    bundled: true },
			{ name: 'Diagnostics',    file: 'dstats/diagnostics.md',    bundled: true },
			{ name: 'Interpretation', file: 'dstats/interpretation.md', bundled: true },
			{ name: 'Decision Guide', file: 'dstats/decision-guide.md', bundled: true },
			{ separator: true, label: 'Methods' },
			{ name: 'Summary Stats',  file: 'dstats/summary-stats.md',  bundled: true },
			{ name: 'Frequency',      file: 'dstats/frequency.md',      bundled: true },
			{ name: 'Correlation',    file: 'dstats/correlation.md',    bundled: true },
		],
		references: DSTATS_REFERENCES,
	},
};

export function openDstatsWebview(
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
			title: DSTATS_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true },
			extension: undefined,
		},
		DSTATS_VIEW_TYPE,
		DSTATS_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getDstatsHtml());

	registerDstatsWebviewHandlers(
		webviewInput,
		DSTATS_METADATA,
		openerService,
		editorService,
		quickInputService,
		commandService,
		clipboardService,
		notificationService,
		initialModel,
	);
}
