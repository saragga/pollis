# Julia Functions in DuckDB: How DuckDB Calls a Scalar Function

How DuckDB runs a query that calls a scalar function of its own or of a program: chunks of rows and vectors, NULL, threads, and what the calls cost.

## Why Does DuckDB Call a Scalar Function Once for Each Chunk of Rows?

DuckDB executes a query over vectors, not row by row: each step of the plan receives a chunk of rows, by default up to 2048, held column by column, one vector for each column, and passes a chunk on. The design comes from MonetDB/X100 of [Boncz, Żukowski and Nes (2005)](#ref-BZN2005a), which found that an engine calling an operation once per row spends most of its time in the calls themselves, and that working on vectors that fit in the processor's cache lets the loops inside each operation run at full speed. A scalar function takes part in the same way: DuckDB calls it once for each chunk, with one vector for each argument and an output vector to fill, and the function loops over the rows itself. The cost of crossing from DuckDB into a Julia function or an extension is paid once per chunk, a few thousand rows, which is why a function written outside DuckDB can be about as fast in a query as in its own language.

## How Does a Scalar Function Read Its Arguments and Write Its Result?

Each argument arrives as a vector of the type the function declared: a `DOUBLE` argument as doubles, an `INTEGER` one as 32-bit integers. A vector is not always a plain array of values. A constant argument, such as the number of iterations written in the query, may come as a constant vector, one value standing for every row, and a column that has been filtered may come as a dictionary, values and a selection of their positions. DuckDB.jl gives the Julia function arrays of the declared types, one element for each row. In Rust, duckdb-neo gives each vector a reader whose `get(row)` returns the value of a row, whatever the layout, as `Some(&value)` or `None`. The function writes one value for each row of the output vector, which has as many rows as the chunk.

## What Happens to NULL in a Scalar Function Called from SQL?

SQL marks a missing value as NULL, kept apart from the values in a validity mask beside each vector. A scalar function decides what NULL gives, and the convention of SQL is that a NULL argument gives a NULL result, as `1 + NULL` does. The functions of Julia Functions in DuckDB follow it. DuckDB.jl does it for a registered Julia function: a row with a NULL in any argument gets NULL without calling the function. The Rust extension does it itself: when the reader of any argument gives `None`, the function calls `set_null` for that row.

## On Which Threads Does DuckDB Call a Scalar Function?

DuckDB runs a query on several threads at once, each on chunks of its own, so a scalar function may be called by several threads at the same time. A function that only reads its arguments and writes its own rows of the output, as `escape_time` does, is safe to call in this way; one that changes shared state, a counter or a cache, needs a lock or a state for each thread. DuckDB.jl opens a database with as many threads as the Julia session has and makes them external: DuckDB starts no threads of its own, and its work, the calls to a Julia function included, runs on threads that Julia knows about. An extension is called on whatever threads the DuckDB that loaded it runs, and the `exec` of its callback may run on several of them at once.

## Where Does a Scalar Function Appear in a Query Plan?

`EXPLAIN ANALYZE` runs a query and prints the plan it ran, step by step, with the rows each step produced and the time it took. A scalar function in the select list is part of a projection: the step that computes the columns of the result from those of the step below, here a scan of the table `pixels`. The time of the projection is mostly the time of the function, as the other columns are passed through. A scalar function in a `WHERE` clause appears in a filter instead, which keeps only the rows for which the condition holds. **Query Plan** prints the plan of the page's query, so the share of the time spent in `escape_time` can be read beside that of the scan and of the result being sent to Julia.

## References

<a id="ref-BZN2005a"></a>Boncz, P. A., Żukowski, M. and Nes, N. J. (2005). MonetDB/X100: hyper-pipelining query execution. *Proceedings of the Second Biennial Conference on Innovative Data Systems Research (CIDR)*, 225–237. [ir.cwi.nl/pub/16497](https://ir.cwi.nl/pub/16497)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Julia Functions Registered in a Database](julia-functions.md) · [Writing a DuckDB Extension in Rust](rust-extensions.md)
