/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IScaffoldPanel } from './scaffold.command.js';
import { CREDENTIALS } from '../common/credentials.js';
import { EDGAR_METADATA } from '../webviews/edgar.data.js';
import { getEdgarHtml } from '../webviews/edgar.template.js';

export const EDGAR_PANEL: IScaffoldPanel = {
	id: 'edgar',
	viewType: 'pollis.edgar',
	title: 'US SEC EDGAR',
	data: EDGAR_METADATA.edgar,
	html: () => getEdgarHtml(EDGAR_METADATA),
	// EDGAR needs no API key, but the SEC requires a User-Agent (your name + contact email) on every
	// request. We reuse the credential wiring to capture it once (non-masked, noun "contact") and inject
	// it into the Julia REPL session as ENV["SEC_USER_AGENT"]; generated code reads that env var.
	apiKey: { label: 'SEC EDGAR', noun: 'contact', fields: [{ ...CREDENTIALS.secUserAgent, prompt: 'SEC contact: your name and email (e.g. Jane Doe jane@example.com)', password: false }] },
};
