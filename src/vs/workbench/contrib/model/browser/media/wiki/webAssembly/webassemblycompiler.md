# Compile Julia to WebAssembly: WebAssemblyCompiler.jl

How [WebAssemblyCompiler.jl](#ref-Sho2026b) compiles a Julia function to WebAssembly, what Julia code it can compile, why the page runs it in Julia 1.10, and the files it writes.

## How Does WebAssemblyCompiler.jl Compile a Julia Function?

`compile((escape_time, Float64, Float64, Float64, Float64, Int32); filepath = "fractal.wasm")` takes a function and the types of its arguments, as a tuple, and asks Julia for the typed code of that method: the code after Julia has inferred the type of every value. WebAssemblyCompiler.jl then translates that code, statement by statement, into the instructions of Binaryen, a library of the WebAssembly project that builds, checks and writes modules, and Binaryen arranges Julia's blocks and jumps into the loops and branches that WebAssembly requires. Each function the method calls is compiled too. The function is exported under its Julia name, so the module of the page exports `escape_time`, with four `f64` and an `i32` as parameters and an `i32` as result, the types Julia inferred.

## What Julia Code Can WebAssemblyCompiler.jl Compile?

The package is experimental, and its documentation says to expect errors and failures. It compiles code that is type-stable, with no dynamic dispatch, and supports numbers, strings, symbols, tuples, structs, vectors of plain types and dictionaries, keeping what the code allocates on the heap of the browser's garbage collector for WebAssembly, which needs a recent browser. It does not support pointers, matrices and other arrays of more than one dimension, unions of types, exceptions and errors, some integer types, and anything that calls C, BLAS included. A function such as `escape_time`, which works on numbers alone and allocates nothing, is within what it compiles; `fractal_counts`, which fills a matrix, is not.

## Why Does WebAssemblyCompiler.jl Run in Julia 1.10?

WebAssemblyCompiler.jl reads the compiler's internals of the Julia it runs in, which change from one version of Julia to the next. Its only release requires GPUCompiler.jl 0.24, which installs on Julia 1.11 at the latest, so the package cannot be installed in a session of Julia 1.12 or later. The code of Compile starts a separate Julia 1.10, on which the package compiles the example, through the launcher of juliaup, `julia +1.10`, with a project of its own in the folder `webassemblycompiler`, where it installs the package the first time. Julia 1.10 cannot precompile the package and prints errors about it at each start, which the code keeps in `compile.log`; the package then loads without a cache, which takes a few seconds more each time.

## What Files Does WebAssemblyCompiler.jl Write?

Besides `fractal.wasm`, the module, `compile` writes `fractal.wasm.wat`, the same module in the text format of WebAssembly, with one instruction or block on each line, which shows what Julia's code became: the loop of `escape_time`, its multiplications and comparisons on `f64` values, and its counter as an `i32`. It also writes `fractal.wasm.js`, the JavaScript functions that a module calling JavaScript imports; the module of the page calls none, and the page passes an empty set of imports. The code of Compile writes `built_from.txt`, the script the module was made from, and runs Julia 1.10 again only when `compile.jl` has changed.

## Why Does the Page Call the Module of WebAssemblyCompiler.jl Once for Each Pixel?

A loop over the pixels of a picture needs memory that both the page and the module can reach: a pointer into the module's linear memory, as the Rust and C modules give. WebAssemblyCompiler.jl supports no pointers, and keeps its vectors on the garbage-collected heap, whose arrays JavaScript cannot read as numbers. Its module therefore exports `escape_time` alone, and the page runs the loop over the pixels in JavaScript, calling `escape_time` once for each pixel and writing each count into a JavaScript array. Every count is still computed by the compiled Julia function.

## References

<a id="ref-Sho2026b"></a>Short, T. (2026). WebAssemblyCompiler.jl: Create WebAssembly with Julia. [github.com/tshort/WebAssemblyCompiler.jl](https://github.com/tshort/WebAssemblyCompiler.jl)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [What Is WebAssembly](webassembly.md) · [Compiling Rust to WebAssembly](rust-to-webassembly.md) · [Compiling C to WebAssembly](c-to-webassembly.md) · [Running WebAssembly in the Page](live-view.md)
