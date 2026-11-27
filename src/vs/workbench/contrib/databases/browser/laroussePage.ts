/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Larousse Through the Editions, a page in the Minimal style of the scaffold (encyclopediaPage.ts): an article of the
// allow-any-unicode-next-line
// Larousses from 1866 to 1930, the Grand dictionnaire universel du XIXe siècle and its supplements, the Nouveau Larousse
// allow-any-unicode-next-line
// illustré and its supplement and the Larousse du XXe siècle, its length, its share of its work and its text, with a
// link to its page of the scan, for a headword the user looks up. The texts are downloaded the first time one is asked
// for, by the Julia extension (language-julia.pollisLarousseTexts). The Historical Geography Toolbox's
// menu opens it.

import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { LAROUSSE_METADATA } from '../../model/browser/webviews/larousse.data.js';
import { IScaffoldSqlStep } from '../../model/browser/webviews/webviewScaffold.js';
import { LAROUSSE_DATABASE_ID } from '../common/databaseDrivers.js';
import { ILarousseService, LAROUSSE_COMMAND_ID, LAROUSSE_TEXTS_COMMAND_ID } from '../common/larousse.js';
import { DatabaseConnectionContextMenu, DatabaseItemId, DatabaseItemKind } from './connectionsView.js';
import { openEncyclopediaPage } from './encyclopediaPage.js';

/** The Next Steps: queries of PollisLarousse, in the duckdb> terminal. */
function nextSteps(): IScaffoldSqlStep[] {
	return [
		{
			id: 'throughWorks',
			label: localize('larousse.throughWorks', "An Article Through the Works"),
			desc: localize('larousse.throughWorksDescription', "Each work's articles under a headword, with their length and their share of the work per million characters. Replace HUMBOLDT with your headword, in capitals A to Z only and without accents, as the key column has it."),
			sql: `-- The headword, in capitals A to Z only: replace it with your own
SELECT e.years, e.label, a.title, a.chars, round(1e6 * a.chars / e.chars, 1) AS per_million, a.volume, a.page
FROM PollisLarousse.articles a JOIN PollisLarousse.editions e USING (edition)
WHERE a.key = 'HUMBOLDT'
ORDER BY list_position(['GDU', 'GDU-S1', 'GDU-S2', 'NLI', 'NLI-S', 'L20'], a.edition), a.chars DESC`,
		},
		{
			id: 'longestArticles',
			label: localize('larousse.longestArticles', "Longest Articles of a Work"),
			desc: localize('larousse.longestArticlesDescription', "The fifty longest articles of a work. Replace NLI with the work: GDU, NLI or L20, or GDU-S1, GDU-S2 and NLI-S for the supplements. An article far longer than its subject asks for may have run into the articles after it, whose headwords the scan misread."),
			sql: `-- The work: replace it with your own
SELECT title, chars, volume, page
FROM PollisLarousse.articles
WHERE edition = 'NLI'
ORDER BY chars DESC
LIMIT 50`,
		},
		{
			id: 'newHeadwords',
			label: localize('larousse.newHeadwords', "New Headwords of a Supplement"),
			// allow-any-unicode-next-line
			desc: localize('larousse.newHeadwordsDescription', "The longest articles of the second supplement of the Grand dictionnaire universel (1890) under headwords that neither the dictionary nor its first supplement has: the subjects it added. Replace GDU-S2 with NLI-S, and the works before it with NLI, for the supplement of the Nouveau Larousse illustré."),
			sql: `-- The supplement, and the works before it
SELECT s.title, s.chars, s.volume
FROM PollisLarousse.articles s
WHERE s.edition = 'GDU-S2'
	AND s.key NOT IN (SELECT key FROM PollisLarousse.articles WHERE edition IN ('GDU', 'GDU-S1'))
ORDER BY s.chars DESC
LIMIT 100`,
		},
		{
			id: 'letters',
			label: localize('larousse.letters', "Articles by Letter"),
			// allow-any-unicode-next-line
			desc: localize('larousse.lettersDescription', "The articles and characters of each work under each first letter of their headwords, the room each work gave to each letter; the Larousse du XXe siècle has only the letters of its volumes read."),
			sql: `-- Each work, and each first letter of its headwords
SELECT edition, left(key, 1) AS letter, count(*) AS articles, sum(chars) AS chars
FROM PollisLarousse.articles
GROUP BY edition, letter
ORDER BY list_position(['GDU', 'GDU-S1', 'GDU-S2', 'NLI', 'NLI-S', 'L20'], edition), letter`,
		},
	];
}

