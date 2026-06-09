/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.js';
import { FileAccess } from '../../../../base/common/network.js';
import { asWebviewUri } from '../../webview/common/webview.js';

export interface IMermaidUris {
	js: string;
	distRoot: URI;
}

/**
 * Returns the webview-safe URI for the bundled Mermaid library and the
 * localResourceRoots entry needed to allow the webview to load it.
 *
 * Mermaid `dist/mermaid.min.js` (v11) is a self-contained classic script that
 * assigns `globalThis.mermaid`, so it can be loaded with a plain `<script src>`.
 *
 * Usage in a command:
 *   const mermaid = getMermaidUris();
 *   contentOptions: { allowScripts: true, localResourceRoots: [mermaid.distRoot] }
 *   webviewInput.webview.setHtml(getMyHtml(mermaid.js));
 */
export function getMermaidUris(): IMermaidUris {
	const distRoot = FileAccess.asFileUri('vs/workbench/contrib/mermaid/dist');
	return {
		js: asWebviewUri(FileAccess.asFileUri('vs/workbench/contrib/mermaid/dist/mermaid.min.js')).toString(true),
		distRoot,
	};
}
