/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { buildScaffoldHtml } from './scaffoldParts.js';
import { buildModelHubExploreCss, buildModelHubExploreJs } from './modelHubExplore.js';
import { IHfmMetadata } from '../common/hfm.types.js';

/** The Explore pane queries the Hub API live: task -> pipeline_tag, author -> author, framework -> filter. */
function buildExploreOverrideJs(metadata: IHfmMetadata): string {
	return buildModelHubExploreJs({
		groups: metadata.hfm.explore?.groups ?? [],
		sortOptions: [
			{ value: 'trending', label: 'Trending' },
			{ value: 'likes', label: 'Most Likes' },
			{ value: 'downloads', label: 'Most Downloads' },
			{ value: 'created_at', label: 'Recently Created' },
			{ value: 'last_modified', label: 'Recently Updated' },
		],
		labelAxes: ['task', 'author', 'framework'],
		fetchMessageJs: `{ command: 'fetchHfModels', sort: mhSort, tags: mhSelected('task'), authors: mhSelected('author'), filters: mhSelected('framework'), limit: 30, seq: mhFetchSeq }`,
		resultCommand: 'hfModels',
		errorCommand: 'hfModelsError',
		cardJs: `function(m) {
				var task = m.pipeline_tag ? mhChipLabel('task', m.pipeline_tag) : '';
				if (task === m.pipeline_tag) { task = task.replace(/-/g, ' '); }
				return {
					url: 'https://huggingface.co/' + m.id,
					name: m.id,
					tag: task,
					meta: '<span class="hfm-meta-chip" title="Last updated">' + pollisClockSvg + ' ' + esc(mhRelTime(m.lastModified)) + '</span>'
						+ '<span class="hfm-meta-chip" title="Downloads">&#8595; ' + mhFmt(m.downloads) + '</span>'
						+ '<span class="hfm-meta-chip" title="Likes">&#9825; ' + mhFmt(m.likes) + '</span>',
				};
			}`,
		browseUrlJs: `function() {
				var sortMap = { trending: 'trending', likes: 'likes', downloads: 'downloads', created_at: 'createdAt', last_modified: 'lastModified' };
				var tags = mhSelected('task');
				var auths = mhSelected('author');
				var url = 'https://huggingface.co/models?sort=' + (sortMap[mhSort] || 'trending');
				if (tags.length === 1) { url += '&pipeline_tag=' + tags[0]; }
				if (auths.length === 1) { url += '&author=' + auths[0]; }
				return url;
			}`,
		browseLabel: 'Hugging Face &#8599;',
		serviceName: 'Hugging Face',
	});
}

export function getHfmHtml(metadata: IHfmMetadata): string {
	return buildScaffoldHtml('hfm', metadata.hfm, {
		title: 'Hugging Face Models',
		defaultModel: 'nlp',
		decisionFirstColumn: 'Task',
		illusCollapsed: false,
		illustrationLabel: metadata.hfm.explore?.label ?? 'Illustration',
		illustrationIntro: metadata.hfm.notes?.explore?.intro,
		illustrationFootnote: metadata.hfm.notes?.explore?.footnote,
		illustrationOverrideJs: buildExploreOverrideJs(metadata),
		extraCss: buildModelHubExploreCss(),
	});
}
