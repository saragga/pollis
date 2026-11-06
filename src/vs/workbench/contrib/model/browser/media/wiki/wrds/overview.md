# Overview

**Wharton Research Data Services (WRDS)** is a research data platform of the Wharton School of the University of Pennsylvania. It brings together databases from many vendors, among them CRSP for stock prices and returns and Compustat for company fundamentals, and serves them to the users of subscribing institutions.

## What the Wharton Research Data Services (WRDS) Page Does

The Wharton Research Data Services (WRDS) page, in Explore > Access Data Libraries, brings data from WRDS into Pollis in four steps. **Connect** asks for the WRDS username and how the password is given, and opens the connection in the Julia REPL, saved in the Databases view as `wrds`. **Choose Data** writes a query in SQL, from a common dataset or a table of a library. **Extract** counts the rows of the query, or runs it on WRDS and brings the result into a Julia variable and, if asked, a Parquet, CSV or DuckDB file. **Merge** joins CRSP stock data to Compustat accounting data on the computer, by an annual or a quarterly timing rule. The connection is the same as any PostgreSQL connection of the Databases view: the PostgreSQL tab of the connection form has a **Fill In for WRDS** button that writes the same settings, and **Edit in the Connection Form** opens the saved connection there.

## Why WRDS Is Reached as a PostgreSQL Database

WRDS keeps its data on a PostgreSQL server, which programs reach directly, without the WRDS website. Each WRDS data product is a PostgreSQL schema, which WRDS calls a library, and each file of the product is a table of that schema. A query in SQL selects the rows and columns wanted on the server, so only the result travels to the computer. Julia reaches the server with LibPQ.jl, the Julia interface to libpq, the client library of PostgreSQL, and DBInterface.jl gives the same calls as for DuckDB, SQLite and ODBC connections.

## Signing In to WRDS with a Duo Push

WRDS requires multi-factor authentication for every connection to its PostgreSQL server from outside WRDS. After the password, WRDS sends a Duo push to the phone of the account, and the connection opens once the push is approved. Duo Mobile push is the only method WRDS accepts for PostgreSQL: Duo passcodes, text messages and phone calls are not accepted there. WRDS remembers an approval for 30 days for the same username and IP address, so a computer that keeps its address signs in without a push in that time. A user without push on the phone first signs in to the WRDS website, with multi-factor authentication, from the same IP address. Pollis gives the connection 120 seconds, longer than the 10 seconds of other PostgreSQL connections, so that the push can be approved.

## Giving the WRDS Password: the Julia REPL or a Password File

The Connect step offers two ways to give the WRDS password. **Ask for It in the Julia REPL** has the REPL ask for it when the connection opens; it is passed to libpq for that call only and never written to the code, the REPL history or a file. **Read It from ~/.pgpass** leaves it to libpq, which reads the password file of PostgreSQL: `~/.pgpass` on macOS and Linux, `%APPDATA%\postgresql\pgpass.conf` on Windows. The file suits a computer that connects often, as nothing is typed; its line for WRDS is in the Factsheet. Either way, the connection saved in the Databases view never holds the password.

## How WRDS Libraries Appear in the Databases View

Once connected, WRDS appears in the Databases view with its libraries, the schemas the account may use, each with its number of tables. WRDS holds thousands of tables, so the Databases view does not read them all at once: a library's tables and their columns are read when the library is opened, by `PollisDB.open_schema` in the Julia REPL, and read again on each refresh. Every PostgreSQL database of more than 500 tables is shown the same way. Which libraries appear depends on the subscription of the institution: a library outside it may be listed with tables that cannot be read.

## Who May Use Data from WRDS

The data of WRDS is licensed to subscribing institutions, for the use of their own users, under the terms of WRDS and of each data vendor. Pollis sends nothing to WRDS but the queries of the user, and keeps what they bring on the user's computer, in the Julia REPL or the files the user writes. Whether data from WRDS may be shared, published or kept after leaving the institution is set by those terms, which the institution's WRDS representative or library can explain.

## See Also
- [Factsheet](factsheet.md) · [Choosing Data](choosing-data.md) · [Extracting Data](extracting-data.md) · [Merging Data](merging-data.md)
