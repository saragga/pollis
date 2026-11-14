# Compile Julia to a Shared Library: Overview

Compile Julia to a Shared Library compiles one Julia function, `fill_counts`, into a shared library that programs written in other languages can call, with three tools: juliac of [JuliaC.jl](#ref-JLC2026a), [PackageCompiler.jl](#ref-JLC2026b) and [StaticCompiler.jl](#ref-Sho2026a). A small C program, linked against the library, computes the Mandelbrot set or the Julia set of a point c, and Julia checks its counts pixel by pixel.

## What Do the Three Tools of Compile Julia to a Shared Library Do?

The three tabs compile the same Julia source in three different ways. **JuliaC** runs `juliac --output-lib --compile-ccallable --trim=safe`, which compiles only the code that `fill_counts` can reach, together with the parts of the Julia runtime it needs; it requires Julia 1.12 or later. **PackageCompiler** runs `create_library` on a small package, Fractal, and builds a library that holds a whole system image and the Julia runtime, which the calling program starts itself. **StaticCompiler** runs `compile_shlib` on the function of the session and compiles it with no Julia runtime at all, which works only for code that never allocates memory and never throws an error. The decision table of the page names the deciding difference between them: a trimmed runtime, the whole runtime, or no runtime.

## Why Does Compile Julia to a Shared Library Use One Function for Every Tool?

`fill_counts` is written so that all three tools can compile it. It takes only native types, a pointer, integers and floating-point numbers, and returns one, an `Int64`, the number of pixels inside the set, because StaticCompiler warns that any other return type can lead to undefined behaviour. It allocates nothing: the counts go into memory the caller owns, written with `unsafe_store!`, column by column. It throws no error: `escape_time` counts its iterations in an `Int32` that starts at `zero(maxiter)` and grows by `one(maxiter)`, so no conversion can fail. The same iteration as in Mix Julia with Compiled Code, z → z^2 + c with the test `zr2 + zi2 > 4`, gives the count of each pixel, for the sets that carry the names of [Julia (1918)](#ref-Jul1918a) and [Mandelbrot (1980)](#ref-Man1980a). JuliaC and PackageCompiler compile the function marked with `Base.@ccallable`, which gives it a C name and C types; StaticCompiler compiles it as it is, under its own name.

## How Does Each Tab of Compile Julia to a Shared Library Work?

Each tab first runs `fill_counts` in the Julia session, on a Julia matrix passed by its pointer under `GC.@preserve`, which gives Julia's counts. **Build** then compiles the library into a folder for the tool in **Folder**, `programs/shared_libraries` of the open Pollis Workspace by default, so that a library is built once and reused while its source and the Julia version stay the same. **Caller** compiles `caller.c` and links it against the library, recording the library's folder with `-Wl,-rpath` so that the program finds it when it runs. **Run** starts the program with the inputs as arguments; it fills memory of its own, writes the counts to `counts.bin` and prints the number of pixels inside. **Check** reads the file back and counts the pixels whose count differs from Julia's, and the last lines print where the library and its calling program are. The inputs are those of Mix Julia with Compiled Code: **Example**, **Pixels Across**, **Iterations**, **Real Part of c** and **Imaginary Part of c**.

## Why Does a C Program Call the Library and Not the Julia Session?

A library made by juliac or PackageCompiler carries a Julia runtime of its own: it is made for programs that are not written in Julia, such as C, C++, Python or R programs, which load it and call `fill_counts` like any C function. The Julia session already runs a Julia runtime, and loading a second one into the same process is what JuliaC's option `--privatize` exists to keep apart. Compile Julia to a Shared Library therefore calls every library from its own C program, a separate process, as the library's users would. A library of StaticCompiler has no runtime and could be opened in the Julia session with `Libdl.dlopen`, but it is called from the same C program, so that the three tabs check their libraries in the same way.

## How Does Compile Julia to a Shared Library Check the Library?

The library and the Julia session run the same Julia function, compiled twice, so they make the same floating-point operations in the same order, and Julia does not fuse a multiplication and an addition unless the code asks for it. Their counts must therefore agree exactly, at every pixel, and the check reports the number of pixels that differ, expected to be zero. A second check compares the number of pixels inside the set: the one `fill_counts` returns in the C program, printed to its output, and the one it returns in the session. A difference in either check means that the tool compiled something other than the function the session runs, or that the C program passed the inputs differently.

## What Do the Actions of Compile Julia to a Shared Library Add?

**Picture of the Set** draws the library's counts as a heatmap on a log scale. **Source and Build Command** prints the Julia source the tool compiled, the C program, and the commands that built both. **Library Contents** gives the size of the library and of the folder it comes in, the libraries it needs when it runs (`otool -L` on macOS, `ldd` on Linux), and its own functions among the names it exports. **Sizes and Build Times** sets the tools whose tabs were run in the session side by side. **Start-Up and Call Time** runs each tool's program five times and keeps the fastest, which includes starting the program and the library's runtime, beside the time of `fill_counts` alone in the session. **Share of Pixels Inside** gives the share of pixels that did not escape and the area they cover.

## References

<a id="ref-JLC2026a"></a>JuliaLang Contributors (2026). JuliaC.jl: CLI app for compiling and bundling julia binaries, especially trimmed ones. [github.com/JuliaLang/JuliaC.jl](https://github.com/JuliaLang/JuliaC.jl)

<a id="ref-JLC2026b"></a>JuliaLang Contributors (2026). PackageCompiler.jl: Compile your Julia Package. [github.com/JuliaLang/PackageCompiler.jl](https://github.com/JuliaLang/PackageCompiler.jl)

<a id="ref-Sho2026a"></a>Short, T. (2026). StaticCompiler.jl: Compiles Julia code to a standalone library (experimental). [github.com/tshort/StaticCompiler.jl](https://github.com/tshort/StaticCompiler.jl)

<a id="ref-Jul1918a"></a>Julia, G. (1918). Mémoire sur l'itération des fonctions rationnelles. *Journal de Mathématiques Pures et Appliquées* 1, 47–245. [numdam.org](http://www.numdam.org/item/JMPA_1918_8_1__47_0/)

<a id="ref-Man1980a"></a>Mandelbrot, B. B. (1980). Fractal aspects of the iteration of z → λz(1 − z) for complex λ and z. *Annals of the New York Academy of Sciences* 357(1), 249–259. [doi:10.1111/j.1749-6632.1980.tb29690.x](https://doi.org/10.1111/j.1749-6632.1980.tb29690.x)

## See Also

- [Factsheet](factsheet.md) · [Trimming and What It Leaves Out](trimming.md) · [Libraries with and without a Runtime](runtimes.md) · [Shipping a Library](shipping.md)
