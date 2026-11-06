/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { generateReplTaskCode, IDatabaseConnectionProfile, isValidJuliaIdentifier, juliaString, sqlName } from './databaseDrivers.js';

// The queries of the Wharton Research Data Services (WRDS) page (databases/browser/wrdsPage.ts): the common datasets of
// its Choose Data step, the query of a table chosen in Browse, the Julia code of its Extract step, and the join of its
// Merge step. The common datasets follow the conventions of Tidy Finance (Scheuch, Voigt and Weiss) for CRSP in its new
// format, CIZ, the only one updated after December 2024 (crsp.msf_v2 and crsp.dsf_v2 with crsp.stksecurityinfohist), and
// for the CRSP-Compustat link, and the filters of Compustat that keep one row per firm and fiscal period. The tables of
// OptionMetrics and the IBES-CRSP link are those that WRDSMerger.jl and the R package wrds read.

/** The common datasets of the Choose Data step. */
export type WrdsDatasetId =
	| 'crspMonthly' | 'crspMonthlyGvkey' | 'crspDaily' | 'compustatAnnual' | 'compustatQuarterly' | 'ccmLinks'
	| 'optionPrices' | 'optionSecurities'
	| 'ibesAnnouncements' | 'keyDevelopments';

/** The identifiers that narrow a common dataset to some securities or firms. */
export type WrdsIdentifier = 'permno' | 'gvkey' | 'secid' | 'ibesTicker' | 'companyid';

/** The groups of the list of common datasets. */
export type WrdsDatasetGroup = 'stocks' | 'options' | 'events';

/** A common dataset: its query is made by {@link wrdsDatasetSql}. */
export interface IWrdsDataset {
	readonly id: WrdsDatasetId;
	readonly group: WrdsDatasetGroup;
	readonly label: string;
	readonly description: string;
	/** The Julia variable its data goes into by default. */
	readonly variable: string;
	/** The identifiers that narrow it to some securities or firms, if any. */
	readonly identifier?: WrdsIdentifier;
	/** Whether a date range narrows it. */
	readonly dated: boolean;
}

export const WRDS_DATASET_GROUPS: Record<WrdsDatasetGroup, string> = {
	stocks: localize('wrds.group.stocks', "CRSP and Compustat"),
	options: localize('wrds.group.options', "Options"),
	events: localize('wrds.group.events', "Announcements and Events"),
};

