/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { readReferences } from '../../browser/common/referenceImport.js';

/** The format of a text of references and the main fields of its works. */
function summary(text: string) {
	const { format, references, unread } = readReferences(text);
	return {
		format, unread, works: references.map(({ type, title, authors, year, journal, booktitle, pages, doi }) => ({ type, title, authors, year, journal, booktitle, pages, doi })),
	};
}

suite('Reference import', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('reads BibTeX, BibLaTeX, RIS, CSL-JSON and lists of DOIs', () => {
		assert.deepStrictEqual([
			summary([
				'@article{card1994,',
				'  author = {Card, David and Krueger, Alan B.},',
				'  title = {Minimum Wages and Employment},',
				'  journal = {American Economic Review}, year = 1994, pages = {772--793},',
				'  doi = {10.3386/w4509}',
				'}',
				'@online{noTitle, author = {Nobody}}',
				'@report{g{\\"o}del, author = {G{\\"o}del, Kurt}, title = {Stra{\\ss}e}, date = {2001-05-01}, journaltitle = {X}}',
			].join('\n')),
			summary([
				'TY  - CHAP',
				'AU  - Hamilton, James D.',
				'TI  - State-Space Models',
				'T2  - Handbook of Econometrics',
				'PY  - 1994///',
				'SP  - 3039',
				'EP  - 3080',
				'DO  - https://doi.org/10.1016/S1573-4412(05)80019-4',
				'ER  - ',
			].join('\n')),
			summary(JSON.stringify([
				{ type: 'article-journal', title: 'Robust Inference', author: [{ family: 'Newey', given: 'Whitney K.' }, { literal: 'NBER' }], issued: { 'date-parts': [[1987]] }, 'container-title': 'Econometrica', page: '703-708', DOI: '10.2307/1913610' },
				{ type: 'book' },
			])),
			summary('See https://doi.org/10.1257/AER.91.5.1369, and 10.2307/1913610.\n10.2307/1913610'),
		], [
			{
				format: 'bibtex', unread: 1, works: [
					{ type: 'article', title: 'Minimum Wages and Employment', authors: ['Card, David', 'Krueger, Alan B.'], year: 1994, journal: 'American Economic Review', booktitle: undefined, pages: '772--793', doi: '10.3386/w4509' },
					{ type: 'techreport', title: 'Straße', authors: ['Gödel, Kurt'], year: 2001, journal: 'X', booktitle: undefined, pages: undefined, doi: undefined },
				],
			},
			{
				format: 'ris', unread: 0, works: [
					{ type: 'incollection', title: 'State-Space Models', authors: ['Hamilton, James D.'], year: 1994, journal: undefined, booktitle: 'Handbook of Econometrics', pages: '3039--3080', doi: '10.1016/s1573-4412(05)80019-4' },
				],
			},
			{
				format: 'csl', unread: 1, works: [
					{ type: 'article', title: 'Robust Inference', authors: ['Newey, Whitney K.', 'NBER'], year: 1987, journal: 'Econometrica', booktitle: undefined, pages: '703--708', doi: '10.2307/1913610' },
				],
			},
			{
				format: 'dois', unread: 0, works: [
					{ type: 'misc', title: '10.1257/aer.91.5.1369', authors: undefined, year: undefined, journal: undefined, booktitle: undefined, pages: undefined, doi: '10.1257/aer.91.5.1369' },
					{ type: 'misc', title: '10.2307/1913610', authors: undefined, year: undefined, journal: undefined, booktitle: undefined, pages: undefined, doi: '10.2307/1913610' },
				],
			},
		]);
	});
});
