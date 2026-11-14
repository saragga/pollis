# Compile Julia to WebAssembly: Compiling Rust to WebAssembly

How the Through Rust way of Compile Julia to WebAssembly builds its module: the target, the crate, the functions the page calls, and the memory that the page and the module share. [Klabnik and Nichols (2023)](#ref-KN2023a) is the reference for the Rust.

## What Is the Rust Target wasm32-unknown-unknown?

A Rust target names the kind of machine code the compiler writes and what the code may expect around it. `wasm32-unknown-unknown` is WebAssembly with 32-bit addresses, for no known vendor and no operating system: the module expects nothing from the program that runs it beyond what it imports, which suits a web page. Rust's standard library is built for each target, and rustup downloads that of a new target with `rustup target add wasm32-unknown-unknown`, which the code of Compile runs the first time. `cargo build --release --target wasm32-unknown-unknown` then builds the crate, and the module appears in `target/wasm32-unknown-unknown/release`, under the crate's name with the extension `.wasm`.

## How Does a Rust Crate Become a WebAssembly Module?

The crate is declared a C dynamic library, `crate-type = ["cdylib"]`, as for a library that Julia opens with `@ccall`. Built for WebAssembly, the library is a module, and each function marked `#[unsafe(no_mangle)]` and `pub extern "C"` is one of its exports, under its own name. The functions take and return only numbers, which WebAssembly and JavaScript pass directly: `f64` for a `Float64`, `i32` for an `Int32`, and an `i32` for an address, since addresses are 32-bit numbers on this target. The profile of the crate builds with `panic = "abort"`, which leaves out the code that unwinds after a panic, and `lto = true`, which optimises the crate and the parts of the standard library it uses as one, so the module stays small.

## How Do a Web Page and a Rust Module Share Memory?

The page cannot pass a JavaScript array to a WebAssembly function: the function can reach only the module's own memory. The Rust module therefore exports `alloc_counts(n)`, which makes room for n counts in its memory and returns their address, kept until `free_counts` gives it back. The page calls `fill_counts` with that address, then reads the counts through the module's exported `memory`, as a JavaScript `Int32Array` over the same bytes. Memory that grows replaces the buffer JavaScript sees, so the page makes that array after each call, never before. The room is made once and used again for each picture of the same size.

## Why Does the Rust Module Compute a Whole Picture in One Call?

`fill_counts` runs the loop over the pixels inside the module, row after row from the bottom of the picture, and writes each count at `i * width + j`, counted from 0. The page makes one call for each picture, whatever its size, and the loop runs as compiled code from start to end. The module also exports `escape_time`, the count of one pixel, which the page could call once for each pixel from a JavaScript loop. Calls from JavaScript into WebAssembly cost little in current browsers, so the difference between the two may be small; the time of each picture, which Live View prints with the kind of call it made, shows it on the computer at hand.

## References

<a id="ref-KN2023a"></a>Klabnik, S. and Nichols, C. (2023). *The Rust Programming Language*, 2nd ed. San Francisco: No Starch Press. [doc.rust-lang.org/book](https://doc.rust-lang.org/book/)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [What Is WebAssembly](webassembly.md) · [WebAssemblyCompiler.jl](webassemblycompiler.md) · [Running WebAssembly in the Page](live-view.md)