/** Opens Larousse Through the Editions, or shows it again when it is open. */
function openLaroussePage(accessor: ServicesAccessor): Promise<void> {
	return openEncyclopediaPage(accessor, {
		id: 'larousse',
		title: localize('larousse.title', "Larousse Through the Editions"),
		metadata: LAROUSSE_METADATA.larousse,
		service: ILarousseService,
		textsCommand: LAROUSSE_TEXTS_COMMAND_ID,
		signatures: false,
		nextSteps: nextSteps(),
		text: {
			// allow-any-unicode-next-line
			intro: localize('larousse.intro', "The articles of the Larousses, read from the scans of the Internet Archive: the Grand dictionnaire universel du XIXe siècle, of 1866 to 1876, and the Nouveau Larousse illustré, of 1897 to 1904, each with its supplements, and two volumes of the Larousse du XXe siècle, of 1929 and 1930. For each work, how long each article is, its share of its work and its text, with a link to its page of the scan. Look up a headword."),
			placeholder: localize('larousse.placeholder', "A headword, such as HUMBOLDT, or DARWIN, CHARLES"),
			lookUpHelp: localize('larousse.lookUpHelp', "The headword as the Larousse prints it, before the first names or the qualifier in brackets that follow it, accents apart; the words after a comma, a first name for example, pick the articles whose title has them."),
			share: localize('larousse.share', "Per Million Characters of the Work"),
			perMillion: localize('larousse.perMillion', "{0} per million characters of the work"),
			editionColumn: localize('larousse.editionColumn', "Work"),
			downloadingTexts: localize('larousse.downloadingTexts', "Downloading the texts of the Larousses, about 250 MB: a minute or so, the first time only..."),
			noText: localize('larousse.noText', "PollisLarousse has no text for this article."),
			noPackage: localize('larousse.noPackage', "PollisLarousse.jl is not installed yet, or is older than its texts: Pollis installs and updates it when the Julia REPL starts."),
			notFound: localize('larousse.notFound', "No article under {0} in any work."),
			editionsFound: localize('larousse.editionsFound', "In {0} of {1} works and {2} of {3} supplements."),
			// allow-any-unicode-next-line
			partHelp: localize('larousse.partHelp', "The supplements (GDU-S1, GDU-S2, NLI-S) added articles to the works before them, whose volumes readers kept: an article they leave out was still in those volumes. Of the Larousse du XXe siècle (L20), only the second and third of its six volumes are read: a headword outside them is not counted."),
			missing: localize('larousse.missing', "PollisLarousse is not on this computer yet. Pollis installs it with its other built-in databases when the Julia REPL starts: start the REPL, and open this page again once it is ready."),
			loading: localize('larousse.loading', "Reading PollisLarousse..."),
			error: localize('larousse.error', "PollisLarousse could not be read: {0}"),
			ocr: localize('larousse.ocr', "The articles are found in the text the Internet Archive read from each scan: an article whose headword the scan misread, or that runs into the next, may be missing or longer than it is, and a title may carry misread letters. The page of the scan shows it as printed."),
		},
	});
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: LAROUSSE_COMMAND_ID,
			title: localize2('larousse.action', "Larousse Through the Editions"),
			category: localize2('databases.category', "Databases"),
			f1: true,
			menu: [{ id: DatabaseConnectionContextMenu, when: ContextKeyExpr.and(DatabaseItemKind.isEqualTo('connection'), DatabaseItemId.isEqualTo(LAROUSSE_DATABASE_ID)), group: '4_import', order: 0 }],
		});
	}
	run(accessor: ServicesAccessor): Promise<void> {
		return openLaroussePage(accessor);
	}
});