export const WRDS_DATASETS: readonly IWrdsDataset[] = [
	{
		id: 'crspMonthly',
		group: 'stocks',
		label: localize('wrds.crspMonthly', "CRSP Monthly Stock File"),
		description: localize('wrds.crspMonthly.description', "Monthly returns, prices and shares outstanding of US common stocks listed on the NYSE, NYSE American and Nasdaq, from crsp.msf_v2 and crsp.stksecurityinfohist."),
		variable: 'crsp_monthly',
		identifier: 'permno',
		dated: true,
	},
	{
		id: 'crspMonthlyGvkey',
		group: 'stocks',
		label: localize('wrds.crspMonthlyGvkey', "CRSP Monthly with GVKEY"),
		description: localize('wrds.crspMonthlyGvkey.description', "The CRSP Monthly Stock File with the GVKEY of the Compustat firm that the CRSP-Compustat link names for each stock in each month, empty where no link holds: the stock data that step 4, Merge, joins to Compustat."),
		variable: 'crsp_monthly_gvkey',
		identifier: 'permno',
		dated: true,
	},
	{
		id: 'crspDaily',
		group: 'stocks',
		label: localize('wrds.crspDaily', "CRSP Daily Stock File"),
		description: localize('wrds.crspDaily.description', "Daily returns and market capitalisation of the same US common stocks as the monthly file, from crsp.dsf_v2 and crsp.stksecurityinfohist: the returns of an event study. Narrow it by PERMNO and dates, as all stocks over many years make tens of millions of rows."),
		variable: 'crsp_daily',
		identifier: 'permno',
		dated: true,
	},
	{
		id: 'compustatAnnual',
		group: 'stocks',
		label: localize('wrds.compustatAnnual', "Compustat Annual Fundamentals"),
		description: localize('wrds.compustatAnnual.description', "Balance sheet, income and cash flow items by firm and fiscal year, from comp.funda, kept to one row per firm and year: industrial format, standard data, domestic population, consolidated statements."),
		variable: 'compustat_annual',
		identifier: 'gvkey',
		dated: true,
	},
	{
		id: 'compustatQuarterly',
		group: 'stocks',
		label: localize('wrds.compustatQuarterly', "Compustat Quarterly Fundamentals"),
		description: localize('wrds.compustatQuarterly.description', "Assets, equity, sales and net income by firm and fiscal quarter, with the date the quarter's earnings were reported (rdq), from comp.fundq, with the filters of the annual data."),
		variable: 'compustat_quarterly',
		identifier: 'gvkey',
		dated: true,
	},
	{
		id: 'ccmLinks',
		group: 'stocks',
		label: localize('wrds.ccmLinks', "CRSP-Compustat Link"),
		description: localize('wrds.ccmLinks.description', "The links between Compustat firms (GVKEY) and CRSP securities (PERMNO), with the dates each holds, from crsp.ccmxpf_lnkhist: links of types LU and LC, primary securities only."),
		variable: 'ccm_links',
		identifier: 'gvkey',
		dated: false,
	},
	{
		id: 'optionPrices',
		group: 'options',
		label: localize('wrds.optionPrices', "OptionMetrics Option Prices"),
		description: localize('wrds.optionPrices.description', "Daily best bid and offer, volume, open interest, implied volatility and delta of listed US options, by underlying security (SECID), expiry, call or put, and strike, from the tables of OptionMetrics, one per year (optionm.opprcd followed by the year), joined over the years of From and To. Narrow it by SECID: a year of all options is very large."),
		variable: 'option_prices',
		identifier: 'secid',
		dated: true,
	},
	{
		id: 'optionSecurities',
		group: 'options',
		label: localize('wrds.optionSecurities', "OptionMetrics Securities"),
		description: localize('wrds.optionSecurities.description', "The securities of OptionMetrics, each SECID with its CUSIP and the other names it has had since each effective date, from optionm_all.secnmd: where to find the SECID of a stock, and the CUSIP that links it to CRSP."),
		variable: 'option_securities',
		identifier: 'secid',
		dated: false,
	},
	{
		id: 'ibesAnnouncements',
		group: 'events',
		label: localize('wrds.ibesAnnouncements', "IBES Earnings Announcements"),
		description: localize('wrds.ibesAnnouncements.description', "The earnings per share that US firms announced, quarterly (QTR) and annual (ANN), with the date and time of each announcement, from ibes.actu_epsus, and the CRSP PERMNO that the IBES-CRSP link (wrdsapps_link_crsp_ibes.ibcrsphist) names for the IBES ticker on that date, with a score of 1 or 2: the events of an event study of earnings."),
		variable: 'ibes_announcements',
		identifier: 'ibesTicker',
		dated: true,
	},
	{
		id: 'keyDevelopments',
		group: 'events',
		label: localize('wrds.keyDevelopments', "Capital IQ Key Developments"),
		description: localize('wrds.keyDevelopments.description', "Corporate events, such as executive changes, dividend increases, delistings and bankruptcy filings, each with its announcement date, headline and type, from S&P Capital IQ (ciq.wrds_keydev), by Capital IQ company ID. To narrow it by date too, choose Browse the Libraries, library ciq, table wrds_keydev, and its date column."),
		variable: 'key_developments',
		identifier: 'companyid',
		dated: false,
	},
];

/** A common dataset as the Choose Data step narrows it. */
export interface IWrdsDatasetChoice {
	readonly dataset: WrdsDatasetId;
	/** The first and last dates, `YYYY-MM-DD`, or empty for no bound. */
	readonly start: string;
	readonly end: string;
	/** The identifiers of the dataset, separated by commas or spaces, or empty for all. */
	readonly identifiers: string;
}

/** A table chosen in Browse, its columns, and the date column a range narrows it by. */
export interface IWrdsBrowseChoice {
	readonly library: string;
	readonly table: string;
	/** The columns chosen; none for all. */
	readonly columns: readonly string[];
	readonly dateColumn?: string;
	readonly start: string;
	readonly end: string;
}

