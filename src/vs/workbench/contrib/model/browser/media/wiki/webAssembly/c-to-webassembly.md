# Compile Julia to WebAssembly: Compiling C to WebAssembly

How the Through C way of Compile Julia to WebAssembly builds its module: the compiler and the linker it takes from Julia packages, the functions the page calls, the memory the module manages without a C library, and the size of the module. clang and wasm-ld are parts of LLVM, described by [Lattner and Adve (2004)](#ref-LA2004a).

## Where Do clang and wasm-ld Come From in the Through C Way?

The Through C way installs no compiler of its own. Clang_jll and LLD_jll are Julia packages that carry clang, the C compiler of LLVM, and lld, its linker, built for the computer at hand, as Julia packages carry other libraries. The code of Compile adds both to the project of the folder `c` once, then runs `build.jl` there with the Julia of the session. `build.jl` calls `clang()` with `--target=wasm32-unknown-unknown`, WebAssembly with 32-bit addresses and no operating system, and `lld() -flavor wasm`, which is wasm-ld, the linker that turns the object file into a module. The C compilers that come with an operating system, such as Apple's, often lack the WebAssembly target, so the packages give the same compiler on macOS, Linux and Windows.

## How Does a C Function Become an Export of the Module?

A C function is compiled into the module under its own name, but wasm-ld exports only what it is asked to. In `fractal.c`, each function the page calls is marked `__attribute__((export_name("escape_time")))`, or the name of the function, which makes it an export under that name. The module has no entry point, so `--no-entry` tells wasm-ld not to look for `main`, and `--strip-all` leaves out the names of the functions inside, which the exports do not need. The functions take and return only numbers: `double` for a `Float64`, `int` for an `Int32`, and an `int *`, a 32-bit address, for the counts. The module exports the same functions as the Rust module, `escape_time`, `fill_counts`, `alloc_counts` and `free_counts`, and its `memory`, so the page calls the two in the same way.

## How Does a C Module Without a C Library Make Room for the Counts?

`build.jl` compiles with `-ffreestanding -nostdlib`: there is no C library in the module, and so no `malloc`. `fractal.c` manages the memory itself. wasm-ld sets the symbol `__heap_base` where the module's own data ends, and `alloc_counts(n)` takes room for n counts from there on, at an address aligned to 16 bytes. When the memory is too small, `__builtin_wasm_memory_grow` adds pages of 64 KiB, as many as the counts need, and `__builtin_wasm_memory_size` gives the pages there are. `free_counts` gives the room back when it is the last room taken, which is how the page uses it: one room for each picture size, given back before the next. The page reads the counts through the exported `memory` as an `Int32Array`, as with the Rust module.

## Why Does the Through C Way Compile with -ffp-contract=off?

A C compiler may contract a multiplication followed by an addition into one fused multiply-add, which rounds once instead of twice and so can give a different last bit. A different last bit changes the count of some pixels near the edge of the set. Julia contracts nothing unless asked, with `@fastmath` or `muladd`, so `-ffp-contract=off` keeps each multiplication and each addition of `fractal.c` apart, as in `escape_time`. WebAssembly itself has no fused multiply-add for single numbers, so the flag only makes sure that clang does not contract the operations before they reach WebAssembly. With it, the C module performs the operations of the Julia function in the same order, on the same 64-bit numbers.

## Why Is the C Module Smaller than the Rust Module?

A module holds the code of its functions and whatever that code calls. The C module calls nothing beyond `fractal.c`: its loops, its arithmetic and the two built-in memory instructions, so its module holds little more than those four functions. The Rust module also holds the parts of Rust's standard library that the crate reaches, such as the allocator behind `Vec` and the code that reports a panic, which `lto = true` and `panic = "abort"` reduce but do not remove. Compile prints the size of each module once it is built, and **Compare the Ways**, in Next Steps, sets the sizes side by side. The functions that compute the counts are the same in both, so their times are close.

## References

<a id="ref-LA2004a"></a>Lattner, C. and Adve, V. (2004). LLVM: A Compilation Framework for Lifelong Program Analysis and Transformation. In *International Symposium on Code Generation and Optimization (CGO 2004)*, 75–86. IEEE. [doi:10.1109/CGO.2004.1281665](https://doi.org/10.1109/CGO.2004.1281665)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [What Is WebAssembly](webassembly.md) · [Compiling Rust to WebAssembly](rust-to-webassembly.md) · [WebAssemblyCompiler.jl](webassemblycompiler.md) · [Running WebAssembly in the Page](live-view.md)
