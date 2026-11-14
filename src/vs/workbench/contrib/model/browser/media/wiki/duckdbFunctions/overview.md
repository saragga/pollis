# Julia Functions in DuckDB: Overview

Julia Functions in DuckDB calls a Julia function from SQL, in [DuckDB](#ref-RM2019a), in two ways: **Julia Function** registers the function in a database opened from the Julia session with [DuckDB.jl](#ref-RM2026a), and **Rust Extension** compiles the same function, written in Rust with [duckdb-neo](#ref-DDBL2026a), into an extension that DuckDB loads. In both, one query computes the Mandelbrot set or the Julia set of a point c over a table of pixels, and Julia checks the counts pixel by pixel.

## What Are the Two Ways of Julia Functions in DuckDB?

A scalar function takes the values of one row and returns one value, as `abs` or `round` do; DuckDB lets a program add its own. **Julia Function** writes `escape_time` in Julia and hands it to DuckDB with `DuckDB.@create_scalar_function` and `DuckDB.register_scalar_function`: nothing is compiled ahead, and the function can use any Julia code, but it belongs to the database object of the session and ends with it. **Rust Extension** writes the same function in Rust, builds it with cargo into a library, adds the metadata DuckDB checks, and loads the file with `LOAD`: the extension needs Rust to build, and a new build for each version of DuckDB, but any DuckDB of that version and platform can load it, from Julia, Python, Node or the command line. The decision table of the page names the deciding difference: the Julia session, or any DuckDB 2.0.0.

## Which Function Does Julia Functions in DuckDB Call from SQL?

`escape_time(zr, zi, cr, ci, maxiter)` returns the number of iterations of z → z^2 + c, with z starting at zr + zi i, before |z| passes 2, or `maxiter` when it never does: the function of Mix Julia with Compiled Code, for the sets that carry the names of [Julia (1918)](#ref-Jul1918a) and [Mandelbrot (1980)](#ref-Man1980a). The query chooses the set by its arguments. For the Mandelbrot set it calls `escape_time(0.0, 0.0, x, y, maxiter)`, z starting at 0 and c at the pixel; for the Julia set of c it calls `escape_time(x, y, cr, ci, maxiter)`, z starting at the pixel and c fixed. The function's types are declared on both sides: four `DOUBLE` arguments and an `INTEGER`, returning an `INTEGER`, which are `Float64` and `Int32` in Julia and `f64` and `i32` in Rust.

## How Does Each Tab of Julia Functions in DuckDB Work?

Each tab first computes the count of every pixel in Julia, `julia_counts`, for the check. It then opens a DuckDB database in memory and creates the table `pixels`, one row for each pixel with its row `i`, its column `j` and its coordinates `x` and `y`, computed in SQL from the same numbers as in Julia. **Julia Function** registers `escape_time`; **Rust Extension** writes the crate to `fractal/` in **Folder**, builds it when its sources or the version of DuckDB changed, and loads `fractal.duckdb_extension`. The query `SELECT i, j, escape_time(...) AS steps FROM pixels` then computes every count in DuckDB, and the tab puts the rows back into a matrix, `duckdb_counts`. The inputs are those of the other pages of Compilation Lab: **Example**, **Pixels Across**, **Iterations**, **Real Part of c** and **Imaginary Part of c**.

## How Does Julia Functions in DuckDB Check the Counts?

DuckDB stores `DOUBLE` values as IEEE 754 doubles, the same numbers as Julia's `Float64`, so the coordinates of a pixel computed in SQL, `x0 + (j - 1) * spacing`, are the ones Julia computes, provided the numbers reach SQL unchanged. The code writes each number as text with `repr`, which gives the shortest decimal that reads back to the same `Float64`, and casts it to `DOUBLE`: a number written in SQL without the cast is read as a `DECIMAL` first. The function then makes the same operations in the same order in both languages, so the count of every pixel must agree exactly with Julia's, and the tab prints the number of pixels that differ, expected to be zero, and the time the query took.

## What Do the Actions of Julia Functions in DuckDB Add?

**Picture of the Set** draws DuckDB's counts as a heatmap on a log scale. **The Function in DuckDB** shows `escape_time` as `duckdb_functions()` lists it, with its parameters and types, and for the extension the row of `duckdb_extensions()`. **Query Plan** prints the plan of `EXPLAIN ANALYZE`, with the time and the rows of each step. **Source and Build Command** prints the extension's `Cargo.toml` and `src/lib.rs` and the command that built them. **Query Times** runs the query of each way run in the session five times, beside the counts computed in Julia alone. **Pixels Inside, Counted in SQL** uses the function inside SQL aggregates: the share of pixels that did not escape, and the pixels grouped by how fast they escaped.

## References

<a id="ref-RM2019a"></a>Raasveldt, M. and Mühleisen, H. (2019). DuckDB: an embeddable analytical database. *Proceedings of the 2019 International Conference on Management of Data (SIGMOD)*, 1981–1984. [doi:10.1145/3299869.3320212](https://doi.org/10.1145/3299869.3320212)

<a id="ref-RM2026a"></a>Raasveldt, M. and Mühleisen, H. (2026). DuckDB.jl: the DuckDB Julia package. [github.com/duckdb/DuckDB.jl](https://github.com/duckdb/DuckDB.jl)

<a id="ref-DDBL2026a"></a>DuckDB Labs and contributors (2026). duckdb-neo: ergonomic wrapper for DuckDB's v2 C API (beta). [github.com/duckdb/duckdb-rs](https://github.com/duckdb/duckdb-rs)

<a id="ref-Jul1918a"></a>Julia, G. (1918). Mémoire sur l'itération des fonctions rationnelles. *Journal de Mathématiques Pures et Appliquées* 1, 47–245. [numdam.org](http://www.numdam.org/item/JMPA_1918_8_1__47_0/)

<a id="ref-Man1980a"></a>Mandelbrot, B. B. (1980). Fractal aspects of the iteration of z → λz(1 − z) for complex λ and z. *Annals of the New York Academy of Sciences* 357(1), 249–259. [doi:10.1111/j.1749-6632.1980.tb29690.x](https://doi.org/10.1111/j.1749-6632.1980.tb29690.x)

## See Also

- [Factsheet](factsheet.md) · [How DuckDB Calls a Scalar Function](scalar-functions.md) · [Julia Functions Registered in a Database](julia-functions.md) · [Writing a DuckDB Extension in Rust](rust-extensions.md)
