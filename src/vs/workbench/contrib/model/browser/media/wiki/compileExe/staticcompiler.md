# Compile Julia to an Executable: Writing for StaticCompiler

How the program of the **StaticCompiler** tab of Compile Julia to an Executable is written so that it compiles with no Julia runtime: what such code cannot do, and how [StaticTools.jl](#ref-Kel...2026a) replaces arrays, strings, files and printing.

## What Can a Program of StaticCompiler Not Do?

[StaticCompiler.jl](#ref-Sho2026a) compiles a function without `libjulia`, the library that holds the Julia runtime, and its documentation lists what that rules out. Memory managed by the garbage collector does not work, so ordinary arrays, strings and dictionaries cannot be created; neither do global variables that need to be allocated. Every function called inside the compiled one must be inlined or return a native type, since a result of another type would need memory from the garbage collector. Code that is not type-stable cannot be compiled. An error can be thrown only where an explicit replacement has been given with `@device_override`. The function `fractal` of the other two tabs breaks the first rule, with `Vector{Int32}` for the counts, `Vector{String}` for the arguments and `parse` on strings, so the **StaticCompiler** tab writes the program again, as `static_main`, with StaticTools.

## How Does a Program of StaticCompiler Get Memory?

StaticTools provides arrays whose memory comes from the C library's `malloc` instead of the garbage collector. `MallocArray{Int32}(undef, height, width)` in `static_main` takes memory for the counts, of the shape of a Julia matrix and with the same column order, and `pointer(counts)` gives the address that `fill_counts` writes to. Nothing frees such memory on its own: the program calls `free(counts)` once the counts are written. The StaticCompiler documentation also suggests Bumper.jl, for memory taken and given back in blocks: StaticTools exports its macros `@no_escape` and `@alloc`, with a buffer of its own, `MallocSlabBuffer`. `fill_counts` itself needs no memory of its own: it writes into memory it is given, which is why the same function runs in all three tabs.

## How Does a Program of StaticCompiler Use Strings?

A Julia `String` lives in memory of the garbage collector, so a program with no runtime uses the string types of StaticTools. `c"wb"` and `c"%lld\n"` in `static_main` are `StaticString`s: the characters are fixed when the code is compiled, end with the zero byte that C functions expect, and are held on the stack, like a tuple, so they need no memory from the garbage collector. `MallocString(argv, 3)` gives the third word of the command line, the name of the counts file, as a `MallocString` around the memory the operating system already holds for it; the program does not own that memory and does not free it. `argparse(T, argv, i)` reads word `i` of the command line as a number of type `T`, with the same wrapping.

## How Does a Program of StaticCompiler Write a File and Print?

Julia's own files and printing go through the runtime, so StaticTools reaches the C library directly, through `llvmcall`, with functions that keep the C names. `fopen(name, c"wb")` opens the picture or the counts file for writing in binary mode, which on Windows keeps the bytes from being changed as text would be; `fwrite(file, counts)` writes the memory of a `MallocArray` as it is, 4 bytes per `Int32`, column by column; `fclose(file)` closes it. `printf(c"%lld\n", inside)` prints the number of pixels inside with the C library's `printf`. The files have the same layout as those the programs of juliac and PackageCompiler write with `write`, so the session reads all three with the same code. The C library's `system`, which opens the picture after a double-click, has no function in StaticTools, so the program calls it with `@symbolcall`, the macro of StaticTools that calls a C function by its name through `llvmcall`.

## Why Does static_main Convert with % Int32?

The example and the most iterations reach `fill_counts` as `Int32`. `argparse(Int32, argv, i)` would read them through `Int32(...)` of an `Int64`, which throws an `InexactError` when the number does not fit, and a program of StaticCompiler may not throw. `static_main` therefore reads them as `Int64` and converts with `% Int32`, which keeps the lowest 32 bits and cannot fail. `escape_time` follows the same rule: its counter starts at `zero(maxiter)` and grows by `one(maxiter)`, so it stays an `Int32` with no conversion. Checks of array bounds would also be errors, which is one reason `fill_counts` writes with `unsafe_store!` and not by indexing an array.

## Where Does StaticCompiler Work?

StaticCompiler generates its code with GPUCompiler.jl and links the program with the `clang` and `lld` it brings as Julia packages, so the **StaticCompiler** tab needs no C compiler of the system. Its continuous integration tests run on Julia 1.11 and 1.12. Its documentation describes Windows as extra experimental, and expected to work under the Windows Subsystem for Linux. StaticTools describes itself as experimental as well, and calls the subset of Julia it allows unsafe Julia: the same subset as code that works with C objects through pointers, where a mistake in the handling of memory is not caught by Julia.

## References

<a id="ref-Sho2026a"></a>Short, T. (2026). StaticCompiler.jl: Compiles Julia code to a standalone library (experimental). [github.com/tshort/StaticCompiler.jl](https://github.com/tshort/StaticCompiler.jl)

<a id="ref-Kel...2026a"></a>Keller, C. B. (2026). StaticTools.jl: Enabling StaticCompiler.jl-based compilation of (some) Julia code to standalone native binaries by avoiding GC allocations and llvmcall-ing all the things! [github.com/brenhinkeller/StaticTools.jl](https://github.com/brenhinkeller/StaticTools.jl)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Entry Points and Arguments](entry-points.md) · [Start-Up Time](startup.md) · [Shipping an Executable](shipping.md)
