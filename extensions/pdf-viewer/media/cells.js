/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The text and the table of an area of a page, from the text items of pdf.js: the words, with their boxes in points
// from the top left corner of the page, grouped into rows by the tops of the words and into columns by the gaps
// between them.

/**
 * The words of a page's text items, with their boxes in points from the top left corner of the page, whose box in
 * PDF space is `view` ([x0, y0, x1, y1]). An item's width is shared equally among its characters.
 */
export function pageWords(items, view) {
	const words = [];
	for (const item of items) {
		const str = item.str;
		if (!str || !str.trim() || !item.width) {
			continue;
		}
		const left = item.transform[4] - view[0];
		const top = view[3] - item.transform[5] - item.height;
		const perCharacter = item.width / str.length;
		for (const match of str.matchAll(/\S+/g)) {
			words.push({ x: left + match.index * perCharacter, y: top, w: match[0].length * perCharacter, h: item.height, text: match[0] });
		}
	}
	return words;
}

/**
 * The words of the output of `pdftotext -tsv`, with their boxes in points from the top left corner of the page. Its
 * columns are level, page, paragraph, block, line, word, left, top, width, height, confidence and text; level 5 is a word.
 */
export function tsvWords(tsv) {
	const words = [];
	for (const line of tsv.split('\n').slice(1)) {
		const fields = line.replace(/\r$/, '').split('\t');
		if (fields.length !== 12 || fields[0] !== '5' || !fields[11].trim()) {
			continue;
		}
		const [x, y, w, h] = fields.slice(6, 10).map(Number);
		words.push({ x, y, w, h, text: fields[11] });
	}
	return words;
}

/**
 * The cells of a CSV file: separated by semicolons, commas or tabs, whichever the first line has most of outside
 * quotes; a quoted cell may hold the separator, doubled quotes and line breaks.
 */
export function parseCsv(text) {
	const firstLine = text.split('\n')[0].replace(/"[^"]*"/g, '');
	const separator = [';', ',', '\t'].reduce((best, candidate) => firstLine.split(candidate).length > firstLine.split(best).length ? candidate : best, ',');
	const rows = [];
	let row = [];
	let cell = '';
	let quoted = false;
	for (let i = 0; i < text.length; i++) {
		const character = text[i];
		if (quoted) {
			if (character === '"' && text[i + 1] === '"') {
				cell += '"';
				i++;
			} else if (character === '"') {
				quoted = false;
			} else {
				cell += character;
			}
		} else if (character === '"') {
			quoted = true;
		} else if (character === separator) {
			row.push(cell);
			cell = '';
		} else if (character === '\n') {
			row.push(cell.replace(/\r$/, ''));
			rows.push(row);
			row = [];
			cell = '';
		} else {
			cell += character;
		}
	}
	if (cell || row.length) {
		row.push(cell.replace(/\r$/, ''));
		rows.push(row);
	}
	return rows;
}

/** The words whose centres are in `area` ({x, y, W, H} in points), in rows: a word starts a row when its top is more than `rowTolerance` below the row's first. */
export function areaRows(words, area, rowTolerance) {
	const inside = words.filter(word => {
		const cx = word.x + word.w / 2;
		const cy = word.y + word.h / 2;
		return cx >= area.x && cx <= area.x + area.W && cy >= area.y && cy <= area.y + area.H;
	}).sort((a, b) => a.y - b.y || a.x - b.x);
	const rows = [];
	for (const word of inside) {
		const last = rows[rows.length - 1];
		if (last && word.y - last[0].y <= rowTolerance) {
			last.push(word);
		} else {
			rows.push([word]);
		}
	}
	return rows.map(row => row.sort((a, b) => a.x - b.x));
}

/** The text of an area: its rows, each with its words in order, one row to a line. */
export function areaText(words, area, rowTolerance) {
	return areaRows(words, area, rowTolerance).map(row => row.map(word => word.text).join(' ')).join('\n');
}

/**
 * The cells of an area: its rows, and columns made of the spans of the words that are less than `gap` apart; a word
 * goes to the last column that starts before its centre.
 */
export function areaCells(words, area, gap, rowTolerance) {
	const rows = areaRows(words, area, rowTolerance);
	if (!rows.length) {
		return [];
	}
	const spans = rows.flat().map(word => [word.x, word.x + word.w]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
	const columns = [spans[0].slice()];
	for (const [start, end] of spans.slice(1)) {
		const last = columns[columns.length - 1];
		if (start - last[1] < gap) {
			last[1] = Math.max(last[1], end);
		} else {
			columns.push([start, end]);
		}
	}
	return rows.map(row => {
		const cells = columns.map(() => '');
		for (const word of row) {
			let column = 0;
			for (let k = 0; k < columns.length; k++) {
				if (columns[k][0] <= word.x + word.w / 2) {
					column = k;
				}
			}
			cells[column] = cells[column] ? `${cells[column]} ${word.text}` : word.text;
		}
		return cells;
	});
}

/** A cell of a CSV file separated by `separator`: quoted when it has the separator, a quote or a line break. */
function csvCell(cell, separator) {
	return cell.includes(separator) || /["\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

/** The cells as a CSV file separated by semicolons, as the tables of PollisDatasets are. */
export function cellsCsv(cells) {
	return cells.map(row => row.map(cell => csvCell(cell, ';')).join(';')).join('\n');
}

/** The cells separated by tabs, which a spreadsheet pastes into its cells. */
export function cellsTabbed(cells) {
	return cells.map(row => row.map(cell => cell.replace(/[\t\n]/g, ' ')).join('\t')).join('\n');
}

/**
 * The pages of `text`, such as "1-3, 5": the pages of each part, from 1, a range as all its pages; undefined when a
 * page is not a whole number from 1 to `pageCount`, or a range runs backwards.
 */
export function pageRanges(text, pageCount) {
	const ranges = [];
	for (const part of text.split(',').map(part => part.trim()).filter(part => part)) {
		const match = /^(?<first>\d+)\s*(?:-\s*(?<last>\d+))?$/.exec(part);
		if (!match) {
			return undefined;
		}
		const first = Number(match.groups.first);
		const last = match.groups.last === undefined ? first : Number(match.groups.last);
		if (first < 1 || last > pageCount || last < first) {
			return undefined;
		}
		ranges.push(Array.from({ length: last - first + 1 }, (_, i) => first + i));
	}
	return ranges.length ? ranges : undefined;
}
