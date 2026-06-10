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
import { getMermaidUris } from '../../../mermaid/browser/mermaidHelper.js';
import { IXlsxMetadata } from '../common/xlsx.types.js';
import { IModelNotebookSection } from '../common/model.types.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { registerXlsxWebviewHandlers } from '../handlers/xlsx.handler.js';
import { getXlsxHtml } from '../webviews/xlsx.template.js';

const XLSX_VIEW_TYPE = 'pollis.xlsx';
const XLSX_TITLE = 'Excel Workbook';

const XLSX_NOTEBOOK_SECTIONS: IModelNotebookSection[] = [
	{
		label: 'Excel Workbook',
		notebooks: [
			{ name: 'Read and Explore',      file: 'xlsx/tutorial-01-read.ipynb',    bundled: true, description: 'Load sheets and ranges from an .xlsx file using the Tables.jl interface' },
			{ name: 'Write and Format',       file: 'xlsx/tutorial-02-write.ipynb',   bundled: true, description: 'Create a styled multi-sheet workbook with fonts, fills, and borders' },
			{ name: 'Formulas and Names',     file: 'xlsx/tutorial-03-formula.ipynb', bundled: true, description: 'Embed Excel formulas and defined names for downstream spreadsheet users' },
			{ name: 'Conditional Formatting', file: 'xlsx/tutorial-04-cond.ipynb',    bundled: true, description: 'Highlight cells automatically using rule-based conditional formatting' },
		],
	},
];

const XLSX_METADATA: IXlsxMetadata = {
	xlsx: {
		packages: [
			{ name: 'XLSX.jl',   github: 'https://github.com/felipenoris/XLSX.jl',   papers: [] },
			{ name: 'Tables.jl', github: 'https://github.com/JuliaData/Tables.jl', papers: [] },
		],
		notebookSections: XLSX_NOTEBOOK_SECTIONS,
		notebooks: XLSX_NOTEBOOK_SECTIONS.flatMap(s => s.notebooks),
		wikis: [
			{ name: 'Factsheet',      description: 'Quick-reference: XLSX.jl API, key functions, and when to use each task mode',     file: 'xlsx/factsheet.md',      bundled: true },
			{ name: 'Overview',       description: 'Reading, writing, and formatting Excel files from Julia with XLSX.jl',             file: 'xlsx/overview.md',        bundled: true },
			{ name: 'Assumptions',    description: 'File format constraints, data types, and encoding requirements',                   file: 'xlsx/assumptions.md',     bundled: true },
			{ name: 'Diagnostics',    description: 'Common errors: missing sheets, type mismatches, merged cells, encoding issues',    file: 'xlsx/diagnostics.md',     bundled: true },
			{ name: 'Interpretation', description: 'Understanding workbook structure: sheets, cells, ranges, and named regions',       file: 'xlsx/interpretation.md',  bundled: true },
		],
		references: [
			{ separator: true, label: 'Software' },
			{
				title: 'XLSX.jl: Read and write Excel files in pure Julia',
				authors: 'Noris, Felipe; contributors',
				year: 2024,
				journal: 'GitHub',
				url: 'https://github.com/felipenoris/XLSX.jl',
				openAccess: true,
			},
			{
				title: 'Tables.jl: An Interface for Tabular Data',
				authors: 'Quinn, Jacob; contributors',
				year: 2023,
				journal: 'GitHub',
				url: 'https://github.com/JuliaData/Tables.jl',
				openAccess: true,
			},
			{ separator: true, label: 'Standards' },
			{
				title: 'Office Open XML File Formats — Part 1: Fundamentals and Markup Language Reference',
				authors: 'Ecma International',
				year: 2016,
				journal: 'ECMA-376 5th Edition',
				url: 'https://www.ecma-international.org/publications-and-standards/standards/ecma-376/',
				openAccess: true,
			},
		],
		conceptMap: {
			center: 'Excel Workbook',
			nodes: [
				{ id: 'root',    label: 'Excel Workbook',      kind: 'center' },
				{ id: 'q_read',  label: 'Load data',           kind: 'concept' },
				{ id: 'q_write', label: 'Generate report',     kind: 'concept' },
				{ id: 'q_fmt',   label: 'Style cells',         kind: 'concept' },
				{ id: 'q_form',  label: 'Embed formulas',      kind: 'concept' },
				{ id: 'read',    label: 'Read',                kind: 'topic', model: 'read' },
				{ id: 'write',   label: 'Write',               kind: 'topic', model: 'write' },
				{ id: 'format',  label: 'Format',              kind: 'topic', model: 'format' },
				{ id: 'formula', label: 'Formula',             kind: 'topic', model: 'formula' },
				{ id: 'r_df',    label: 'Tables.jl',           kind: 'related', command: 'chiara.statistics.data.df' },
				{ id: 'ext',     label: 'XLSX.jl',             kind: 'external', url: 'https://github.com/felipenoris/XLSX.jl' },
			],
			edges: [
				{ from: 'root',    to: 'q_read',  label: 'asks about' },
				{ from: 'root',    to: 'q_write', label: 'asks about' },
				{ from: 'root',    to: 'q_fmt',   label: 'asks about' },
				{ from: 'root',    to: 'q_form',  label: 'asks about' },
				{ from: 'q_read',  to: 'read',    label: 'done with' },
				{ from: 'q_write', to: 'write',   label: 'done with' },
				{ from: 'q_fmt',   to: 'format',  label: 'done with' },
				{ from: 'q_form',  to: 'formula', label: 'done with' },
				{ from: 'q_read',  to: 'r_df',    label: 'loads into' },
				{ from: 'root',    to: 'ext',     label: 'built with' },
			],
		},
	},
};

export function openXlsxWebview(
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
): void {
	const mermaid = getMermaidUris();
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title: XLSX_TITLE,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [mermaid.distRoot] },
			extension: undefined,
		},
		XLSX_VIEW_TYPE,
		XLSX_TITLE,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(getXlsxHtml(mermaid.js));

	registerXlsxWebviewHandlers(
		webviewInput,
		XLSX_METADATA,
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
	);
}
