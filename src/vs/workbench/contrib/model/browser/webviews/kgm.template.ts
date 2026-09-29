/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildScaffoldHtml } from './scaffoldParts.js';
import { buildModelHubExploreCss, buildModelHubExploreJs } from './modelHubExplore.js';
import { IKgmMetadata } from '../common/kgm.types.js';

/**
 * The Explore pane queries the Kaggle Models API live: the first selected task's search term ->
 * search, framework -> frameworks (a chip value may list several comma-separated ids), author -> owner.
 */
function buildExploreOverrideJs(metadata: IKgmMetadata): string {
	return buildModelHubExploreJs({
		groups: metadata.kgm.explore?.groups ?? [],
		sortOptions: [
			{ value: 'hotness', label: 'Trending' },
			{ value: 'voteCount', label: 'Most Votes' },
			{ value: 'createTime', label: 'Recently Created' },
			{ value: 'updateTime', label: 'Recently Updated' },
		],
		labelAxes: ['task', 'framework', 'author'],
		fetchMessageJs: `{ command: 'fetchKgmModels', sortBy: mhSort, frameworks: mhSelected('framework').join(',').split(',').filter(Boolean), authors: mhSelected('author'), search: mhSelected('task')[0] || '', pageSize: 30, seq: mhFetchSeq }`,
		resultCommand: 'kgmModels',
		errorCommand: 'kgmModelsError',
		cardJs: `function(m) {
				var framework = m.framework;
				MH_GROUPS.forEach(function(g) {
					if (g.axis !== 'framework') { return; }
					g.chips.forEach(function(c) { if (c.value.split(',')[0] === m.framework) { framework = c.label; } });
				});
				return {
					url: m.url,
					name: m.ref,
					tag: framework,
					meta: '<span class="hfm-meta-chip" title="Last updated">' + pollisClockSvg + ' ' + esc(mhRelTime(m.updateTime)) + '</span>'
						+ '<span class="hfm-meta-chip" title="Votes">&#9825; ' + mhFmt(m.voteCount) + '</span>',
				};
			}`,
		browseUrlJs: `function() { return 'https://www.kaggle.com/models'; }`,
		browseLabel: 'Kaggle &#8599;',
		serviceName: 'Kaggle',
	});
}

export function getKgmHtml(metadata: IKgmMetadata): string {
	return buildScaffoldHtml('kgm', metadata.kgm, {
		title: 'Kaggle Models',
		defaultModel: 'nlp',
		decisionFirstColumn: 'Task',
		illusCollapsed: false,
		illustrationLabel: metadata.kgm.explore?.label ?? 'Illustration',
		illustrationIntro: metadata.kgm.notes?.explore?.intro,
		illustrationFootnote: metadata.kgm.notes?.explore?.footnote,
		illustrationOverrideJs: buildExploreOverrideJs(metadata),
		extraCss: buildModelHubExploreCss(),
	});
}
