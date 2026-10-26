/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { timeout } from '../../../../../base/common/async.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { hasKey } from '../../../../../base/common/types.js';
import { IRequestContext, IRequestOptions } from '../../../../../base/parts/request/common/request.js';
import { IRequestService } from '../../../../../platform/request/common/request.js';
import { ISecretStorageService } from '../../../../../platform/secrets/common/secrets.js';
import { CREDENTIALS, IPollisCredentialField } from './credentials.js';

// The services Pollis asks for data, each asked one way: with the user's key when one is set, and without it when the
// service answers without one; a paid service, which does not, is not asked at all until the user sets a key.

/** A service Pollis asks for data, and how. */
export interface IApiProvider {
	readonly name: string;
	/** Where the user's key is kept. */
	readonly credential: IPollisCredentialField;
	/** Where the service gives a key. */
	readonly keyPage: string;
	/** Whether it answers only with a key, as a paid service does: without one, nothing is asked. */
	readonly keyRequired: boolean;
	/** How the key goes with a request: a parameter of the address, or a header. */
	readonly sendKey: { readonly parameter: string } | { readonly header: string };
	/** How many times a request is asked while the service asks to wait, 2, 4, 8... seconds apart. */
	readonly attempts: number;
}

export const API_PROVIDERS = {
	// OpenAlex asks to wait when the day's budget is used up: asking again the same day does not help
	openAlex: {
		name: 'OpenAlex', credential: CREDENTIALS.openAlex, keyPage: 'https://openalex.org/settings/api',
		keyRequired: false, sendKey: { parameter: 'api_key' }, attempts: 1,
	},
	// Semantic Scholar asks to wait when its pool, shared by everyone without a key, or the key's own rate is busy
	semanticScholar: {
		name: 'Semantic Scholar', credential: CREDENTIALS.semanticScholar, keyPage: 'https://www.semanticscholar.org/product/api#api-key-form',
		keyRequired: false, sendKey: { header: 'x-api-key' }, attempts: 2,
	},
} satisfies Record<string, IApiProvider>;

/** The request `options` to `provider`, with `key` if any; undefined when the provider answers only with a key and there is none. */
export function providerRequest(provider: IApiProvider, options: IRequestOptions, key: string | undefined): IRequestOptions | undefined {
	if (!key) {
		return provider.keyRequired ? undefined : options;
	}
	if (hasKey(provider.sendKey, { header: true })) {
		return { ...options, headers: { ...options.headers, [provider.sendKey.header]: key } };
	}
	const url = options.url ?? '';
	return { ...options, url: `${url}${url.includes('?') ? '&' : '?'}${provider.sendKey.parameter}=${encodeURIComponent(key)}` };
}

/** A request to a provider: GET, or POST of the JSON `data`. */
export interface IProviderRequest {
	readonly url: string;
	readonly data?: string;
	/** How many times it is asked while the provider asks to wait; the provider's own number when not given. */
	readonly attempts?: number;
	/** Whether the answer is no longer wanted: no attempt is made after it is. */
	readonly abandoned?: () => boolean;
}

/** The requests of a page, or a service, to the providers. */
export class ProviderRequests {

	constructor(
		private readonly requestService: IRequestService,
		private readonly secretStorageService: ISecretStorageService,
		private readonly callSite: string,
	) { }

	/** The user's key for `provider`, if any. */
	key(provider: IApiProvider): Promise<string | undefined> {
		return this.secretStorageService.get(provider.credential.secretKey);
	}

	/**
	 * The answer of `provider` to `request`, asked again while it asks to wait; its last answer when it still does.
	 * Undefined when it could not be reached, the answer was abandoned, or it answers only with a key and none is set.
	 */
	async ask(provider: IApiProvider, request: IProviderRequest): Promise<IRequestContext | undefined> {
		const options = providerRequest(provider, {
			type: request.data ? 'POST' : 'GET',
			url: request.url,
			data: request.data,
			headers: request.data ? { 'Content-Type': 'application/json' } : {},
			timeout: 30000,
			callSite: this.callSite,
		}, await this.key(provider));
		if (!options) {
			return undefined;
		}
		const attempts = request.attempts ?? provider.attempts;
		let waiting: IRequestContext | undefined;
		for (let attempt = 1; attempt <= attempts; attempt++) {
			try {
				const context = await this.requestService.request(options, CancellationToken.None);
				if (context.res.statusCode !== 429) {
					return context;
				}
				waiting = context;
			} catch {
				// An answer asking to wait may lack the header that lets it be read: the request fails as if not reached
				waiting = undefined;
			}
			if (attempt < attempts) {
				await timeout(1000 * 2 ** attempt);
				if (request.abandoned?.()) {
					return undefined;
				}
			}
		}
		return waiting;
	}
}
