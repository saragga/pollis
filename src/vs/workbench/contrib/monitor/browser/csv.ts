/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/** The rows of CSV `content`, its quoted fields unquoted; a quoted field may hold commas and line breaks. */
export function parseCsv(content: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let quoted = false;
	for (let index = 0; index < content.length; index++) {
		const char = content[index];
		if (quoted) {
			if (char === '"' && content[index + 1] === '"') {
				field += '"';
				index++;
			} else if (char === '"') {
				quoted = false;
			} else {
				field += char;
			}
		} else if (char === '"') {
			quoted = true;
		} else if (char === ',') {
			row.push(field);
			field = '';
		} else if (char === '\n') {
			row.push(field.replace(/\r$/, ''));
			rows.push(row);
			row = [];
			field = '';
		} else {
			field += char;
		}
	}
	if (field || row.length) {
		row.push(field);
		rows.push(row);
	}
	return rows;
}

/** `rows` as CSV, a field quoted when it holds a quote, a comma or a line break. */
export function writeCsv(rows: readonly (readonly string[])[]): string {
	return rows.map(row => row.map(field => /[",\n]/.test(field) ? `"${field.replace(/"/g, '""')}"` : field).join(',')).join('\n') + '\n';
}
