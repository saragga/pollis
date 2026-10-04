/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RunOnceScheduler } from '../../../../base/common/async.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { IDatabaseConnectionsService, IDatabaseSession } from '../common/databaseConnections.js';
import { BUILTIN_DATABASE_ID, DatabaseConnectionTarget, IDatabaseConnectionProfile } from '../common/databaseDrivers.js';

const STORAGE_KEY = 'pollis.databases.connections';

function storageScope(target: DatabaseConnectionTarget): StorageScope.PROFILE | StorageScope.WORKSPACE {
	return target === 'global' ? StorageScope.PROFILE : StorageScope.WORKSPACE;
}

/**
 * Keeps the connection profiles as JSON arrays in profile storage (global) and workspace storage,
 * lists the built-in Pollis database before them, and follows the REPL connections through the snapshots PollisDB writes to
 * ~/.pollis/databases/sessions/<profile id>.json.
 */
export class DatabaseConnectionsService extends Disposable implements IDatabaseConnectionsService {

	declare readonly _serviceBrand: undefined;

	private readonly _onDidChangeConnections = this._register(new Emitter<void>());
	readonly onDidChangeConnections = this._onDidChangeConnections.event;

	private readonly sessionsFolder: URI;
	private readonly builtin: IDatabaseConnectionProfile;
	private sessions = new Map<string, IDatabaseSession>();
	private readonly sessionsScheduler = this._register(new RunOnceScheduler(() => this.readSessions(), 100));

	constructor(
		@IStorageService private readonly storageService: IStorageService,
		@IFileService private readonly fileService: IFileService,
		@IPathService pathService: IPathService,
		@ILogService private readonly logService: ILogService,
	) {
		super();
		// Profile storage is shared between windows, so pick up profiles saved in another window.
		const listeners = this._register(new DisposableStore());
		this._register(this.storageService.onDidChangeValue(StorageScope.PROFILE, STORAGE_KEY, listeners)(() => this._onDidChangeConnections.fire()));

		// Julia runs on this machine, so the snapshots live in the local home folder.
		const pollisFolder = joinPath(pathService.userHome({ preferLocal: true }), '.pollis');
		this.sessionsFolder = joinPath(pollisFolder, 'databases', 'sessions');
		// In memory: PollisDB.seed fills it with the PollisDatasets each time it connects.
		this.builtin = {
			id: BUILTIN_DATABASE_ID,
			name: 'PollisDatasets',
			driver: 'duckdb',
			target: 'global',
			variable: 'pollis',
			options: { path: ':memory:', readonly: false },
			builtin: true,
		};
		void this.watchSessions();
	}

	getConnections(): readonly IDatabaseConnectionProfile[] {
		const byName = (a: IDatabaseConnectionProfile, b: IDatabaseConnectionProfile) => a.name.localeCompare(b.name);
		return [this.builtin, ...this.read('global').sort(byName), ...this.read('workspace').sort(byName)];
	}

	getConnection(id: string): IDatabaseConnectionProfile | undefined {
		return this.getConnections().find(c => c.id === id);
	}

	saveConnection(profile: IDatabaseConnectionProfile): void {
		if (profile.id === BUILTIN_DATABASE_ID) {
			return;
		}
		for (const target of ['global', 'workspace'] as const) {
			const others = this.read(target).filter(c => c.id !== profile.id);
			this.write(target, target === profile.target ? [...others, profile] : others);
		}
		this._onDidChangeConnections.fire();
	}

	deleteConnection(id: string): void {
		if (id === BUILTIN_DATABASE_ID) {
			return;
		}
		for (const target of ['global', 'workspace'] as const) {
			this.write(target, this.read(target).filter(c => c.id !== id));
		}
		this._onDidChangeConnections.fire();
	}

	getSession(id: string): IDatabaseSession | undefined {
		return this.sessions.get(id);
	}

	getSessions(): readonly IDatabaseSession[] {
		return [...this.sessions.values()];
	}

	private async watchSessions(): Promise<void> {
		try {
			await this.fileService.createFolder(this.sessionsFolder);
		} catch {
			// Already there.
		}
		this._register(this.fileService.createWatcher(this.sessionsFolder, { recursive: false, excludes: [] }).onDidChange(() => this.sessionsScheduler.schedule()));
		await this.readSessions();
	}

	private async readSessions(): Promise<void> {
		const sessions = new Map<string, IDatabaseSession>();
		try {
			const folder = await this.fileService.resolve(this.sessionsFolder);
			for (const child of folder.children ?? []) {
				if (!child.isFile || !child.name.endsWith('.json')) {
					continue;
				}
				try {
					const session: IDatabaseSession = JSON.parse((await this.fileService.readFile(child.resource)).value.toString());
					sessions.set(session.id, session);
				} catch (error) {
					this.logService.warn(`[Databases] Could not read the session snapshot ${child.resource.fsPath}: ${error}`);
				}
			}
		} catch {
			// No sessions folder yet.
		}
		this.sessions = sessions;
		this._onDidChangeConnections.fire();
	}

	private read(target: DatabaseConnectionTarget): IDatabaseConnectionProfile[] {
		const raw = this.storageService.get(STORAGE_KEY, storageScope(target));
		if (!raw) {
			return [];
		}
		try {
			const parsed: IDatabaseConnectionProfile[] = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed.filter(c => c.id !== BUILTIN_DATABASE_ID).map(c => ({ ...c, target })) : [];
		} catch {
			return [];
		}
	}

	private write(target: DatabaseConnectionTarget, profiles: IDatabaseConnectionProfile[]): void {
		const scope = storageScope(target);
		if (profiles.length) {
			this.storageService.store(STORAGE_KEY, JSON.stringify(profiles), scope, StorageTarget.USER);
		} else {
			this.storageService.remove(STORAGE_KEY, scope);
		}
	}
}
