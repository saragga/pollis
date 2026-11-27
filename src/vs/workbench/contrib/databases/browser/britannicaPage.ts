/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Britannica Through the Editions, a page in the Minimal style of the scaffold (encyclopediaPage.ts): an article of the
// Encyclopaedia Britannica in every edition from 1771 to 1929, its length, its share of its edition, its contributor and
// its text, with a link to its page of the scan, for a headword the user looks up. The texts are downloaded the first
// time one is asked for, by the Julia extension (language-julia.pollisBritannicaTexts). The Historical Geography and
// Archaeology Toolbox's menu opens it.

import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { BRITANNICA_METADATA } from '../../model/browser/webviews/britannica.data.js';
import { IScaffoldSqlStep } from '../../model/browser/webviews/webviewScaffold.js';
import { BRITANNICA_COMMAND_ID, BRITANNICA_TEXTS_COMMAND_ID, IBritannicaService } from '../common/britannica.js';
import { BRITANNICA_DATABASE_ID } from '../common/databaseDrivers.js';
import { DatabaseConnectionContextMenu, DatabaseItemId, DatabaseItemKind } from './connectionsView.js';
import { openEncyclopediaPage } from './encyclopediaPage.js';

/** The Next Steps: queries of PollisBritannica, in the duckdb> terminal. */
function nextSteps(): IScaffoldSqlStep[] {
	return [
		{
			id: 'throughEditions',
			label: localize('britannica.throughEditions', "An Article Through the Editions"),
			desc: localize('britannica.throughEditionsDescription', "Each edition's articles under a headword, with their length, their share of the edition per million characters, and their contributor. Replace VIVALDI with your headword, in capitals A to Z only, as the key column has it."),
			sql: `-- The headword, in capitals A to Z only: replace it with your own
SELECT e.years, e.label, a.title, a.chars, round(1e6 * a.chars / e.chars, 1) AS per_million, a.signature, a.volume, a.page
FROM PollisBritannica.articles a JOIN PollisBritannica.editions e USING (edition)
WHERE a.key = 'VIVALDI'
ORDER BY try_cast(regexp_extract(a.edition, '^\\d+') AS INTEGER), a.edition, a.chars DESC`,
		},
		{
			id: 'longestArticles',
			label: localize('britannica.longestArticles', "Longest Articles of an Edition"),
			desc: localize('britannica.longestArticlesDescription', "The fifty longest articles of an edition, with their contributors. Replace 11 with the edition: 1 to 14, or 3S and 6S for the supplements."),
			sql: `-- The edition: replace it with your own
SELECT title, chars, signature, volume
FROM PollisBritannica.articles
WHERE edition = '11'
ORDER BY chars DESC
LIMIT 50`,
		},
		{
			id: 'grewShrank',
			label: localize('britannica.grewShrank', "Articles That Grew or Shrank"),
			desc: localize('britannica.grewShrankDescription', "The articles of the eleventh edition (1911) found again in the fourteenth (1929) under the same title, by how much their length changed, the most cut first. Change the order to see those that grew."),
			sql: `-- Two editions, and the articles of at least 5,000 characters in the first
WITH a AS (SELECT key, title, chars FROM PollisBritannica.articles WHERE edition = '11' AND chars >= 5000),
b AS (SELECT key, title, chars FROM PollisBritannica.articles WHERE edition = '14')
SELECT a.title, a.chars AS chars_1911, b.chars AS chars_1929, round(b.chars / a.chars, 2) AS ratio
FROM a JOIN b USING (key, title)
ORDER BY ratio
LIMIT 100`,
		},
		{
			id: 'contributors',
			label: localize('britannica.contributors', "Contributors of an Edition"),
			desc: localize('britannica.contributorsDescription', "The initials that sign the most text of an edition, with their articles and characters. The initials are as the scan reads them, so one contributor may appear under two spellings. Replace 9 with the edition."),
			sql: `-- The edition: replace it with your own
SELECT signature, count(*) AS articles, sum(chars) AS chars, arg_max(title, chars) AS longest
FROM PollisBritannica.articles
WHERE edition = '9' AND signature IS NOT NULL
GROUP BY signature
ORDER BY chars DESC
LIMIT 50`,
		},
	];
}

/** Opens Britannica Through the Editions, or shows it again when it is open. */
function openBritannicaPage(accessor: ServicesAccessor): Promise<void> {
	return openEncyclopediaPage(accessor, {
		id: 'britannica',
		title: localize('britannica.title', "Britannica Through the Editions"),
		metadata: BRITANNICA_METADATA.britannica,
		service: IBritannicaService,
		textsCommand: BRITANNICA_TEXTS_COMMAND_ID,
		signatures: true,
		nextSteps: nextSteps(),
		text: {
			intro: localize('britannica.intro', "The articles of the Encyclopaedia Britannica in every edition from the first, of 1768 to 1771, to the fourteenth, of 1929, read from the scans of the Internet Archive: how long each article is, its share of its edition, who signed it and its text, with a link to its page of the scan. Look up a headword."),
			placeholder: localize('britannica.placeholder', "A headword, such as VIVALDI, or DARWIN, CHARLES"),
			lookUpHelp: localize('britannica.lookUpHelp', "The headword as the Britannica prints it, its first word or words before a comma; the words after a comma, a first name for example, pick the articles whose title has them."),
			share: localize('britannica.share', "Per Million Characters of the Edition"),
			perMillion: localize('britannica.perMillion', "{0} per million characters of the edition"),
			editionColumn: localize('britannica.editionColumn', "Edition"),
			downloadingTexts: localize('britannica.downloadingTexts', "Downloading the texts of the Britannica, about 535 MB: a minute or more, the first time only..."),
			noText: localize('britannica.noText', "PollisBritannica has no text for this article."),
			noPackage: localize('britannica.noPackage', "PollisBritannica.jl is not installed yet, or is older than its texts: Pollis installs and updates it when the Julia REPL starts."),
			notFound: localize('britannica.notFound', "No article under {0} in any edition."),
			editionsFound: localize('britannica.editionsFound', "In {0} of {1} editions and {2} of {3} supplements."),
			partHelp: localize('britannica.partHelp', "The supplements (3S, 6S) and the new volumes of the tenth, twelfth and thirteenth editions added articles to the editions before them, whose volumes readers kept: an article they leave out was still in those volumes."),
			missing: localize('britannica.missing', "PollisBritannica is not on this computer yet. Pollis installs it with its other built-in databases when the Julia REPL starts: start the REPL, and open this page again once it is ready."),
			loading: localize('britannica.loading', "Reading PollisBritannica..."),
			error: localize('britannica.error', "PollisBritannica could not be read: {0}"),
			ocr: localize('britannica.ocr', "The articles are found in the text the Internet Archive read from each scan: an article whose headword the scan misread, or that runs into the next, may be missing or longer than it is. The page of the scan shows it as printed."),
		},
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: BRITANNICA_COMMAND_ID,
			title: localize2('britannica.action', "Britannica Through the Editions"),
			category: localize2('databases.category', "Databases"),
			f1: true,
			menu: [{ id: DatabaseConnectionContextMenu, when: ContextKeyExpr.and(DatabaseItemKind.isEqualTo('connection'), DatabaseItemId.isEqualTo(BRITANNICA_DATABASE_ID)), group: '4_import', order: 0 }],
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openBritannicaPage(accessor);
	}
});
