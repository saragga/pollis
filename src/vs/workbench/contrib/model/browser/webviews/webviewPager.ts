/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../nls.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../../platform/storage/common/storage.js';

// The "Rows: 20 · 40 · 100 · All" choice of the pages with a pager, beside Previous, Page X of Y and Next: the
// rows the user chose are kept for each page, in the profile's storage, so that each opens as it was left.

/** The rows a page may show at a time; 0 is all of them. */
const ROWS_CHOICES = [20, 40, 100, 0];

/** The fewest rows a page may show: a pager has nothing to offer for fewer. */
export const FEWEST_ROWS = ROWS_CHOICES[0];

/** Whether `rows` is one of the rows a page may show at a time. */
export function isRowsChoice(rows: unknown): rows is number {
	return typeof rows === 'number' && ROWS_CHOICES.includes(rows);
}

function rowsKey(page: string): string {
	return `pollis.pagerRows.${page}`;
}

/** The rows `page` shows at a time: those the user chose last, or else `fallback`. */
export function storedRows(storageService: IStorageService, page: string, fallback: number): number {
	const rows = storageService.getNumber(rowsKey(page), StorageScope.PROFILE, fallback);
	return isRowsChoice(rows) ? rows : fallback;
}

/** Keeps the rows the user chose for `page`. */
export function storeRows(storageService: IStorageService, page: string, rows: number): void {
	if (isRowsChoice(rows)) {
		storageService.store(rowsKey(page), rows, StorageScope.PROFILE, StorageTarget.USER);
	}
}

/**
 * CSS of the Rows choice: the rows shown in the text's colour, the others as links; at the right of the pager,
 * an empty space as wide at its left keeping Previous, Page X of Y and Next in the middle.
 */
export const rowsChoiceCss = `.rowsChoice { display: inline-flex; align-items: baseline; gap: 6px; }
.rowsChoice .chosen { color: var(--vscode-foreground); font-weight: 600; }
.pager::before { content: ''; flex: 1; }
.pager > .rowsChoice { flex: 1; justify-content: flex-end; }`;

/**
 * The script of the Rows choice, for a page whose script has `vscode`:
 * - `rowsPerPage(rows, total)`: the rows of a page, all `total` for 0;
 * - `rowsChoice(rows, choose)`: the "Rows: 20 · 40 · 100 · All" element, `choose` called with the rows chosen;
 * - `firstPageAfter(page, rows, chosen)`: the page that, with `chosen` rows, shows the first row of `page` of `rows`.
 */
export function rowsChoiceScript(): string {
	return `const ROWS_CHOICES = ${JSON.stringify(ROWS_CHOICES)};
	function rowsPerPage(rows, total) {
		return rows || Math.max(1, total);
	}
	function firstPageAfter(page, rows, chosen) {
		return rows && chosen ? Math.floor(page * rows / chosen) : 0;
	}
	function rowsChoice(rows, choose) {
		const choice = document.createElement('span');
		choice.className = 'rowsChoice';
		choice.append(${JSON.stringify(localize('pager.rows', "Rows per page:"))});
		ROWS_CHOICES.forEach((value, index) => {
			if (index) {
				choice.append('·');
			}
			const label = value ? String(value) : ${JSON.stringify(localize('pager.allRows', "All"))};
			if (value === rows) {
				const chosen = document.createElement('span');
				chosen.className = 'chosen';
				chosen.textContent = label;
				choice.append(chosen);
				return;
			}
			const button = document.createElement('button');
			button.className = 'link';
			button.textContent = label;
			button.addEventListener('click', () => choose(value));
			choice.append(button);
		});
		return choice;
	}`;
}

/**
 * CSS of a table whose headings stay at the top of the page while its rows scroll under them, with a
 * `.stickyBand` above them, such as the line that filters the rows, staying too. The headings stay as one, however
 * many rows they have; their line is a shadow, since the border of a heading stays behind with its table.
 */
export const stickyHeadCss = `.stickyBand { position: sticky; top: 0; z-index: 2; padding: 4px 0; background-color: var(--vscode-editor-background); }
table.stickyHead thead { position: sticky; top: var(--stickyBand, 0px); z-index: 1; }
table.stickyHead th { background-color: var(--vscode-editor-background); border-bottom: none; box-shadow: inset 0 -1px var(--vscode-widget-border); }`;

/**
 * The script of a table with sticky headings: `stickBand(band, table)` keeps the headings of `table` just under
 * `band`, however tall it grows.
 */
export function stickyHeadScript(): string {
	return `function stickBand(band, table) {
		const place = () => table.style.setProperty('--stickyBand', band.offsetHeight + 'px');
		new ResizeObserver(place).observe(band);
		place();
	}`;
}

/** The tooltip of a heading that sorts a table's rows, the same on every page unless the column needs its own. */
export function sortHint(): string {
	return localize('webviewPager.sortHint', "Sort by this column; click again to reverse");
}

/**
 * CSS of the headings that sort a table's rows when clicked, the same on every page: the heading sorted by, and the one
 * under the mouse, in the foreground colour, its arrow after its label. The arrows' look is changed here for all.
 */
export const sortHeadingsCss = `th.sortable { cursor: pointer; user-select: none; }
th.sortable:hover, th.sorted { color: var(--vscode-foreground); }
th .sortArrow { white-space: nowrap; }`;

/**
 * The script of the headings that sort a table: `setSortArrow(heading, label, sorted, descending)` writes the label of
 * a heading, with the arrow of its order when the rows are sorted by it: up from the smallest, down from the largest.
 */
export function sortHeadingsScript(): string {
	return `function setSortArrow(heading, label, sorted, descending) {
		heading.classList.toggle('sorted', sorted);
		heading.textContent = label;
		if (sorted) {
			const arrow = document.createElement('span');
			arrow.className = 'sortArrow';
			arrow.textContent = '\\u00a0' + (descending ? '\\u2193' : '\\u2191');
			heading.appendChild(arrow);
		}
	}`;
}
