# Compile Julia to an Executable: Overview

Compile Julia to an Executable turns one Julia program into a native executable, a file the operating system runs without a Julia session, with three tools: juliac of [JuliaC.jl](#ref-JLC2026a), [PackageCompiler.jl](#ref-JLC2026b) and [StaticCompiler.jl](#ref-Sho2026a), the last with [StaticTools.jl](#ref-Kel...2026a). The program computes the Mandelbrot set or the Julia set of a point c, and Julia checks what it writes, pixel by pixel.

## What Do the Three Tools of Compile Julia to an Executable Do?

**JuliaC** runs `juliac --output-exe fractal --bundle <folder> --trim=safe`, which keeps only the code reachable from the program's `@main` function and gathers the program and the Julia libraries it needs into one folder; it requires Julia 1.12 or later. **PackageCompiler** runs `create_app` on a small package, Fractal, whose function `julia_main` is where the program starts, and makes an app folder with a whole system image, so that the program keeps all of Julia, its compiler included. **StaticCompiler** runs `compile_executable` on a function of the session, `static_main`, which receives the command line as a C program does, and makes one small file with no Julia runtime. The decision table of the page names the deciding difference: a trimmed runtime, the whole runtime, or no runtime.

## What Does the Program of Compile Julia to an Executable Do?

Every tab builds a program, `fractal`, with the same command line: `fractal counts.bin height width x0 y0 spacing julia_set cr ci maxiter`. The program reads the size of the picture, the corner of the region, the distance between pixels, the example and the point c from its arguments. It takes memory for the counts, calls `fill_counts`, the same Julia function as in Compile Julia to a Shared Library, writes the count of every pixel to `counts.bin` as 32-bit integers, column by column, and prints the number of pixels inside the set. The count of a pixel is the number of iterations of z → z^2 + c before |z| passes 2, for the sets that carry the names of [Julia (1918)](#ref-Jul1918a) and [Mandelbrot (1980)](#ref-Man1980a). The JuliaC and PackageCompiler tabs share the function `fractal(args)`, which does all of this in ordinary Julia; the StaticCompiler tab writes it again with StaticTools, as `static_main(argc, argv)`.

## How Does Each Tab of Compile Julia to an Executable Work?

Each tab first runs `fill_counts` in the Julia session, on a Julia matrix passed by its pointer, which gives Julia's counts. **Build** compiles the program into a folder for the tool in **Folder**, `programs/executables` of the open Pollis Workspace by default, and skips the build while the source and the Julia version are those the program was built from. **Run** starts the program with the inputs as arguments, reads the number it prints and the counts it wrote. **Check** counts the pixels where the program and Julia disagree, and the last lines print where the program is and the command that runs it. Each tab also writes the whole program as a Julia script, `fractal.jl`, for **Start-Up and Run Time**. The inputs of the example are **Example**, **Pixels Across**, **Iterations**, **Real Part of c** and **Imaginary Part of c**; they reach the program on its command line, so a change of input runs the same program again without a new build.

## How Does Compile Julia to an Executable Check the Program?

The program and the session compute the counts with the same Julia function, so they perform the same floating-point operations in the same order, and the counts have to agree at every pixel. The numbers cross the command line as text, written by `repr`, which gives the shortest decimal that reads back to the same `Float64`, so the program starts from exactly the corner, spacing and c of the session. The check prints the number of pixels whose counts differ, expected to be zero, and sets the number of pixels inside that the program printed beside the one `fill_counts` returned in the session. A difference means that the program read its arguments differently from the session, or that the tool compiled other code than the session runs.

## Why Does Compile Julia to an Executable Compare with julia Running a Script?

The usual way to run a Julia program without an executable is `julia fractal.jl` followed by the arguments: julia starts, loads the file, compiles the functions the first time they are called, and then runs them. A compiled executable skips that compilation, as its code is compiled before it is shipped, and the main reason to build one is to start faster and to run where Julia is not installed. **Start-Up and Run Time** therefore runs `julia --startup-file=no fractal.jl` with the same arguments, beside each tool's program, and beside `fill_counts` alone in the session, which has no start-up at all. The script is the same source that the **JuliaC** tab compiles, so the comparison is between one program run in two ways.

## What Do the Actions of Compile Julia to an Executable Add?

**Picture of the Set** draws the counts the program wrote as a heatmap on a log scale. **Source and Build Command** prints the Julia source the tool compiled, the call that built the program and the command that runs it. **Program Contents** gives the size of the program, the number of files and the size of the folder that goes with it, and the libraries it needs when it runs (`otool -L` on macOS, `ldd` on Linux). **Sizes and Build Times** sets side by side the tools whose tabs were run in the session. **Start-Up and Run Time** runs each program five times and keeps the fastest. **Share of Pixels Inside** gives the share of pixels that did not escape and the area they cover.

## References

<a id="ref-JLC2026a"></a>JuliaLang Contributors (2026). JuliaC.jl: CLI app for compiling and bundling julia binaries, especially trimmed ones. [github.com/JuliaLang/JuliaC.jl](https://github.com/JuliaLang/JuliaC.jl)

<a id="ref-JLC2026b"></a>JuliaLang Contributors (2026). PackageCompiler.jl: Compile your Julia Package. [github.com/JuliaLang/PackageCompiler.jl](https://github.com/JuliaLang/PackageCompiler.jl)

<a id="ref-Sho2026a"></a>Short, T. (2026). StaticCompiler.jl: Compiles Julia code to a standalone library (experimental). [github.com/tshort/StaticCompiler.jl](https://github.com/tshort/StaticCompiler.jl)

<a id="ref-Kel...2026a"></a>Keller, C. B. (2026). StaticTools.jl: Enabling StaticCompiler.jl-based compilation of (some) Julia code to standalone native binaries by avoiding GC allocations and llvmcall-ing all the things! [github.com/brenhinkeller/StaticTools.jl](https://github.com/brenhinkeller/StaticTools.jl)

<a id="ref-Jul1918a"></a>Julia, G. (1918). Mémoire sur l'itération des fonctions rationnelles. *Journal de Mathématiques Pures et Appliquées* 1, 47–245. [numdam.org](http://www.numdam.org/item/JMPA_1918_8_1__47_0/)

<a id="ref-Man1980a"></a>Mandelbrot, B. B. (1980). Fractal aspects of the iteration of z → λz(1 − z) for complex λ and z. *Annals of the New York Academy of Sciences* 357(1), 249–259. [doi:10.1111/j.1749-6632.1980.tb29690.x](https://doi.org/10.1111/j.1749-6632.1980.tb29690.x)

## See Also

- [Factsheet](factsheet.md) · [Entry Points and Arguments](entry-points.md) · [Start-Up Time](startup.md) · [Writing for StaticCompiler](staticcompiler.md) · [Shipping an Executable](shipping.md)
