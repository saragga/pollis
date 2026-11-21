/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { VSBuffer } from '../../../../../base/common/buffer.js';
import { URI } from '../../../../../base/common/uri.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { FileService } from '../../../../../platform/files/common/fileService.js';
import { InMemoryFileSystemProvider } from '../../../../../platform/files/common/inMemoryFilesystemProvider.js';
import { NullLogService } from '../../../../../platform/log/common/log.js';
import { savedStatuses, saveDataset } from '../../browser/forecastingWorkspace.js';

suite('Forecasting workspace', () => {

	const disposables = ensureNoDisposablesAreLeakedInTestSuite();

	test('a saved dataset is saved, then changed when a file is edited, added or removed', async () => {
		const fileService = disposables.add(new FileService(new NullLogService()));
		disposables.add(fileService.registerProvider('mem', disposables.add(new InMemoryFileSystemProvider())));
		const source = URI.parse('mem:/competitions/nn5');
		const folder = URI.parse('mem:/workspace/data/forecasting');
		await fileService.writeFile(URI.joinPath(source, 'info.toml'), VSBuffer.fromString('name = "NN5"\n'));
		await fileService.writeFile(URI.joinPath(source, 'observations.parquet'), VSBuffer.fromString('abc'));
		await fileService.writeFile(URI.joinPath(source, 'forecasts', 'naive.parquet'), VSBuffer.fromString('left out'));
		for (const id of ['edited', 'added', 'removed', 'untouched']) {
			await saveDataset(fileService, folder, id, source, 'PollisCompetitions.jl (nn5)');
		}
		const before = await savedStatuses(fileService, folder);
		await new Promise(resolve => setTimeout(resolve, 5));
		// The same size, other bytes, a later time
		await fileService.writeFile(URI.joinPath(folder, 'edited', 'observations.parquet'), VSBuffer.fromString('abd'));
		await fileService.writeFile(URI.joinPath(folder, 'added', 'notes.txt'), VSBuffer.fromString('mine'));
		await fileService.del(URI.joinPath(folder, 'removed', 'info.toml'));
		const after = await savedStatuses(fileService, folder);
		const copied = await fileService.exists(URI.joinPath(folder, 'untouched', 'forecasts'));
		assert.deepStrictEqual({ before, after, copied }, {
			before: { edited: 'saved', added: 'saved', removed: 'saved', untouched: 'saved' },
			after: { edited: 'changed', added: 'changed', removed: 'changed', untouched: 'saved' },
			copied: false,
		});
	});
});