/** Where the Extract and Merge steps put the data: a Julia variable only, or also a file. */
export type WrdsDestination = 'variable' | 'parquet' | 'csv' | 'duckdb';

/** A date of the form `YYYY-MM-DD`, or undefined for anything else. */
function sqlDate(value: string): string | undefined {
	return /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ? `'${value.trim()}'` : undefined;
}

/** The conditions that keep `column` between the dates `start` and `end`, either of which may be empty. */
function dateConditions(column: string, start: string, end: string): string[] {
	const from = sqlDate(start);
	const to = sqlDate(end);
	return [...(from ? [`${column} >= ${from}`] : []), ...(to ? [`${column} <= ${to}`] : [])];
}

/**
 * The identifiers typed, as an SQL list, or undefined when none is valid: PERMNOs, SECIDs and Capital IQ company IDs as
 * numbers, GVKEYs as text of six digits, IBES tickers as text in capitals.
 */
function identifierList(kind: WrdsIdentifier, text: string): string | undefined {
	const pattern = kind === 'ibesTicker' ? /^[A-Za-z0-9]+$/ : /^\d+$/;
	const values = text.split(/[\s,;]+/).map(value => value.trim()).filter(value => pattern.test(value));
	if (!values.length) {
		return undefined;
	}
	return values.map(value => {
		switch (kind) {
			case 'gvkey': return `'${value.padStart(6, '0')}'`;
			case 'ibesTicker': return `'${value.toUpperCase()}'`;
			default: return String(Number(value));
		}
	}).join(', ');
}

/** The condition that keeps the rows of the identifiers typed in `choice`, if any is. */
function identifierConditions(column: string, kind: WrdsIdentifier, choice: IWrdsDatasetChoice): string[] {
	const list = identifierList(kind, choice.identifiers);
	return list ? [`${column} IN (${list})`] : [];
}

/** `conditions` as a WHERE clause, one per line. */
function where(conditions: readonly string[]): string[] {
	return conditions.length ? ['WHERE ' + conditions.join('\n  AND ')] : [];
}

/** The filters of Tidy Finance that keep the US common stocks of the NYSE, NYSE American and Nasdaq, while actively traded. */
const COMMON_STOCK_CONDITIONS = [
	`ssih.sharetype = 'NS'`,
	`ssih.securitytype = 'EQTY'`,
	`ssih.securitysubtype = 'COM'`,
	`ssih.usincflg = 'Y'`,
	`ssih.issuertype IN ('ACOR', 'CORP')`,
	`ssih.primaryexch IN ('N', 'A', 'Q')`,
	`ssih.conditionaltype IN ('RW', 'NW')`,
	`ssih.tradingstatusflg = 'A'`,
];

/** The query of the CRSP monthly stock file, with the GVKEY of each month's CRSP-Compustat link when `gvkey` is set. */
function crspMonthlySql(choice: IWrdsDatasetChoice, gvkey: boolean): string {
	return [
		'-- US common stocks of the NYSE, NYSE American and Nasdaq, while actively traded',
		...(gvkey ? ['-- with the GVKEY of the CRSP-Compustat link of types LU and LC, primary securities, that holds in the month'] : []),
		`SELECT msf.permno,${gvkey ? ' link.gvkey,' : ''} msf.mthcaldt AS date, msf.mthret AS ret, msf.mthprc AS prc, msf.shrout,`,
		'  ssih.primaryexch, ssih.siccd',
		'FROM crsp.msf_v2 AS msf',
		'INNER JOIN crsp.stksecurityinfohist AS ssih',
		'  ON msf.permno = ssih.permno AND ssih.secinfostartdt <= msf.mthcaldt AND msf.mthcaldt <= ssih.secinfoenddt',
		...(gvkey
			? [
				'LEFT JOIN crsp.ccmxpf_lnkhist AS link',
				'  ON link.lpermno = msf.permno AND link.linkdt <= msf.mthcaldt AND msf.mthcaldt <= COALESCE(link.linkenddt, CURRENT_DATE)',
				`  AND link.linktype IN ('LU', 'LC') AND link.linkprim IN ('P', 'C')`,
			]
			: []),
		...where([
			...dateConditions('msf.mthcaldt', choice.start, choice.end),
			...COMMON_STOCK_CONDITIONS,
			...identifierConditions('msf.permno', 'permno', choice),
		]),
		'ORDER BY msf.permno, msf.mthcaldt',
	].join('\n');
}

