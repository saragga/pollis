# Translate Julia to Rust: Factsheet

The steps, inputs, files, types, requirements and agent task of Translate Julia to Rust at a glance.

## Steps of Translate Julia to Rust

| Step | What it shows or runs in the Julia REPL | Tools |
|---|---|---|
| **The Function** | The example's region and `fractal_counts`, then the call; with a function of your own, the call alone | Base Julia |
| **Translate** | The example's `Cargo.toml`, `src/lib.rs` and `fractal_counts_rust`, shown, not run; **Translate with Agent** for a function of your own | Your coding agent, with the translate-to-rust skill |
| **Build** | `cargo build --release` of the example's crate, then `fractal_counts_rust`; with a function of your own, `include` of the Julia file the agent wrote | cargo, Libdl |
| **Compare** | The results of both versions checked, then a benchmark of each and `judge` | BenchmarkTools.jl |

## Inputs of Translate Julia to Rust

| Input | Step | Default | Meaning |
|---|---|---|---|
| **Function** | The Function | fractal_counts | The Julia function to translate, by name |
| **Arguments** | The Function | x0, y0, spacing, height, width, julia_set, c, maxiter | The arguments of the call, as written in it, on one line |
| **Example** | The Function | Mandelbrot Set | The Mandelbrot set, or the Julia set of c = -0.8 + 0.156i; shown only for the example |
| **Rust Version** | Translate | fractal_counts_rust | The name of the Julia function that calls the Rust version, other than the function's |

The example's crate is shown in Translate only while the function and the Rust version have the example's names; **Build**, **Compare** and **Translate with Agent** are off while the Rust version has no name of its own.

## Files of Translate Julia to Rust

| File | Written by | What it holds |
|---|---|---|
| `~/.pollis/rust/fractal/Cargo.toml` | Build, for the example | The crate's name, its edition, 2024, and `crate-type = ["cdylib"]` |
| `~/.pollis/rust/fractal/src/lib.rs` | Build, for the example | `escape_time` and `fill_counts`, the function Julia calls |
| `~/.pollis/rust/fractal/target/release/` | cargo | The library: `libfractal.dylib` on macOS, `libfractal.so` on Linux, `fractal.dll` on Windows |
| `~/.pollis/rust/fractal_counts.jl` | Translate with Agent, for the example | The example's Julia code, for the agent to read |
| `<name>/` and `<name>.jl` beside the function's file | The agent | The crate of a function of your own, and the Julia function that calls it, under the name of the Rust version |

## Types Across the Boundary in Translate Julia to Rust

| Julia | Rust | C |
|---|---|---|
| `Float64` | `f64` | `double` |
| `Int64` | `i64` | `int64_t` |
| `Int32` | `i32` | `int32_t` |
| `Bool`, passed as `Int32` | `i32`, tested with `!= 0` | `int32_t` |
| `ComplexF64`, passed as two `Float64` | two `f64` | two `double` |
| `Matrix{Int32}`, passed as `Ptr{Int32}` | `*mut i32`, read as `&mut [i32]` | `int32_t *` |

## Requirements of Translate Julia to Rust

| Need | For | Where to get it |
|---|---|---|
| Rust 1.85 or later, with cargo | Build: the crate uses the 2024 edition | rustup, from rustup.rs; Build also looks in `~/.cargo/bin` |
| BenchmarkTools.jl | Compare | Installed by the code of Compare when missing |
| A coding agent | Translate with Agent | Compose > Coding Agents; the task runs on the Strong tier of Model Tasks and Routing by default |

## See Also

- [Overview](overview.md) · [From Julia to Rust](julia-to-rust.md) · [Calling Rust from Julia](calling-rust.md) · [The Same Result in Rust](same-result.md)
