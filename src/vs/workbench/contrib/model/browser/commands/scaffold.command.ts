/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IWebviewWorkbenchService } from '../../../webviewPanel/browser/webviewWorkbenchService.js';
import { INotebookEditorModelResolverService } from '../../../notebook/common/notebookEditorModelResolverService.js';
import { INotebookKernelService } from '../../../notebook/common/notebookKernelService.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { IPathService } from '../../../../services/path/common/pathService.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { IScaffoldPanelData } from '../common/model.types.js';
import { registerScaffoldWebviewHandlers } from '../handlers/scaffold.handler.js';

/** A panel built on the shared scaffold. */
export interface IScaffoldPanel {
	/** Short id, e.g. `dstats`: names its ~/.pollis folders and its Next Steps button ids. */
	readonly id: string;
	readonly viewType: string;
	readonly title: string;
	readonly data: IScaffoldPanelData;
	readonly html: () => string;
}

/** Open a scaffold panel, optionally on a given model toggle. */
export function openScaffoldWebview(accessor: ServicesAccessor, panel: IScaffoldPanel, initialModel?: string): void {
	const webviewInput = accessor.get(IWebviewWorkbenchService).openWebview(
		{
			title: panel.title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		panel.viewType,
		panel.title,
		undefined,
		{ group: undefined, preserveFocus: false }
	);

	webviewInput.webview.setHtml(panel.html());

	registerScaffoldWebviewHandlers(
		webviewInput,
		panel.id,
		panel.data,
		initialModel,
		accessor.get(IOpenerService),
		accessor.get(IEditorService),
		accessor.get(ICommandService),
		accessor.get(INotificationService),
		accessor.get(INotebookEditorModelResolverService),
		accessor.get(INotebookKernelService),
		accessor.get(ILanguageService),
		accessor.get(IThemeService),
		accessor.get(IFileService),
		accessor.get(IPathService),
		accessor.get(IWorkspaceContextService),
	);
}
