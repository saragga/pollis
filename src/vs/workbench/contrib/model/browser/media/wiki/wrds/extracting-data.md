# Extracting Data

The **Extract** step of the Wharton Research Data Services (WRDS) page runs the query of the Choose Data step on WRDS, in the Julia REPL, and brings its result to the computer.

## Counting Rows Before Extracting from WRDS

**Count Rows** runs the query of the Choose Data step inside `SELECT count(*)` on WRDS and prints the number of rows in the Julia REPL, without bringing any of them over. Counting first shows whether a query is the size expected: monthly CRSP data over decades runs to millions of rows, and daily data to tens of millions. A count far from the one expected is the time to narrow the query, by dates or identifiers, in the Choose Data step.

## Bringing WRDS Data into a Julia Variable

**Extract** runs the query on WRDS and puts its result into the Julia variable named in **Julia Variable**, as a named tuple of column vectors, a table of Tables.jl. The name follows the dataset or the table chosen, such as `crsp_monthly`, until another is typed. `PollisDB.fetch` brings the result over and turns the decimal columns of PostgreSQL, which arrive as `Decimal`, into `Float64`, the type DuckDB, Parquet and CSV take. The Julia code is shown above the buttons, and the REPL prints the numbers of rows and columns brought over.

## Saving WRDS Data to Parquet, CSV or DuckDB

**Also Save To** writes the data to a file as well as to the variable. **Parquet File** keeps the column types and is compact; **CSV File** is read by any program; **DuckDB Database** puts the data into a table named as the variable, in a DuckDB database file, replacing a table of that name. `PollisDB.save` writes the file with the DuckDB engine of Pollis. **Choose...** offers the data folder of the open Pollis Workspace, which File > New Pollis Workspace... makes. A DuckDB database of extracts can be added to the Databases view with Explore > Access Databases > Connect to DuckDB..., so that later work reads it there instead of from WRDS.

## Extracting from WRDS Before Connecting

The Extract step runs on the WRDS connection of step 1. When the Julia REPL does not hold it yet, the code of the Extract step connects first, as Connect does: the password is asked for in the REPL, unless it comes from `~/.pgpass`, and the Duo push is approved on the phone. The connection then appears in the Databases view, and later extracts run on it without signing in again.

## See Also

- [Overview](overview.md) · [Choosing Data](choosing-data.md) · [Merging Data](merging-data.md) · [Factsheet](factsheet.md)
