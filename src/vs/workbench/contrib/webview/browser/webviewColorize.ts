/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// POLLIS: Julia code coloured for a webview of an extension (the Julia code of the tools of the PDF Viewer), as the
// panels colour their Example Code: by the editor's tokenizer, in the colours of the user's theme.

import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { TokenizationRegistry } from '../../../../editor/common/languages.js';
import { tokenizeToString } from '../../../../editor/common/languages/textToHtmlTokenizer.js';
import { generateTokensCSSForColorMap } from '../../../../editor/common/languages/supports/tokenization.js';

/** The code coloured: its HTML, with a class for each token, and the CSS of those classes in the theme's colours. */
interface IColorizedCode {
	readonly html: string;
	readonly css: string;
}

/** Colours `code` as Julia; the HTML escapes the code, so it can be put in a page as it is. */
CommandsRegistry.registerCommand('_pollis.webview.colorizeJulia', async (accessor, code: string): Promise<IColorizedCode | undefined> => {
	if (typeof code !== 'string') {
		return undefined;
	}
	const languageService = accessor.get(ILanguageService);
	const html = await tokenizeToString(languageService, code, 'julia');
	const colorMap = TokenizationRegistry.getColorMap();
	return { html, css: colorMap ? generateTokensCSSForColorMap(colorMap) : '' };
});
