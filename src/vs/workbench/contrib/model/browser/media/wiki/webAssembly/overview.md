# Compile Julia to WebAssembly: Overview

Compile Julia to WebAssembly takes the function of one pixel of the Mandelbrot set or of the Julia set of c to WebAssembly, the portable code that web pages run, and runs the module in the page itself: first to check its count at every pixel against Julia's, then to draw the set live, to zoom into and move about.

## What Are the Four Steps of Compile Julia to WebAssembly?

**The Function** defines the example in the Julia REPL, its region, its size and its most iterations, with `escape_time`, the function of one pixel, and `fractal_counts`, and computes the count of every pixel. **Compile** turns the function into a WebAssembly module in one of two ways, **Through Rust** or **With WebAssemblyCompiler.jl**, in the **Folder** chosen, `programs/webassembly` of the open Pollis Workspace by default. **Check** runs the module in the page on the example, saves its counts, and sends Julia code that compares them with the counts of step 1. **Live View** draws the example with the module, computed again in the page each time the mouse wheel zooms or a drag moves the picture, and gives the time each picture took.

## What Are the Two Ways from Julia to WebAssembly in Compilation Lab?

**Through Rust** translates `escape_time` to Rust, beside a loop over the pixels of a picture, and builds the crate with cargo for the target `wasm32-unknown-unknown`: the Julia function becomes WebAssembly by way of another language, as on the page Translate Julia to Rust. **With WebAssemblyCompiler.jl** compiles the Julia function of step 1 itself, unchanged, from the code Julia infers for it. The package is experimental and does not install on Julia 1.12 or later, so the code of Compile starts a Julia 1.10 beside the session through juliaup. The two modules export the same `escape_time`; the Rust one also exports `fill_counts`, which computes a whole picture in one call.

## What Does the Example of Compile Julia to WebAssembly Compute?

The count of a pixel is the number of iterations of z → z^2 + c before |z| passes 2, at most **Iterations**, for the sets named after [Julia (1918)](#ref-Jul1918a) and [Mandelbrot (1980)](#ref-Man1980a). The Mandelbrot set starts z at 0 with c at the pixel; the Julia set starts z at the pixel with c fixed, -0.8 + 0.156i unless **Real Part of c** and **Imaginary Part of c** say otherwise. The grid is that of the other pages of Compilation Lab: **Pixels Across** pixels from the left edge of the region to its right edge, as many down as keep them square, and the iteration written with real numbers.

## Why Does Compile Julia to WebAssembly Check the Module Before It Draws?

A picture that looks like the Mandelbrot set can still be wrong at thousands of pixels near its edge, where a small change in the arithmetic changes the count. Check therefore asks for agreement at every pixel: the page computes the counts with the module, Pollis saves them as `counts.bin` in the folder of the way, and Julia reads them back and prints how many pixels differ from the counts of step 1. Both ways perform the same operations as Julia in the same order, on the same 64-bit numbers, so the answer expected is zero. Live View then draws with a module whose counts are known to be Julia's.

## References

<a id="ref-Jul1918a"></a>Julia, G. (1918). Mémoire sur l'itération des fonctions rationnelles. *Journal de Mathématiques Pures et Appliquées* 1, 47–245. [numdam.org](http://www.numdam.org/item/JMPA_1918_8_1__47_0/)

<a id="ref-Man1980a"></a>Mandelbrot, B. B. (1980). Fractal aspects of the iteration of z → λz(1 − z) for complex λ and z. *Annals of the New York Academy of Sciences* 357(1), 249–259. [doi:10.1111/j.1749-6632.1980.tb29690.x](https://doi.org/10.1111/j.1749-6632.1980.tb29690.x)

## See Also

- [Factsheet](factsheet.md) · [What Is WebAssembly](webassembly.md) · [Compiling Rust to WebAssembly](rust-to-webassembly.md) · [WebAssemblyCompiler.jl](webassemblycompiler.md) · [Running WebAssembly in the Page](live-view.md)
