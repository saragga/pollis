/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { parseToml } from '../../model/browser/common/tomlPanelData.js';
import { ASK_POLLIS_STRATEGIES, askStrategyOfFile, IAskPollisStrategiesService, IAskPollisStrategy, IAskStrategyProblem } from '../common/askPollisStrategies.js';
import { askFolder } from './compareShared.js';

/**
 * The answering strategies: Pollis' own, then those of the TOML files of ~/.pollis/ask/strategies/, read again when one
 * is added, changed or removed. A file that is not a strategy is left out, with its problems kept for the page that
 * lists the strategies and written to the log.
 */
class AskPollisStrategiesService extends Disposable implements IAskPollisStrategiesService {

	declare readonly _serviceBrand: undefined;

	private readonly _onDidChange = this._register(new Emitter<void>());
	readonly onDidChange = this._onDidChange.event;

	readonly loaded: Promise<void>;

	private strategies: readonly IAskPollisStrategy[] = ASK_POLLIS_STRATEGIES;
	private problems: readonly IAskStrategyProblem[] = [];
	private readonly watcher = this._register(new MutableDisposable());
	private readonly reload = this._register(new RunOnceScheduler(() => this.read(), 300));

	constructor(
		@IFileService private readonly fileService: IFileService,
		@IPathService private readonly pathService: IPathService,
		@ILogService private readonly logService: ILogService,
	) {
		super();
		this.loaded = this.start();
	}

	getStrategies(): readonly IAskPollisStrategy[] {
		return this.strategies;
	}

	getProblems(): readonly IAskStrategyProblem[] {
		return this.problems;
	}

	/** Makes the folder when there is none, so that it can be watched, and reads it. */
	private async start(): Promise<void> {
		try {
			const folder = await this.folder();
			await this.fileService.createFolder(folder);
			const watcher = this.fileService.createWatcher(folder, { recursive: false, excludes: [] });
			this.watcher.value = watcher;
			this._register(watcher.onDidChange(() => this.reload.schedule()));
		} catch (error) {
			this.logService.error('Ask Pollis: cannot watch the folder of the answering strategies', error);
		}
		await this.read();
	}

	async folder(): Promise<URI> {
		return joinPath(await askFolder(this.pathService), 'strategies');
	}

	private async read(): Promise<void> {
		const strategies: IAskPollisStrategy[] = [];
		const problems: IAskStrategyProblem[] = [];
		try {
			const folder = await this.fileService.resolve(await this.folder());
			const files = (folder.children ?? []).filter(child => !child.isDirectory && child.name.endsWith('.toml')).sort((a, b) => a.name.localeCompare(b.name));
			const taken = new Set(ASK_POLLIS_STRATEGIES.map(strategy => strategy.id));
			for (const file of files) {
				let found: ReturnType<typeof askStrategyOfFile>;
				try {
					found = askStrategyOfFile(parseToml((await this.fileService.readFile(file.resource)).value.toString()), file.resource.fsPath, taken);
				} catch (error) {
					found = { problems: [localize('askStrategy.unreadable', "Pollis cannot read it: {0}", error instanceof Error ? error.message : String(error))] };
				}
				if (found.strategy) {
					strategies.push(found.strategy);
					taken.add(found.strategy.id);
				} else {
					problems.push({ file: file.resource.fsPath, problems: found.problems });
					this.logService.warn(`Ask Pollis: ${file.resource.fsPath} is not an answering strategy: ${found.problems.join(' ')}`);
				}
			}
		} catch {
			// No folder: Pollis' own strategies only
		}
		this.strategies = [...ASK_POLLIS_STRATEGIES, ...strategies.sort((a, b) => a.label.localeCompare(b.label))];
		this.problems = problems;
		this._onDidChange.fire();
	}
}

registerSingleton(IAskPollisStrategiesService, AskPollisStrategiesService, InstantiationType.Delayed);
