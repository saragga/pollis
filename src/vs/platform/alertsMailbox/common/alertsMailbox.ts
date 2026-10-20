/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Pollis: the alerts mailbox, the user's own email address that the alerts of Google Scholar, JSTOR, HeinOnline and
// other sources are sent to. The main process reads it over IMAP (../node/alertsMailboxService.ts), read only, and
// returns the articles of each alert email; the RSS Feeds make a feed of each alert. Nothing passes through Pollis.

export const ALERTS_MAILBOX_CHANNEL = 'alertsMailbox';

/** The sources whose alert emails Pollis reads. */
export type AlertSource = 'scholar' | 'jstor' | 'heinonline' | 'nexisuni' | 'ssrn' | 'semanticscholar' | 'webofscience' | 'scopus' | 'westlaw' | 'factiva';

/** The names of the sources, in the order they are listed. */
export const ALERT_SOURCES: Readonly<Record<AlertSource, string>> = {
	scholar: 'Google Scholar',
	jstor: 'JSTOR',
	heinonline: 'HeinOnline',
	nexisuni: 'Nexis Uni',
	ssrn: 'SSRN',
	semanticscholar: 'Semantic Scholar',
	webofscience: 'Web of Science',
	scopus: 'Scopus',
	westlaw: 'Westlaw',
	factiva: 'Factiva',
};

/** The mailbox: its IMAP server (with TLS), the user it is opened as, and the folder the alerts arrive in. */
export interface IAlertsMailbox {
	readonly server: string;
	readonly port: number;
	readonly user: string;
	readonly folder: string;
}

/** Where the last reading of a folder stopped: the folder's UIDVALIDITY and the last message's UID. */
export interface IAlertsMailboxPosition {
	readonly uidValidity: number;
	readonly lastUid: number;
}

/** An article of an alert email. */
export interface IAlertArticle {
	readonly title: string;
	readonly link: string;
	/** Authors and journal, as the email gives them; never a snippet of the article. */
	readonly summary: string;
}

/** An alert email: the alert it belongs to (told by its subject), when it arrived, and its articles. */
export interface IAlertEmail {
	readonly source: AlertSource;
	/** The source and the alert's name in lower case with hyphens. */
	readonly id: string;
	readonly name: string;
	/** Milliseconds since 1970. */
	readonly date: number;
	readonly articles: readonly IAlertArticle[];
}

export interface IAlertsMailboxService {
	/**
	 * The alert emails in `mailbox` that arrived after `position` (else those of the last year, the newest at most a
	 * few hundred), and the position to start from next time. Rejects with the server's message when the mailbox
	 * cannot be opened.
	 */
	read(mailbox: IAlertsMailbox, password: string, position: IAlertsMailboxPosition | undefined): Promise<{ readonly position: IAlertsMailboxPosition; readonly emails: readonly IAlertEmail[] }>;
}
