# Merging Data

The **Merge** step of the Wharton Research Data Services (WRDS) page joins stock data from CRSP to accounting data from Compustat, both extracted in the Extract step, on the user's computer.

## What the Merge Step Does

The Merge step gives each stock and month the accounting data of its firm that investors could know in that month. Its input is two tables of the Extract step: the **Stock Data**, stock-months with the columns `permno`, `gvkey` and `date`, as the CRSP Monthly with GVKEY dataset gives, and the **Firm Data**, Compustat rows with `gvkey` and `datadate`, and `rdq` for the quarterly rule. Each is a Julia variable or a Parquet or CSV file that the Extract step saved. **Timing** chooses how a month is matched to accounting data. The join runs in DuckDB in the Julia REPL, with `PollisDB.query_tables`, without WRDS: the step works offline, once the data is extracted. Its result goes into a Julia variable and, if asked, a Parquet, CSV or DuckDB file, as in the Extract step.

## Annual Timing Rule of Fama and French (1993)

Accounting data becomes public some months after the end of a fiscal year, so a month's returns must not be matched with figures published later. [Fama and French (1993)](#ref-FF1993a) match the accounting data of fiscal years ending in calendar year t-1 with the returns from July of year t to June of year t+1. The **Annual: Fama and French (1993)** timing gives each month from July of year t+1 to June of year t+2 the Compustat Annual Fundamentals of the fiscal year whose `datadate` falls in calendar year t. A firm that changes its fiscal year can end two fiscal years in one calendar year; the step keeps the later. A stock-month without accounting data keeps its row, with the Compustat columns empty.

## Quarterly Timing Rule from the Report Date (rdq)

Quarterly data is matched by the date the firm reported it, Compustat's `rdq`, rather than by a fixed lag. [Hou, Xue and Zhang (2015)](#ref-HXZ2015a) use quarterly earnings in the months after the most recent quarterly earnings announcement, and require the fiscal quarter of those earnings to have ended within six months before. The **Quarterly: Hou, Xue and Zhang (2015)** timing gives each month the Compustat Quarterly Fundamentals of the latest quarter whose `rdq` falls in an earlier month and whose `datadate` is at most six months before the month. A quarter without a report date is never used. A stock-month without such a quarter keeps its row, with the Compustat columns empty.

## Merge Code in Julia

The Julia code below the timing is what the Merge button sends to the Julia REPL. It holds the query of DuckDB in a raw string, `sql`, and names the stock data `stocks` and the firm data `firms` in that query: `PollisDB.query_tables(sql; stocks = crsp_monthly_gvkey, firms = compustat_annual)` registers each Julia variable, or reads each file, as a table of a DuckDB database in memory, runs the query and returns its result as a named tuple of column vectors. The query keeps every column of the stock data and every column of the firm data but `gvkey`, one row per `permno` and `date`. Copied into a script, the code joins the same tables again.

## References

<a id="ref-FF1993a"></a>Fama, E. F. and French, K. R. (1993). Common Risk Factors in the Returns on Stocks and Bonds. *Journal of Financial Economics* 33(1), 3–56. [doi:10.1016/0304-405X(93)90023-5](https://doi.org/10.1016/0304-405X(93)90023-5)

<a id="ref-HXZ2015a"></a>Hou, K., Xue, C. and Zhang, L. (2015). Digesting Anomalies: An Investment Approach. *Review of Financial Studies* 28(3), 650–705. [doi:10.1093/rfs/hhu068](https://doi.org/10.1093/rfs/hhu068)

## See Also

- [Overview](overview.md) · [Choosing Data](choosing-data.md) · [Extracting Data](extracting-data.md) · [Factsheet](factsheet.md)
