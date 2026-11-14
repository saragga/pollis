# Julia Functions in DuckDB: Factsheet

The ways, requirements, inputs, files, types, names and actions of Julia Functions in DuckDB at a glance.

## Ways of Julia Functions in DuckDB

| Tab | How DuckDB gets the function | Who can call it | Build |
|---|---|---|---|
| **Julia Function** | `DuckDB.@create_scalar_function escape_time(zr::Float64, zi::Float64, cr::Float64, ci::Float64, maxiter::Int32)::Int32`, then `DuckDB.register_scalar_function(db, f)` | The database `db` of the Julia session, while the session lasts | None |
| **Rust Extension** | `LOAD 'fractal.duckdb_extension'` in a database opened with `allow_unsigned_extensions` | Any DuckDB 2.0.0 on the same platform that allows unsigned extensions | `cargo build --release`, then the metadata appended in Julia |

## Requirements of Julia Functions in DuckDB

| Tab | Needed beforehand | Fetched by the code |
|---|---|---|
| **Julia Function** | DuckDB.jl and Tables.jl in the environment | Nothing |
| **Rust Extension** | DuckDB.jl and Tables.jl, Rust with cargo (rustup, from rustup.rs; the code also looks in `~/.cargo/bin`), Rust 1.85 or later for the 2024 edition, and DuckDB 2.0.0 | duckdb-neo 0.20000.2 and the crates it uses, downloaded by cargo at the first build |

In Pollis, `using DuckDB` loads DuckDB.jl on the engine Pollis ships, DuckDB 2.0.0.

## Inputs of Julia Functions in DuckDB

| Input | Default | Meaning |
|---|---|---|
| **Example** | Mandelbrot Set | The Mandelbrot set, or the Julia set of c |
| **Pixels Across** | 800 | Pixels across the picture, and columns of the table `pixels`; the pixels down follow from the region, with square pixels |
| **Iterations** | 256 | The most iterations of a pixel, the argument `maxiter` of `escape_time` |
| **Real Part of c** | -0.8 | The real part of c, for the Julia set only |
| **Imaginary Part of c** | 0.156 | The imaginary part of c, for the Julia set only |
| **Folder** | `programs/duckdb_extensions` of the open Pollis Workspace, else `~/.pollis/programs/duckdb_extensions` | Where the extension is built; **Choose...** picks another; shown for Rust Extension only |

## Files Written by Julia Functions in DuckDB

| File in **Folder** | What it holds |
|---|---|
| `fractal/Cargo.toml` | The crate's name, its edition, 2024, `crate-type = ["cdylib"]` and duckdb-neo with the feature `build-extension` |
| `fractal/src/lib.rs` | `escape_time` in Rust, its callback `EscapeTime`, and the entry point that registers it |
| `fractal/target/release/` | The library cargo built: `libfractal.dylib` on macOS, `libfractal.so` on Linux, `fractal.dll` on Windows |
| `fractal/built_from.txt` | The version and platform of DuckDB and the sources the extension was built from: it is built again only when one of them changes |
| `fractal.duckdb_extension` | The library with DuckDB's metadata at its end, the file `LOAD` reads |

**Julia Function** writes no file: the database is in memory.

## Types Across the Boundary in Julia Functions in DuckDB

| SQL | Julia | Rust (duckdb-neo) |
|---|---|---|
| `DOUBLE` | `Float64` | `f64` |
| `INTEGER` | `Int32` | `i32` |
| `BIGINT` | `Int64` | `i64` |
| `BOOLEAN` | `Bool` | `bool` |
| `VARCHAR` | `String` | `String` |
| `NULL` | `missing` | `None` |

## Names Set by the Code of Julia Functions in DuckDB

| Name | What it is |
|---|---|
| `escape_time`, `pixel_count` | The Julia function for one pixel, and the count of a pixel for the chosen set |
| `julia_counts`, `duckdb_counts` | The counts from Julia, and from the query in DuckDB |
| `db`, `query` | The database in memory and the query that computes the counts |
| `sql_double` | A Julia number written for SQL, as text cast to `DOUBLE` |
| `way`, `ways` | The tab run last, and each tab run in the session with its database and query |
| `crate`, `extension`, `built_with` | The extension's crate, its file and the build command (Rust Extension) |

## Actions of Julia Functions in DuckDB

| Group | Action | Output |
|---|---|---|
| Visualise | **Picture of the Set** | DuckDB's counts as a heatmap on a log scale |
| Diagnose | **The Function in DuckDB** | `escape_time` in `duckdb_functions()`, and the extension in `duckdb_extensions()` |
| Diagnose | **Query Plan** | The plan of `EXPLAIN ANALYZE`, with the time and rows of each step |
| Diagnose | **Source and Build Command** | The extension's sources, where they are, and the build command (Rust Extension) |
| Compare | **Query Times** | The query of each tab run in the session, beside the counts in Julia alone |
| Interpret | **Pixels Inside, Counted in SQL** | The share of pixels inside, and the pixels by how fast they escaped, from SQL aggregates |

## References

<a id="ref-Qui2023c"></a>Quinn, J. (2023). Tables.jl: an interface for tables in Julia. [github.com/JuliaData/Tables.jl](https://github.com/JuliaData/Tables.jl)

## See Also

- [Overview](overview.md) · [How DuckDB Calls a Scalar Function](scalar-functions.md) · [Julia Functions Registered in a Database](julia-functions.md) · [Writing a DuckDB Extension in Rust](rust-extensions.md)
