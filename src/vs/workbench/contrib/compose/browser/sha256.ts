/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { VSBuffer } from '../../../../base/common/buffer.js';

/** The SHA-256 of `content`, in hexadecimal. */
export async function sha256Of(content: VSBuffer): Promise<string> {
	const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', content.buffer as Uint8Array<ArrayBuffer>));
	return [...digest].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
