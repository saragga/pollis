/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.js';
import { FileAccess } from '../../../../base/common/network.js';
import { asWebviewUri } from '../../webview/common/webview.js';

export interface IKatexUris {
	js: string;
	css: string;
	distRoot: URI;
}

/**
 * Returns the webview-safe URIs for KaTeX and the localResourceRoots entry
 * needed to allow the webview to load files from the katex dist directory.
 *
 * Usage in a command:
 *   const katex = getKatexUris();
 *   contentOptions: { allowScripts: true, localResourceRoots: [katex.distRoot] }
 *   webviewInput.webview.setHtml(getMyHtml(katex));
 */
export function getKatexUris(): IKatexUris {
	const distRoot = FileAccess.asFileUri('vs/workbench/contrib/katex/dist');
	return {
		js: asWebviewUri(FileAccess.asFileUri('vs/workbench/contrib/katex/dist/katex.min.js')).toString(true),
		css: asWebviewUri(FileAccess.asFileUri('vs/workbench/contrib/katex/dist/katex.min.css')).toString(true),
		distRoot,
	};
}