/** The years of OptionMetrics' tables of option prices that the dates of `choice` span; the last full year when none is given. */
function optionYears(choice: IWrdsDatasetChoice): { readonly years: number[]; readonly note?: string } {
	const year = (value: string) => sqlDate(value) ? Number(value.trim().slice(0, 4)) : undefined;
	const lastFullYear = new Date().getFullYear() - 1;
	const start = year(choice.start);
	const end = year(choice.end);
	const first = start ?? end ?? lastFullYear;
	const last = end ?? (start !== undefined ? Math.max(start, lastFullYear) : first);
	const years: number[] = [];
	for (let y = Math.min(first, last); y <= Math.max(first, last); y++) {
		years.push(y);
	}
	const note = start === undefined && end === undefined
		? `-- No dates given: the year ${first} only`
		: end === undefined && last === lastFullYear ? `-- No To date given: through ${last}, the last full year` : undefined;
	return { years, note };
}

/** The query of a common dataset, narrowed by the dates and identifiers of `choice`. */
export function wrdsDatasetSql(choice: IWrdsDatasetChoice): string {
	switch (choice.dataset) {
		case 'crspMonthly':
			return crspMonthlySql(choice, false);
		case 'crspMonthlyGvkey':
			return crspMonthlySql(choice, true);
		case 'crspDaily':
			return [
				'-- US common stocks of the NYSE, NYSE American and Nasdaq, while actively traded',
				'SELECT dsf.permno, dsf.dlycaldt AS date, dsf.dlyret AS ret, dsf.dlycap',
				'FROM crsp.dsf_v2 AS dsf',
				'INNER JOIN crsp.stksecurityinfohist AS ssih',
				'  ON dsf.permno = ssih.permno AND ssih.secinfostartdt <= dsf.dlycaldt AND dsf.dlycaldt <= ssih.secinfoenddt',
				...where([
					...dateConditions('dsf.dlycaldt', choice.start, choice.end),
					...COMMON_STOCK_CONDITIONS,
					...identifierConditions('dsf.permno', 'permno', choice),
				]),
				'ORDER BY dsf.permno, dsf.dlycaldt',
			].join('\n');
		case 'compustatAnnual':
			return [
				'-- One row per firm and fiscal year: industrial format, standard data, domestic population, consolidated',
				'SELECT gvkey, datadate, fyear, at, lt, seq, ceq, sale, ni, oancf, capx',
				'FROM comp.funda',
				...where([
					`indfmt = 'INDL'`,
					`datafmt = 'STD'`,
					`popsrc = 'D'`,
					`consol = 'C'`,
					...dateConditions('datadate', choice.start, choice.end),
					...identifierConditions('gvkey', 'gvkey', choice),
				]),
				'ORDER BY gvkey, datadate',
			].join('\n');
		case 'compustatQuarterly':
			return [
				'-- One row per firm and fiscal quarter: industrial format, standard data, domestic population, consolidated;',
				'-- rdq is the date the earnings of the quarter were reported',
				'SELECT gvkey, datadate, fyearq, fqtr, rdq, atq, ceqq, saleq, niq',
				'FROM comp.fundq',
				...where([
					`indfmt = 'INDL'`,
					`datafmt = 'STD'`,
					`popsrc = 'D'`,
					`consol = 'C'`,
					...dateConditions('datadate', choice.start, choice.end),
					...identifierConditions('gvkey', 'gvkey', choice),
				]),
				'ORDER BY gvkey, datadate',
			].join('\n');
		case 'ccmLinks':
			return [
				'-- Links of types LU and LC to primary securities; a link still in force has no end date, given as today',
				'SELECT gvkey, lpermno AS permno, linktype, linkprim, linkdt, COALESCE(linkenddt, CURRENT_DATE) AS linkenddt',
				'FROM crsp.ccmxpf_lnkhist',
				...where([
					`linktype IN ('LU', 'LC')`,
					`linkprim IN ('P', 'C')`,
					...identifierConditions('gvkey', 'gvkey', choice),
				]),
				'ORDER BY gvkey, linkdt',
			].join('\n');
		case 'optionPrices': {
			const { years, note } = optionYears(choice);
			const conditions = [...dateConditions('date', choice.start, choice.end), ...identifierConditions('secid', 'secid', choice)];
			return [
				'-- One table of option prices per year; strike_price is in thousandths of a dollar',
				...(note ? [note] : []),
				years.map(year => [
					'SELECT secid, date, exdate, cp_flag, strike_price / 1000.0 AS strike, best_bid, best_offer,',
					'  volume, open_interest, impl_volatility, delta',
					`FROM optionm.opprcd${year}`,
					...where(conditions),
				].join('\n')).join('\nUNION ALL\n'),
				'ORDER BY secid, date, exdate, cp_flag, strike',
			].join('\n');
		}
		case 'optionSecurities':
			return [
				'-- Each SECID with its CUSIP and names from each effective date on',
				'SELECT *',
				'FROM optionm_all.secnmd',
				...where(identifierConditions('secid', 'secid', choice)),
				'ORDER BY secid, effect_date',
			].join('\n');
		case 'ibesAnnouncements':
			return [
				'-- Earnings per share announced by US firms, quarterly (QTR) and annual (ANN), unadjusted for splits;',
				'-- with the PERMNO of the IBES-CRSP link of score 1 or 2 that holds on the announcement date',
				'SELECT act.ticker, link.permno, act.pends, act.pdicity, act.anndats, act.anntims, act.value',
				'FROM ibes.actu_epsus AS act',
				'LEFT JOIN wrdsapps_link_crsp_ibes.ibcrsphist AS link',
				'  ON link.ticker = act.ticker AND link.sdate <= act.anndats AND act.anndats <= link.edate AND link.score <= 2',
				...where([
					...dateConditions('act.anndats', choice.start, choice.end),
					...identifierConditions('act.ticker', 'ibesTicker', choice),
				]),
				'ORDER BY act.ticker, act.anndats',
			].join('\n');
		case 'keyDevelopments':
			return [
				'-- Corporate events of S&P Capital IQ; without company IDs, every company: count the rows first',
				'SELECT *',
				'FROM ciq.wrds_keydev',
				...where(identifierConditions('companyid', 'companyid', choice)),
				'ORDER BY companyid',
			].join('\n');
	}
}

