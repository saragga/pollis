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
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { XLSX_METADATA } from '../webviews/xlsx.data.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { registerXlsxWebviewHandlers } from '../handlers/xlsx.handler.js';
import { getXlsxHtml } from '../webviews/xlsx.template.js';

const XLSX_VIEW_TYPE = 'pollis.xlsx';
const XLSX_TITLE = 'Excel Workbook';

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

	webviewInput.webview.setHtml(getXlsxHtml(mermaid.js, XLSX_METADATA));

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
