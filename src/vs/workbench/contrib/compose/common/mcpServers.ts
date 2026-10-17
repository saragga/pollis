/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';

/** The command that opens Compose > MCP Servers; given a server's name, the page scrolls to it. */
export const MCP_SERVERS_COMMAND_ID = 'pollis.mcpServers';

/** Where uv, which runs the local servers, is installed from. */
export const UV_INSTALL_URL = 'https://docs.astral.sh/uv/getting-started/installation/';

/** An MCP server of the library: a remote one, with `url`, or a local one, with `command`. */
export interface IMcpServer {
	/** The name it is added under in each agent. */
	readonly name: string;
	readonly label: string;
	/** Who makes it, and its licence. */
	readonly provider: string;
	readonly description: string;
	/** Run by its provider: its endpoint, over Streamable HTTP. */
	readonly url?: string;
	/** Run on the user's computer: its command line and environment. */
	readonly command?: readonly string[];
	readonly env?: Readonly<Record<string, string>>;
	readonly tools: readonly string[];
	/** Whether the agent signs in to it (OAuth) when it is added. */
	readonly signIn: boolean;
	/** What using it takes: an account, a program. */
	readonly requires: string;
	/** Its page, with its source or terms. */
	readonly page: string;
}

/** What a local server run with uvx takes. */
const UV_REQUIRES = localize('mcpServers.uvRequires', "uv, which runs the server and fetches Python when needed.");

/** The library, in the order the page and the Extensions pane list it. */
export const MCP_SERVERS: readonly IMcpServer[] = [
	{
		name: 'fred',
		label: 'FRED',
		provider: localize('mcpServers.fredProvider', "Federal Reserve Bank of St. Louis"),
		description: localize('mcpServers.fredDescription', "Economic time series from FRED, free: search them, read their notes and fetch their observations."),
		url: 'https://mcp.stlouisfed.org',
		tools: [
			localize('mcpServers.fredSearch', "Search for series"),
			localize('mcpServers.fredMetadata', "Metadata and methodology notes"),
			localize('mcpServers.fredObservations', "Observations, with date ranges and transformations"),
			localize('mcpServers.fredDownload', "CSV or JSON download links"),
			localize('mcpServers.fredGraphs', "FRED graphs of up to five series"),
		],
		signIn: true,
		requires: localize('mcpServers.fredRequires', "A free FRED MCP Connector account, separate from a FRED account, created when you first sign in. No FRED API key is needed."),
		page: 'https://fred.stlouisfed.org/help/data/connecting-fred-to-ai-services/FRED-MCP-Connector',
	},
	{
		name: 'huggingface',
		label: 'Hugging Face',
		provider: localize('mcpServers.huggingFaceProvider', "Hugging Face, MIT"),
		description: localize('mcpServers.huggingFaceDescription', "The Hugging Face Hub: find models, datasets and Spaces, and read their details and files."),
		url: 'https://huggingface.co/mcp',
		tools: [
			localize('mcpServers.huggingFaceSearch', "Search models, datasets and Spaces"),
			localize('mcpServers.huggingFaceDetails', "Details of a model, dataset or Space"),
			localize('mcpServers.huggingFaceFiles', "Browse the files of the Hub's models, datasets, Spaces, collections and papers"),
		],
		signIn: false,
		requires: localize('mcpServers.huggingFaceRequires', "Nothing: it is used without an account."),
		page: 'https://github.com/huggingface/hf-mcp-server',
	},
	{
		name: 'duckdb',
		label: 'DuckDB',
		provider: localize('mcpServers.duckDbProvider', "MotherDuck, MIT"),
		description: localize('mcpServers.duckDbDescription', "SQL with DuckDB on your computer, in an in-memory database: query CSV, Parquet and JSON files. It can read and write files on your computer."),
		command: ['uvx', 'mcp-server-motherduck', '--db-path', ':memory:', '--read-write', '--allow-switch-databases'],
		tools: [
			localize('mcpServers.duckDbQuery', "Run SQL queries, up to 1,024 rows per result"),
			localize('mcpServers.duckDbList', "List the databases, tables and columns"),
			localize('mcpServers.duckDbSwitch', "Switch to a database file"),
		],
		signIn: false,
		requires: UV_REQUIRES,
		page: 'https://github.com/motherduckdb/mcp-server-motherduck',
	},
	{
		name: 'arxiv',
		label: 'arXiv',
		provider: localize('mcpServers.arxivProvider', "Community server, Apache-2.0"),
		description: localize('mcpServers.arxivDescription', "Papers on arXiv: search them, download them and read them. Downloaded papers are kept in the .arxiv-mcp-server folder of your home folder."),
		command: ['uvx', 'arxiv-mcp-server'],
		tools: [
			localize('mcpServers.arxivSearch', "Search papers"),
			localize('mcpServers.arxivDownload', "Download a paper"),
			localize('mcpServers.arxivRead', "List and read the downloaded papers, whole or by section"),
		],
		signIn: false,
		requires: UV_REQUIRES,
		page: 'https://github.com/blazickjp/arxiv-mcp-server',
	},
	{
		name: 'zotero',
		label: 'Zotero',
		provider: localize('mcpServers.zoteroProvider', "Community server, MIT"),
		description: localize('mcpServers.zoteroDescription', "Your Zotero library, read only: search it and read your references, their BibTeX and their full text."),
		command: ['uvx', '--from', 'zotero-mcp-server', 'zotero-mcp'],
		env: { ZOTERO_LOCAL: 'true' },
		tools: [
			localize('mcpServers.zoteroSearch', "Search by title, author, tag, collection or full text"),
			localize('mcpServers.zoteroRead', "Metadata, BibTeX and full text of a reference"),
		],
		signIn: false,
		requires: localize('mcpServers.zoteroRequires', "uv, and Zotero 7 or later open on this computer, with \"Allow other applications on this computer to communicate with Zotero\" ticked in Zotero's Settings > Advanced."),
		page: 'https://github.com/54yyyu/zotero-mcp',
	},
];

/** A word of a command line, quoted for the shell when it has characters the shell would read. */
export function shellWord(word: string): string {
	return /^[\w@%+=:,./-]+$/.test(word) ? word : `'${word.replace(/'/g, `'\\''`)}'`;
}

/** The command line of a local server, with its environment, as shown on the page. */
export function commandLine(server: IMcpServer): string {
	const env = Object.entries(server.env ?? {}).map(([key, value]) => `${key}=${shellWord(value)}`);
	return [...env, ...(server.command ?? []).map(shellWord)].join(' ');
}