/** The query of a table chosen in Browse: its columns chosen, or all, between the dates of its date column. */
export function wrdsBrowseSql(choice: IWrdsBrowseChoice): string {
	const columns = choice.columns.length ? choice.columns.map(sqlName).join(', ') : '*';
	return [
		`SELECT ${columns}`,
		`FROM ${sqlName(choice.library)}.${sqlName(choice.table)}`,
		...where(choice.dateColumn ? dateConditions(sqlName(choice.dateColumn), choice.start, choice.end) : []),
	].join('\n');
}

/** `sql` as the lines of a Julia raw string assigned to `sql`, without a final semicolon, which a subquery cannot have. */
function sqlLines(sql: string): string[] {
	return ['sql = raw"""', sql.trim().replace(/;\s*$/, ''), '"""'];
}

/** The lines that print the size of the column table `variable` and, for a destination other than the variable alone, write it to `file`. */
function resultLines(variable: string, destination: WrdsDestination, file: string | undefined, installed: boolean): string[] {
	return [
		`println(length(first(${variable})), " rows x ", length(${variable}), " columns")`,
		...(destination !== 'variable' && file
			? [
				'',
				...(installed ? [] : ['PollisDB.install()  # DuckDB, which writes the file']),
				`PollisDB.save(${variable}, ${juliaString(file)}${destination === 'duckdb' ? `; table = ${juliaString(variable)}` : ''})`,
			]
			: []),
	];
}

/** The code that counts the rows the query `sql` gives on WRDS, without bringing them over. */
export function generateWrdsCountCode(profile: IDatabaseConnectionProfile, connected: boolean, sql: string): string {
	return generateReplTaskCode(profile, connected, [
		...sqlLines(sql),
		`n = first(Tables.columntable(DBInterface.execute(${profile.variable}, "SELECT count(*) AS n FROM ($sql) AS q")).n)`,
		'println("The query gives ", n, " rows")',
	]);
}

