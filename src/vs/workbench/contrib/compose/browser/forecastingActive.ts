/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The active datasets: those the user ticks in the column Active of Manage Competition Datasets
// (forecastingCataloguePage.ts), which Score Models (forecastingCompetitionsPage.ts) lists in its step 1.

import { DisposableStore, IDisposable } from '../../../../base/common/lifecycle.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';

/** The command that opens Manage Competition Datasets, where the active datasets are ticked. */
export const FORECASTING_CATALOGUE_COMMAND_ID = 'pollis.competitions.forecastingCatalogue';

const ACTIVE_KEY = 'pollis.manageCompetitionDatasets.active';

/** The active datasets: the ids of their entries in the catalogue, and of those that Score Models scores, the ids it knows them by. */
export interface IActiveDatasets {
	readonly entries: readonly string[];
	readonly scored: readonly string[];
}

function strings(value: unknown): string[] {
	return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/** The active datasets as last stored; none when nothing is stored. */
export function activeDatasets(storageService: IStorageService): IActiveDatasets {
	try {
		const stored: unknown = JSON.parse(storageService.get(ACTIVE_KEY, StorageScope.PROFILE, '[]'));
		if (Array.isArray(stored)) {
			// As stored before the ids that Score Models knows were kept beside the entries': mostly the same
			return { entries: strings(stored), scored: strings(stored) };
		}
		const { entries, scored } = typeof stored === 'object' && stored !== null ? stored as { entries?: unknown; scored?: unknown } : {};
		return { entries: strings(entries), scored: strings(scored) };
	} catch {
		return { entries: [], scored: [] };
	}
}

/** Stores the active datasets, kept for the next time either page opens. */
export function setActiveDatasets(storageService: IStorageService, active: IActiveDatasets): void {
	storageService.store(ACTIVE_KEY, JSON.stringify({ entries: active.entries, scored: active.scored }), StorageScope.PROFILE, StorageTarget.USER);
}

/** Calls `listener` whenever the active datasets change, in this window or another. */
export function onDidChangeActiveDatasets(storageService: IStorageService, listener: () => void): IDisposable {
	const store = new DisposableStore();
	store.add(storageService.onDidChangeValue(StorageScope.PROFILE, ACTIVE_KEY, store)(() => listener()));
	return store;
}
