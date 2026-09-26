/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IEnvironmentVariableService } from '../../terminal/common/environmentVariable.js';
import { EnvironmentVariableMutatorType, IEnvironmentVariableMutator } from '../../../../platform/terminal/common/environmentVariable.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { POLLIS_CREDENTIAL_FIELDS } from './common/credentials.js';

/**
 * Read the currently-stored credentials as a plain `{ envVar: value }` map (only fields that have a
 * value). Used both to build the terminal env-var collection and by the `pollis.credentialEnv`
 * command below.
 */
async function readCredentialEnv(secretStorageService: ISecretStorageService): Promise<Record<string, string>> {
	const env: Record<string, string> = {};
	for (const field of POLLIS_CREDENTIAL_FIELDS) {
		const value = await secretStorageService.get(field.secretKey);
		if (value) { env[field.envVar] = value; }
	}
	return env;
}

/**
 * Mirrors the credentials stored in VS Code Secret Storage (the SEC contact and the FRED / Alpha
 * Vantage / Hugging Face / Kaggle keys) into the terminal/process environment, so any Julia REPL,
 * editor-run, or terminal command launched from Pollis picks them up at process creation — without
 * opening a webview and without the values ever being written to a file.
 *
 * The collection is registered as NON-persistent, so the secret values are never serialized to
 * storage; they are re-read from Secret Storage on each session and refreshed whenever one changes.
 */
class PollisCredentialEnvironment extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'pollis.credentialEnvironment';

	/** Identifier under which our merged collection is registered with the terminal env service. */
	private static readonly COLLECTION_ID = 'pollis.credentials';

	constructor(
		@ISecretStorageService private readonly secretStorageService: ISecretStorageService,
		@IEnvironmentVariableService private readonly environmentVariableService: IEnvironmentVariableService,
	) {
		super();
		void this.apply();
		// Re-apply whenever one of our own secrets is set, changed, or cleared.
		this._register(this.secretStorageService.onDidChangeSecret(secretKey => {
			if (POLLIS_CREDENTIAL_FIELDS.some(f => f.secretKey === secretKey)) {
				void this.apply();
			}
		}));
	}

	private async apply(): Promise<void> {
		const env = await readCredentialEnv(this.secretStorageService);
		const map = new Map<string, IEnvironmentVariableMutator>();
		for (const [variable, value] of Object.entries(env)) {
			map.set(variable, {
				variable,
				value,
				type: EnvironmentVariableMutatorType.Replace,
				options: { applyAtProcessCreation: true, applyAtShellIntegration: true },
			});
		}
		// No `persistent` flag: the service only serializes collections marked persistent, so the secret
		// values are kept in memory only and never written to storage.
		this.environmentVariableService.set(PollisCredentialEnvironment.COLLECTION_ID, { map });
	}
}

registerWorkbenchContribution2(PollisCredentialEnvironment.ID, PollisCredentialEnvironment, WorkbenchPhase.AfterRestored);

// Exposes the stored credentials as a `{ envVar: value }` map to first-party extensions. The bundled
// Julia extension calls this to inject the credentials into a notebook kernel it spawns, since kernel
// processes do not inherit the terminal env-var collection. Values are returned in memory, never via a file.
CommandsRegistry.registerCommand('pollis.credentialEnv', (accessor: ServicesAccessor) =>
	readCredentialEnv(accessor.get(ISecretStorageService)));
