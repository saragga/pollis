# Julia Functions in DuckDB: Julia Functions Registered in a Database

How the Julia Function tab of Julia Functions in DuckDB hands a Julia function to DuckDB with [DuckDB.jl](#ref-RM2026a): the macro and its types, what DuckDB does with a call that does not fit, errors in the function, and how long a registered function lives.

## How Do I Register a Julia Function in DuckDB?

```julia
using DuckDB

db = DuckDB.DB()
f = DuckDB.@create_scalar_function escape_time(zr::Float64, zi::Float64, cr::Float64, ci::Float64, maxiter::Int32)::Int32
DuckDB.register_scalar_function(db, f)
DBInterface.execute(db, "SELECT escape_time(0.0, 0.0, -0.5, 0.5, 100)")
```

`DuckDB.@create_scalar_function` takes a signature written like a Julia method, with a type for every argument and for the result, and makes a `DuckDB.ScalarFunction` that calls the Julia function of that name. A second argument, a function or an anonymous function, is called instead when the name in SQL should differ from the Julia function's: `@create_scalar_function sql_name(x::Float64)::Float64 x -> 2x`. `DuckDB.register_scalar_function` adds it to a database, or to a connection; the name in SQL is the name in the signature.

## Which Types Can a Julia Function Registered in DuckDB Take?

Each Julia type in the signature becomes the SQL type of the parameter: `Float64` a `DOUBLE`, `Int32` an `INTEGER`, `Int64` a `BIGINT`, `Bool` a `BOOLEAN`, `String` a `VARCHAR`, `Date` a `DATE`. DuckDB binds a call against these types when it plans the query, before any row is read. A value of another numeric type is cast when DuckDB can do it without losing information, as a decimal number written in the query is cast to `DOUBLE`. A call with the wrong number of arguments, or with values that cannot be cast, stops the query with a Binder Error that lists the function's signature, its parameters named by position, as DuckDB.jl passes no names: `escape_time(col0 DOUBLE, col1 DOUBLE, col2 DOUBLE, col3 DOUBLE, col4 INTEGER) -> INTEGER`. The query of the page casts its numbers itself, with `::DOUBLE` and `::INTEGER`, so that the call matches the signature as written.

## Why Is a Julia Function Registered in DuckDB Fast?

The macro writes a wrapper for the signature: a Julia function that DuckDB calls through a C function pointer once for each chunk of rows, which takes the arguments' vectors as Julia arrays of the declared types and calls the Julia function on each row. Every type in the loop is known, so Julia compiles the wrapper and the function together for those types, as it compiles any Julia code, with no boxing of the values and no lookup of the method at each row. The first query that calls the function includes that compilation; later queries run the compiled code. The cost of a call from DuckDB into Julia is paid per chunk, not per row, so the loop runs at about the speed of the same loop in Julia alone.

## What Happens When a Registered Julia Function Throws an Error?

The wrapper runs the loop inside `try`. An error thrown by the Julia function, on any row, is caught and passed to DuckDB as the error of the function, with the signature and the Julia error in its message, and the query stops with it: `DBInterface.execute` throws, and the Julia session goes on. Nothing of the error reaches DuckDB's own code as a Julia exception, which DuckDB could not handle. A function meant to be called on many rows of unknown data should therefore check what it can, or return a value of its result type that marks a case it cannot compute, rather than stop a long query at its first odd row.

## How Long Does a Julia Function Registered in DuckDB Live?

The function belongs to the database object it was registered in, `db`, which keeps a reference to it, and lives as long as that object and the Julia session. Registering the same name again in the same database throws an `ArgumentError`, which is why the tab opens a new database each time it runs. The function is not stored in a database file: a database saved to disk and opened again, by Julia or by another program, knows nothing of it, and a query that calls it fails there. The DuckDB command line, Python or the DuckDB terminal of Pollis cannot call a function registered from Julia; a function they should call needs to be an extension, as in the Rust Extension tab.

## References

<a id="ref-RM2026a"></a>Raasveldt, M. and Mühleisen, H. (2026). DuckDB.jl: the DuckDB Julia package. [github.com/duckdb/DuckDB.jl](https://github.com/duckdb/DuckDB.jl)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [How DuckDB Calls a Scalar Function](scalar-functions.md) · [Writing a DuckDB Extension in Rust](rust-extensions.md)
