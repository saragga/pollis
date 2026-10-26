/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { API_PROVIDERS, IApiProvider, providerRequest } from '../../browser/common/apiProviders.js';

/** The address and the headers of a request to `provider`, with `key` if any; undefined when it is not asked. */
function asked(provider: IApiProvider, url: string, key: string | undefined) {
	const options = providerRequest(provider, { type: 'GET', url, headers: { 'User-Agent': 'Pollis' }, callSite: 'test' }, key);
	return options && { url: options.url, headers: options.headers };
}

suite('API providers', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('asks without a key first, then with one; a provider that requires a key is not asked without one', () => {
		const paid: IApiProvider = { ...API_PROVIDERS.semanticScholar, name: 'Paid', keyRequired: true };
		assert.deepStrictEqual({
			withoutKey: [
				asked(API_PROVIDERS.openAlex, 'https://api.openalex.org/works?filter=doi:10.2307/1913610', undefined),
				asked(API_PROVIDERS.semanticScholar, 'https://api.semanticscholar.org/graph/v1/paper/DOI:10.2307/1913610', undefined),
				asked(paid, 'https://paid.example/works', undefined),
			],
			withKey: [
				asked(API_PROVIDERS.openAlex, 'https://api.openalex.org/works?filter=doi:10.2307/1913610', 'a b'),
				asked(API_PROVIDERS.openAlex, 'https://api.openalex.org/works/W1', 'k'),
				asked(API_PROVIDERS.semanticScholar, 'https://api.semanticscholar.org/graph/v1/paper/DOI:10.2307/1913610', 'k'),
				asked(paid, 'https://paid.example/works', 'k'),
			],
		}, {
			withoutKey: [
				{ url: 'https://api.openalex.org/works?filter=doi:10.2307/1913610', headers: { 'User-Agent': 'Pollis' } },
				{ url: 'https://api.semanticscholar.org/graph/v1/paper/DOI:10.2307/1913610', headers: { 'User-Agent': 'Pollis' } },
				undefined,
			],
			withKey: [
				{ url: 'https://api.openalex.org/works?filter=doi:10.2307/1913610&api_key=a%20b', headers: { 'User-Agent': 'Pollis' } },
				{ url: 'https://api.openalex.org/works/W1?api_key=k', headers: { 'User-Agent': 'Pollis' } },
				{ url: 'https://api.semanticscholar.org/graph/v1/paper/DOI:10.2307/1913610', headers: { 'User-Agent': 'Pollis', 'x-api-key': 'k' } },
				{ url: 'https://paid.example/works', headers: { 'User-Agent': 'Pollis', 'x-api-key': 'k' } },
			],
		});
	});
});
