/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// POLLIS: the addresses of the pages of a scan of the Internet Archive, for the pages that Pollis opens in its browser
// (workbench.action.browser.open), such as those of Britannica Through the Editions and OCR Files and Snippets.

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { asJson, IRequestService } from '../../../../platform/request/common/request.js';

/** Where the items are, in the archive's reader. */
const READER_PREFIX = 'https://archive.org/details/';

/** Where the metadata of an item are, field by field. */
const METADATA_PREFIX = 'https://archive.org/metadata/';

/** A part of an address of the Internet Archive, with its brackets encoded too: the archive finds no file whose name has them unencoded. */
function encodeArchivePart(value: string): string {
	return encodeURIComponent(value).replace(/\(/g, '%28').replace(/\)/g, '%29');
}

/**
 * The page of an item in the Internet Archive's reader, of the file of a volume when the item holds more than one, at the
 * page's index in the scan (from 0), or the item when the page is not known.
 */
export function archiveReaderUrl(item: string, file: string | undefined, page: number | undefined): string {
	return READER_PREFIX + encodeArchivePart(item) + (file ? '/' + encodeArchivePart(file) : '') + (page === undefined ? '' : '/page/n' + page);
}

/**
 * The pages of a scan as images, at the size they were scanned, from the server that holds the item, which the item's
 * metadata name: the address of a page with `{page}` where its index in the scan (from 0) goes, as Pollis's browser takes
 * it to go from page to page; undefined when the metadata cannot be read. `file` is the file of the volume, for an item
 * that holds more than one. The archive's shorter address of a page's image, /download/<item>/page/n<page>.jpg, sends the
 * browser on to that server, at an address of another form, and with the file of a volume, encodes its name once more on
 * the way, and so finds no file whose name has a comma or a letter outside ASCII.
 */
export async function archivePageImages(requestService: IRequestService, item: string, file: string | undefined, callSite: string): Promise<string | undefined> {
	const field = async (name: string) => {
		const context = await requestService.request({ type: 'GET', url: METADATA_PREFIX + encodeURIComponent(item) + '/' + name, callSite }, CancellationToken.None);
		return (await asJson<{ readonly result?: string }>(context))?.result;
	};
	try {
		const [server, dir] = await Promise.all([field('server'), field('dir')]);
		if (typeof server !== 'string' || !/^[a-z0-9.-]+\.archive\.org$/.test(server) || typeof dir !== 'string') {
			return undefined;
		}
		return `https://${server}/BookReader/BookReaderImages.php?id=${encodeURIComponent(item)}&itemPath=${encodeURIComponent(dir)}&server=${server}` + (file ? '&subPrefix=' + encodeURIComponent(file) : '') + '&page=n{page}';
	} catch {
		return undefined;
	}
}
