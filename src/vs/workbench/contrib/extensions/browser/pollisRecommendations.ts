/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ExtensionRecommendations, ExtensionRecommendation } from './extensionRecommendations.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ExtensionRecommendationReason } from '../../../services/extensionRecommendations/common/extensionRecommendations.js';
import { localize } from '../../../../nls.js';

/**
 * The extensions Pollis recommends, listed in product.json under `pollisExtensionTips`.
 * They only fill the Recommended section of the Extensions view: unlike file-based or
 * workspace recommendations, they never prompt the user to install anything.
 */
export class PollisRecommendations extends ExtensionRecommendations {

	private _recommendations: ExtensionRecommendation[] = [];
	get recommendations(): ReadonlyArray<ExtensionRecommendation> { return this._recommendations; }

	constructor(
		@IProductService private readonly productService: IProductService,
	) {
		super();
	}

	protected async doActivate(): Promise<void> {
		const tips = this.productService.pollisExtensionTips;
		if (Array.isArray(tips)) {
			this._recommendations = tips.map((extensionId): ExtensionRecommendation => ({
				extension: extensionId.toLowerCase(),
				reason: {
					reasonId: ExtensionRecommendationReason.Application,
					reasonText: localize('pollisReason', "This extension is recommended for {0}", this.productService.nameLong)
				}
			}));
		}
	}
}