/**
 * The code that brings the result of `sql` on WRDS into the Julia variable `variable`, and writes it to `file` for a
 * destination other than the variable alone: Parquet, CSV, or the table `variable` of a DuckDB database.
 */
export function generateWrdsExtractCode(profile: IDatabaseConnectionProfile, connected: boolean, sql: string, variable: string, destination: WrdsDestination, file?: string): string {
	return generateReplTaskCode(profile, connected, [
		...sqlLines(sql),
		`${variable} = PollisDB.fetch(${profile.variable}, sql)  # a named tuple of column vectors`,
		...resultLines(variable, destination, file, false),
	]);
}

/**
 * How the Merge step dates the accounting data of a stock-month: `annual`, the fiscal year ending in calendar year t from
 * July of t+1 to June of t+2, after Fama and French (1993); `quarterly`, the latest quarter reported in an earlier month
 * whose fiscal quarter ended at most six months before, after Hou, Xue and Zhang (2015).
 */
export type WrdsTimingRule = 'annual' | 'quarterly';

/** The tables the Merge step joins: each a Julia variable, or a Parquet or CSV file. */
export interface IWrdsMergeChoice {
	readonly rule: WrdsTimingRule;
	/** Stock-months with `permno`, `gvkey` and `date`, such as CRSP Monthly with GVKEY. */
	readonly stocks: string;
	/** Compustat rows with `gvkey` and `datadate`, and `rdq` for the quarterly rule. */
	readonly firms: string;
}

/** Whether `source` is a table the Merge step can read: a Julia variable, or a Parquet or CSV file. */
export function isValidMergeSource(source: string): boolean {
	const text = source.trim();
	return isValidJuliaIdentifier(text) || /\.(parquet|csv)$/i.test(text);
}

/** `source` as Julia: the variable, or the file's path as a string. */
function mergeSourceCode(source: string): string {
	const text = source.trim();
	return isValidJuliaIdentifier(text) ? text : juliaString(text);
}

/** The DuckDB query that joins the tables `stocks` and `firms` by the timing rule `rule`. */
function mergeSql(rule: WrdsTimingRule): string {
	return (rule === 'annual'
		? [
			'-- Fama and French (1993): the fiscal year ending in calendar year t is used from July of t+1 to June of t+2;',
			'-- of two fiscal years ending in the same calendar year, the later',
			'SELECT s.*, f.* EXCLUDE (gvkey)',
			'FROM stocks AS s',
			'LEFT JOIN firms AS f',
			'  ON f.gvkey = s.gvkey',
			'  AND year(f.datadate) = year(s.date) - CASE WHEN month(s.date) >= 7 THEN 1 ELSE 2 END',
			'QUALIFY row_number() OVER (PARTITION BY s.permno, s.date ORDER BY f.datadate DESC) = 1',
			'ORDER BY s.permno, s.date',
		]
		: [
			'-- Hou, Xue and Zhang (2015): the latest quarter reported (rdq) in an earlier month,',
			'-- if its fiscal quarter ended at most six months before the month',
			'SELECT s.*, f.* EXCLUDE (gvkey)',
			'FROM stocks AS s',
			'LEFT JOIN firms AS f',
			'  ON f.gvkey = s.gvkey',
			`  AND date_trunc('month', f.rdq) < date_trunc('month', s.date)`,
			`  AND f.datadate >= date_trunc('month', s.date) - INTERVAL 6 MONTH`,
			'QUALIFY row_number() OVER (PARTITION BY s.permno, s.date ORDER BY f.rdq DESC, f.datadate DESC) = 1',
			'ORDER BY s.permno, s.date',
		]).join('\n');
}

/**
 * The code that joins, on this computer with DuckDB, the stock data and the accounting data of `choice` into the Julia
 * variable `variable`, and writes it to `file` for a destination other than the variable alone.
 */
export function generateWrdsMergeCode(choice: IWrdsMergeChoice, variable: string, destination: WrdsDestination, file?: string): string {
	return [
		'PollisDB.install()  # DuckDB, which joins the tables',
		...sqlLines(mergeSql(choice.rule)),
		`${variable} = PollisDB.query_tables(sql; stocks = ${mergeSourceCode(choice.stocks)}, firms = ${mergeSourceCode(choice.firms)})`,
		...resultLines(variable, destination, file, true),
	].join('\n');
}
