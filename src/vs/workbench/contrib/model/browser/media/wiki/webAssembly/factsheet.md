# Compile Julia to WebAssembly: Factsheet

The steps, inputs, files, exports and requirements of Compile Julia to WebAssembly at a glance.

## Steps of Compile Julia to WebAssembly

| Step | What it does | Where it runs |
|---|---|---|
| **The Function** | Defines the example, `escape_time` and `fractal_counts`, and computes `counts` | The Julia REPL |
| **Compile** | Writes the sources of the way chosen to its folder, then builds the module `fractal.wasm` | The Julia REPL, which starts cargo or a Julia 1.10 |
| **Check** | Runs the module on the example, saves `counts.bin`, then compares it with `counts` | The page, then the Julia REPL |
| **Live View** | Draws the example with the module at each zoom or move, with the time of each picture | The page |

## Next Steps of Compile Julia to WebAssembly

| Next Step | What it does | Where it runs |
|---|---|---|
| **The Same in JavaScript** | `escape_time` and the loop over the pixels in JavaScript, timed beside each module built, the fastest of five runs, with the pixels where the counts differ | The page |

## Inputs of Compile Julia to WebAssembly

| Input | Step | Default | Meaning |
|---|---|---|---|
| **Example** | The Function | Mandelbrot Set | The Mandelbrot set, or the Julia set of c |
| **Pixels Across** | The Function | 800 | A whole number from 16 to 4000 |
| **Iterations** | The Function | 256 | The most iterations of a pixel, from 1 to 100000 |
| **Real Part of c**, **Imaginary Part of c** | The Function | -0.8, 0.156 | The c of the Julia set, as decimal numbers; shown for the Julia set only |
| **Way** | Compile, Live View | Through Rust | Through Rust, or With WebAssemblyCompiler.jl; one choice, shown in both steps |
| **Folder** | Compile | `programs/webassembly` of the open Pollis Workspace, else `~/.pollis/programs/webassembly` | Where both ways build; **Choose...** picks another |

## Files of Compile Julia to WebAssembly

| File in **Folder** | Written by | What it holds |
|---|---|---|
| `rust/fractal/Cargo.toml`, `rust/fractal/src/lib.rs` | Compile, Through Rust | The crate: a `cdylib` of edition 2024, built with `panic = "abort"` and `lto = true` |
| `rust/fractal.wasm` | Compile, Through Rust | The module, copied from the crate's `target/wasm32-unknown-unknown/release` |
| `webassemblycompiler/compile.jl` | Compile, With WebAssemblyCompiler.jl | The script that Julia 1.10 runs |
| `webassemblycompiler/Project.toml`, `Manifest.toml` | Julia 1.10, once | The project where WebAssemblyCompiler.jl is installed |
| `webassemblycompiler/fractal.wasm`, `.wasm.wat`, `.wasm.js` | WebAssemblyCompiler.jl | The module, its text, and the imports of a module that calls JavaScript |
| `webassemblycompiler/built_from.txt`, `compile.log`, `install.log` | Compile | The script the module was made from, and the messages of each run |
| `rust/counts.bin`, `webassemblycompiler/counts.bin` | Check | The counts the page computed, row after row from the bottom, each an `Int32` |

## Exports of the Modules of Compile Julia to WebAssembly

| Export | Rust module | WebAssemblyCompiler.jl module | What it does |
|---|---|---|---|
| `escape_time(zr, zi, cr, ci, maxiter)` | Yes | Yes | The count of one pixel: four `f64` and an `i32` in, an `i32` out |
| `fill_counts(counts, height, width, x0, y0, spacing, julia_set, cr, ci, maxiter)` | Yes | No | The counts of a whole picture, written into the module's memory |
| `alloc_counts(n)`, `free_counts(counts, n)` | Yes | No | Room for n counts in the module's memory, and its release |
| `memory` | Yes | No | The module's linear memory, which the page reads the counts from |

## Requirements of Compile Julia to WebAssembly

| Need | For | Where to get it |
|---|---|---|
| Rust 1.85 or later, with cargo and rustup | Through Rust | rustup, from rustup.rs; the code also looks in `~/.cargo/bin` and adds the target `wasm32-unknown-unknown` once |
| Julia 1.10, through juliaup | With WebAssemblyCompiler.jl | `juliaup add 1.10`, in a terminal |
| WebAssemblyCompiler.jl | With WebAssemblyCompiler.jl | Installed by the code of Compile, once, in the project of its folder |

## See Also

- [Overview](overview.md) · [What Is WebAssembly](webassembly.md) · [Compiling Rust to WebAssembly](rust-to-webassembly.md) · [WebAssemblyCompiler.jl](webassemblycompiler.md) · [Running WebAssembly in the Page](live-view.md)
