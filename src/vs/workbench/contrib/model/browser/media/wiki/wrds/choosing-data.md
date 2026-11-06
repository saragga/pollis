# Choosing Data

The **Choose Data** step of the Wharton Research Data Services (WRDS) page writes the query in SQL that the **Extract** step runs on WRDS, from a common dataset or from a table of a library.

## Common Datasets and Browse the Libraries in the Choose Data Step

The Choose Data step offers two ways to a query. **Common Datasets** gives the datasets most research starts from, each with the filters research usually applies, in three groups: **CRSP and Compustat**, for stocks and company fundamentals; **Options**, from OptionMetrics; and **Announcements and Events**, from IBES and S&P Capital IQ. **Browse the Libraries** lists the libraries of the WRDS connection, reads the tables of the library chosen, and writes a query of the table chosen, with the columns ticked, or all of them. Both write the query into the **SQL** box, where it can be edited: a join, another column, another condition. Changing a choice above the box writes the query again, so edits come last. The query runs on WRDS only in the Extract step.

## CRSP Monthly Stock File in CRSP's New Format (CIZ)

CRSP now releases its stock data only in its new format, called CIZ: the tables of the earlier format, SIZ, such as `crsp.msf`, are updated only through December 2024. The **CRSP Monthly Stock File** dataset reads the new format, as [Scheuch, Voigt and Weiss (2023)](#ref-SVW2023a) do: the monthly table `crsp.msf_v2`, for `permno`, the month's date `mthcaldt`, the return `mthret`, the price `mthprc` and the shares outstanding `shrout`, joined with `crsp.stksecurityinfohist` for the description of each security in force in that month. The filters keep US common stocks of corporations (`sharetype = 'NS'`, `securitytype = 'EQTY'`, `securitysubtype = 'COM'`, `usincflg = 'Y'`, `issuertype` `ACOR` or `CORP`), listed on the NYSE, NYSE American or Nasdaq (`primaryexch` `N`, `A` or `Q`), while traded (`conditionaltype` `RW` or `NW`, `tradingstatusflg = 'A'`). The industry code `siccd` comes from `crsp.stksecurityinfohist`, which keeps its history.

## Compustat Annual Fundamentals: One Row per Firm and Fiscal Year

Compustat's annual table, `comp.funda`, holds several rows for one firm and fiscal year: in other formats, for other populations, or for statements not consolidated. The **Compustat Annual Fundamentals** dataset keeps one row for each with four filters: industrial format (`indfmt = 'INDL'`), standard data (`datafmt = 'STD'`), the domestic population (`popsrc = 'D'`) and consolidated statements (`consol = 'C'`). Its columns are the firm identifier `gvkey`, the date of the statements `datadate`, the fiscal year `fyear`, total assets `at`, total liabilities `lt`, stockholders' equity `seq`, common equity `ceq`, revenue `sale`, net income `ni`, operating cash flow `oancf` and capital expenditure `capx`. Other items of `comp.funda` are added in the SQL box.

## Linking Compustat Firms to CRSP Securities

Compustat identifies a firm by its GVKEY and CRSP a security by its PERMNO. The **CRSP-Compustat Link** dataset reads `crsp.ccmxpf_lnkhist`, which says which PERMNO belongs to which GVKEY from `linkdt` to `linkenddt`. It keeps links of type `LC`, researched by CRSP, and `LU`, valid but not yet researched, and the primary securities: `linkprim` `P`, the primary security Compustat marks, or `C`, the one CRSP marks where Compustat's marks overlap or are missing. This is the choice of [Scheuch, Voigt and Weiss (2023)](#ref-SVW2023a). A link still in force has no end date, and the query gives it today's. A row of Compustat then joins the CRSP rows of the PERMNO whose link holds at the row's date.

## CRSP Monthly with GVKEY and the CRSP Daily Stock File

The **CRSP Monthly with GVKEY** dataset is the CRSP Monthly Stock File with one more column, `gvkey`: the Compustat firm that `crsp.ccmxpf_lnkhist` links to the stock in that month, with the link types and primary securities of the CRSP-Compustat Link dataset. The link is made on WRDS, and a stock without a link in a month keeps its row, with `gvkey` empty. It is the stock data that the **Merge** step joins to Compustat. The **CRSP Daily Stock File** dataset reads the daily table of the new format, `crsp.dsf_v2`, for `permno`, the trading day `dlycaldt`, the return `dlyret` and the market capitalisation `dlycap`, with the filters of common stocks of the monthly file. Daily returns are what an event study measures abnormal returns with; over many stocks and years they make tens of millions of rows, so PERMNOs and dates narrow the query.

## Compustat Quarterly Fundamentals and the Report Date (rdq)

Compustat's quarterly table, `comp.fundq`, has the same several rows per firm and period as the annual one, and the **Compustat Quarterly Fundamentals** dataset keeps one with the same four filters: `indfmt = 'INDL'`, `datafmt = 'STD'`, `popsrc = 'D'` and `consol = 'C'`. Its columns are `gvkey`, the quarter's end `datadate`, the fiscal year `fyearq` and quarter `fqtr`, the report date `rdq`, total assets `atq`, common equity `ceqq`, sales `saleq` and net income `niq`. The report date `rdq` is the day the firm announced the quarter's earnings, which comes weeks after `datadate`: it says when the quarter's figures became public, which the quarterly timing rule of the Merge step uses.

## OptionMetrics Option Prices and Securities

OptionMetrics keeps one table of option prices per year, such as `optionm.opprcd2020`. The **OptionMetrics Option Prices** dataset joins the tables of the years from **From** to **To** and keeps, for each day and option, the underlying security `secid`, the expiry `exdate`, call or put `cp_flag`, the strike in dollars (`strike_price`, stored in thousandths of a dollar, divided by 1,000), the best bid `best_bid` and offer `best_offer`, `volume`, `open_interest`, the implied volatility `impl_volatility` and `delta`. A year of every listed option is very large, so SECIDs narrow the query. The **OptionMetrics Securities** dataset reads `optionm_all.secnmd`, which gives each SECID its CUSIP and names from each effective date `effect_date`: it is where the SECID of a stock is found, and its CUSIP is how WRDSMerger.jl links OptionMetrics to CRSP.

## IBES Earnings Announcements and the IBES-CRSP Link

The **IBES Earnings Announcements** dataset reads `ibes.actu_epsus`, the actual earnings per share of US firms in IBES, not adjusted for later stock splits. Each row has the IBES `ticker`, the end of the period `pends`, its length `pdicity` (`QTR` for a quarter, `ANN` for a year), the announcement date `anndats` and time `anntims`, and the value announced `value`. IBES identifies firms by its own ticker, so the query joins `wrdsapps_link_crsp_ibes.ibcrsphist`, the link of WRDS between IBES tickers and CRSP PERMNOs, for the PERMNO linked on the announcement date. The link scores each match from 1, the best, to 6; the query keeps scores 1 and 2, the closest matches. An announcement without such a link keeps its row, with `permno` empty. The announcement dates are the events of an event study of earnings.

## Capital IQ Key Developments

S&P Capital IQ Key Developments records corporate events, such as executive changes, dividend increases, delistings and bankruptcy filings, each with its announcement date, headline, type and the role of the company in it. The **Capital IQ Key Developments** dataset reads the table `ciq.wrds_keydev` of WRDS, with all its columns, for the companies listed by their Capital IQ company ID, `companyid`. Without company IDs the query reads every company. To narrow it by date or by type of event too, **Browse the Libraries** opens the library `ciq` and the table `wrds_keydev`, which lists the table's columns and its date columns for **From** and **To**; the SQL box then takes conditions on the type of event.

## Browsing a WRDS Library and Its Tables

In **Browse the Libraries**, the **Library** list holds the libraries of the WRDS connection with their numbers of tables, once step 1 has connected. Choosing a library has the Julia REPL read its tables and their columns, which also appear below the library in the Databases view. Choosing a table lists its columns with their types: ticked columns go into the query, and none ticked gives all of them. **Date Column** lists the table's columns of a date or time type; choosing one shows **From** and **To**, which narrow the query to those dates.

## Narrowing a WRDS Query by Identifiers and Dates

**From** and **To** keep the rows between two dates, either of which may be left empty; for OptionMetrics Option Prices they also choose the yearly tables, and an empty **To** reads through the last full year. The identifiers of each common dataset keep the rows of the securities or firms listed, separated by commas or spaces: **PERMNOs** for CRSP, **GVKEYs** for Compustat and the CRSP-Compustat Link, **SECIDs** for OptionMetrics, **IBES Tickers** for IBES and **Capital IQ Company IDs** for Key Developments. A GVKEY is written with six digits, and shorter ones are given their leading zeros. Narrowing the query on WRDS keeps the extract small: only the rows the query keeps travel to the computer.

## References

<a id="ref-SVW2023a"></a>Scheuch, C., Voigt, S. and Weiss, P. (2023). *Tidy Finance with R*. Chapman and Hall/CRC. [doi:10.1201/b23237](https://doi.org/10.1201/b23237)

## See Also

- [Overview](overview.md) · [Extracting Data](extracting-data.md) · [Merging Data](merging-data.md) · [Factsheet](factsheet.md)
