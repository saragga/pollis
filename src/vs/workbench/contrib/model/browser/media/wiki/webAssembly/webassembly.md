# Compile Julia to WebAssembly: What Is WebAssembly

What a WebAssembly module is, what its code can reach, how a web page compiles and calls it, and why its arithmetic gives the same numbers as Julia's. WebAssembly was designed together by the makers of the major browsers, as [Haas, Rossberg, Schuff, Titzer, Holman, Gohman, Wagner, Zakai and Bastien (2017)](#ref-HRSTH...2017a) describe.

## What Is a WebAssembly Module?

A WebAssembly module is a file of compiled code in a compact binary format, usually with the extension `.wasm`, that any browser and many other programs can run on any processor. It holds functions written in the instructions of a small virtual machine, which work on a few types of numbers: 32-bit and 64-bit integers, `i32` and `i64`, and 32-bit and 64-bit floating-point numbers, `f32` and `f64`. A module lists its imports, the functions it needs from the program that runs it, and its exports, the functions and memory it offers. The program checks the whole module before it runs any of it, that every function uses its values with the right types, and then compiles it to the instructions of the processor. A module is therefore close to a shared library, with a format and a set of instructions that are the same everywhere.

## What Can WebAssembly Code Reach?

WebAssembly code runs in a sandbox. It can read and write its own linear memory, one array of bytes that grows in pages of 64 KiB, and call the functions it imports, and nothing else: no files, no network, no memory of the page or of the browser. An address in a module is an offset into its linear memory, checked against its size, so a wrong address stops the module with an error rather than reaching anything outside. A module that should draw, read a file or print does so through functions that the page passes in as imports. The modules of Compile Julia to WebAssembly import nothing; the page reads their results from what their functions return, or from their memory.

## How Does a Web Page Compile and Call a WebAssembly Module?

A page passes the bytes of the module to `WebAssembly.instantiate(bytes, imports)`, which checks and compiles the module, connects its imports, and returns an instance whose `exports` are ordinary JavaScript functions. Calling `instance.exports.escape_time(0.0, 0.0, -0.5, 0.5, 256)` converts each JavaScript number to the type of the parameter, runs the WebAssembly function and converts its result back. A page whose Content-Security-Policy restricts its scripts may compile WebAssembly only when the policy allows it with `'wasm-unsafe-eval'`, which the page of Compile Julia to WebAssembly asks for. Browsers compile a module first with a fast compiler and recompile the functions that run often with an optimising one, so the first calls can be slower than the next.

## Why Do the Numbers of WebAssembly Agree with Julia's?

The floating-point instructions of WebAssembly follow IEEE 754, with rounding to the nearest value, as Julia's `Float64` arithmetic does on every processor Julia runs on. WebAssembly has no instruction that fuses a multiplication and an addition of single numbers into one rounding, and compilers to WebAssembly do not fuse them unless the code asks, so each operation of `escape_time` rounds once, as in Julia. JavaScript numbers are 64-bit floating-point numbers too, so the arguments the page passes reach the module unchanged. The only freedom the standard leaves is in the bits of a NaN, a value the example never produces. The same operations in the same order therefore give the same counts, to the last pixel.

## References

<a id="ref-HRSTH...2017a"></a>Haas, A., Rossberg, A., Schuff, D. L., Titzer, B. L., Holman, M., Gohman, D., Wagner, L., Zakai, A. and Bastien, J. F. (2017). Bringing the web up to speed with WebAssembly. *Proceedings of the 38th ACM SIGPLAN Conference on Programming Language Design and Implementation (PLDI 2017)*, 185–200. [doi:10.1145/3062341.3062363](https://doi.org/10.1145/3062341.3062363)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Compiling Rust to WebAssembly](rust-to-webassembly.md) · [WebAssemblyCompiler.jl](webassemblycompiler.md) · [Running WebAssembly in the Page](live-view.md)
