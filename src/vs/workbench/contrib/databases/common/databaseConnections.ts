/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../../base/common/event.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IDatabaseConnectionProfile } from './databaseDrivers.js';

export const IDatabaseConnectionsService = createDecorator<IDatabaseConnectionsService>('databaseConnectionsService');

export interface IDatabaseColumn {
	readonly name: string;
	readonly type: string;
	/** What the column holds, e.g. the description of a PollisDatasets column. */
	readonly comment?: string;
}

export interface IDatabaseTable {
	readonly name: string;
	readonly kind: 'table' | 'view';
	readonly columns: readonly IDatabaseColumn[];
	/** What the table holds, e.g. the title, description and source of a PollisDatasets dataset. */
	readonly comment?: string;
}

export interface IDatabaseSchema {
	readonly name: string;
	readonly tables: readonly IDatabaseTable[];
}

/**
 * A connection that is open in the Julia REPL, as described by the snapshot the PollisDB module
 * writes (see extensions/language-julia/scripts/terminalserver/PollisDB.jl).
 */
export interface IDatabaseSession {
	/** The id of the connection profile, or a `repl-` id for a connection shown with `PollisDB.show`. */
	readonly id: string;
	readonly name: string;
	/** The package that opened the connection: `DuckDB`, `SQLite` or `LibPQ`. */
	readonly engine: string;
	/** When the schemas were last read, as an ISO date-time in the REPL's local time. */
	readonly updated: string;
	readonly schemas: readonly IDatabaseSchema[];
	/** Why the schemas could not be read, if they could not. */
	readonly error?: string;
}

/**
 * The saved database connection profiles, shown in the Connections view, and the connections the
 * Julia REPL currently holds for them. Global profiles are kept per user profile, workspace
 * profiles with the current workspace.
 */
export interface IDatabaseConnectionsService {
	readonly _serviceBrand: undefined;

	/** Fires when a profile is saved or deleted, or a REPL session connects, disconnects or refreshes. */
	readonly onDidChangeConnections: Event<void>;

	/** The built-in Pollis database, then every saved profile, global ones first, each group sorted by name. */
	getConnections(): readonly IDatabaseConnectionProfile[];

	getConnection(id: string): IDatabaseConnectionProfile | undefined;

	/** Add `profile`, or replace the profile with the same id (moving it if its target changed). The built-in database is never saved. */
	saveConnection(profile: IDatabaseConnectionProfile): void;

	deleteConnection(id: string): void;

	/** The open REPL connection `id`, of a profile or shown with `PollisDB.show`, if there is one. */
	getSession(id: string): IDatabaseSession | undefined;

	/** Every open REPL connection. */
	getSessions(): readonly IDatabaseSession[];
}
