/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The documentation shown on hovering a name in the code boxes of the panels: the Julia extension finds the name and
// asks the Julia REPL already running; the page's side is webviews/scaffoldCodeHover.ts.

import { Event } from '../../../../../base/common/event.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { CommandsRegistry, ICommandService } from '../../../../../platform/commands/common/commands.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { renderMarkdownDocument } from '../../../markdown/browser/markdownDocumentRenderer.js';

const CODE_HOVER_COMMAND_ID = '_pollis.panels.codeHover';

/** The documentation of the name at a place in a code box, and where that name is. */
interface ICodeHover {
	readonly html: string;
	readonly start: number;
	readonly end: number;
}

/** What the page sends when the pointer rests on its code. */
interface ICodeHoverMessage {
	readonly command: 'codeHover';
	readonly id: number;
	readonly code: string;
	readonly offset: number;
	readonly earlier: string;
}

/** Renders the Julia extension's answer as HTML that can be put in a page: sanitized, with no links and no media. */
CommandsRegistry.registerCommand(CODE_HOVER_COMMAND_ID, async (accessor, code: string, offset: number, earlier: string): Promise<ICodeHover | undefined> => {
	if (typeof code !== 'string' || typeof offset !== 'number' || typeof earlier !== 'string') {
		return undefined;
	}
	const commandService = accessor.get(ICommandService);
	const extensionService = accessor.get(IExtensionService);
	const languageService = accessor.get(ILanguageService);
	const doc = await commandService.executeCommand<{ readonly markdown: string; readonly start: number; readonly end: number }>('language-julia.pollisHoverDoc', code, offset, earlier);
	if (!doc) {
		return undefined;
	}
	const html = await renderMarkdownDocument(doc.markdown, extensionService, languageService, { sanitizerConfig: { allowedLinkProtocols: { override: [] }, allowedMediaProtocols: { override: [] } } });
	return { html: html.toString(), start: doc.start, end: doc.end };
});

/** Answers the hovers of a panel's code boxes, with nothing when the Julia REPL or the Julia extension cannot answer. */
export function createCodeHoverWiring(
	webview: { postMessage(message: unknown): void; readonly onMessage: Event<{ readonly message: ICodeHoverMessage }> },
	disposables: DisposableStore,
	commandService: ICommandService,
): void {
	disposables.add(webview.onMessage(async e => {
		const msg = e.message;
		if (msg?.command !== 'codeHover') {
			return;
		}
		// A missing command or a REPL that closed while asked is no error to show on a hover
		const hover = await commandService.executeCommand<ICodeHover>(CODE_HOVER_COMMAND_ID, msg.code, msg.offset, msg.earlier).catch(() => undefined);
		webview.postMessage({ command: 'codeHoverDoc', id: msg.id, html: hover?.html ?? '', start: hover?.start, end: hover?.end });
	}));
}
