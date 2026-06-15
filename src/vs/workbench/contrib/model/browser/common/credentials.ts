/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

/**
 * Single source of truth for the credentials Pollis stores in VS Code Secret Storage and the Julia
 * environment variable that each corresponding package reads.
 *
 * - The per-webview API-key wiring references these pairs (adding its own prompt / label / mask) when
 *   building each provider's fields, so a `secretKey`/`envVar` is declared in exactly one place.
 * - The startup injector (`credentialEnvironment.contribution.ts`) iterates {@link POLLIS_CREDENTIAL_FIELDS}
 *   to mirror the stored secrets into the terminal/process environment, so a Julia REPL, editor-run,
 *   or terminal command picks them up at process creation — without opening any webview and without
 *   the values ever landing in a file.
 */
export interface IPollisCredentialField {
	/** Secret Storage key, e.g. `pollis.apiKey.fred`. */
	readonly secretKey: string;
	/** Julia environment variable the package reads, e.g. `FRED_API_KEY`. */
	readonly envVar: string;
}

/** Named credential fields, referenced by the individual webview handlers. */
export const CREDENTIALS = {
	secUserAgent: { secretKey: 'pollis.secUserAgent', envVar: 'SEC_USER_AGENT' },
	fred: { secretKey: 'pollis.apiKey.fred', envVar: 'FRED_API_KEY' },
	alphaVantage: { secretKey: 'pollis.apiKey.alphavantage', envVar: 'ALPHA_VANTAGE_API_KEY' },
	huggingFace: { secretKey: 'pollis.apiKey.huggingface', envVar: 'HUGGING_FACE_HUB_TOKEN' },
	kaggleUsername: { secretKey: 'pollis.apiKey.kaggle.username', envVar: 'KAGGLE_USERNAME' },
	kaggleKey: { secretKey: 'pollis.apiKey.kaggle.key', envVar: 'KAGGLE_KEY' },
} satisfies Record<string, IPollisCredentialField>;

/** Every credential field, for the startup environment injector. */
export const POLLIS_CREDENTIAL_FIELDS: readonly IPollisCredentialField[] = Object.values(CREDENTIALS);
