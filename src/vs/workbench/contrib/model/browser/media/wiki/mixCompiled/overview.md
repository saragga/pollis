# Mix Julia with Compiled Code: Overview

Mix Julia with Compiled Code shows five ways across the boundary between Julia and compiled code, from the Julia REPL, each on the same two examples: the Mandelbrot set and the Julia set of a point c. In every tab, the compiled code and Julia compute the number of iterations of each pixel, and the two pictures are compared pixel by pixel.

## What Are the Five Crossings of Mix Julia with Compiled Code?

The first three tabs go from Julia to compiled code. **Call C** calls a C function with `@ccall`, the simplest crossing, with only C types. **Call Fortran** calls a Fortran subroutine that `bind(c)` and the module `iso_c_binding` give a C name and C arguments, and passes the point c as one complex argument. **Call C++** calls C++ behind `extern "C"`, which keeps the function's name as written, and passes c as a `std::complex<double>` through a pointer. The last two tabs go the other way. In **Julia Callback**, the loop over the pixels runs in C and calls a Julia function for each pixel, through a function pointer that `@cfunction` makes. In **Julia from C**, a C program starts Julia itself, includes a Julia file and calls a function of it, which fills memory the program owns.

## Why Does Mix Julia with Compiled Code Use the Mandelbrot Set and Julia Sets?

Both pictures come from the same iteration, z → z^2 + c, repeated until |z| passes 2 or the most iterations allowed are reached. The Mandelbrot set starts z at 0 and takes c from the pixel; the Julia set of c starts z at the pixel and keeps c fixed. [Julia (1918)](#ref-Jul1918a) studied the iteration of rational functions, and Julia sets carry his name; [Mandelbrot (1980)](#ref-Man1980a) drew the set of parameters of a quadratic map whose iteration stays bounded. For crossing into compiled code, the iteration has three useful properties: it is a loop of plain arithmetic that every language writes the same way, its result for each pixel is a whole number that can be compared exactly, and the Julia set adds a complex number, c, that has to cross the boundary.

## How Does Each Tab of Mix Julia with Compiled Code Work?

Each tab first computes the counts in Julia, with `escape_time` for one pixel and `fill_counts!` for the whole matrix, column by column. **Toolchain** then finds the compiler on the path: `cc`, `gcc` or `clang` for C, `gfortran` for Fortran and `c++`, `g++` or `clang++` for C++. **Build** writes the source to a folder of `~/.pollis/mix` and compiles it, to a shared library in the first four tabs and to a program linked against `libjulia` in **Julia from C**. **Call** runs the compiled code, which fills a matrix of counts of the same size as Julia's. **Check** counts the pixels whose count differs from Julia's. The inputs choose the example (**Mandelbrot Set** or **Julia Set**), **Pixels Across**, **Iterations**, and the **Real Part of c** and **Imaginary Part of c** of the Julia set.

## How Does Mix Julia with Compiled Code Check the Compiled Result?

The check compares whole numbers, so it asks for the same count at every pixel, not for counts within a tolerance. That is possible only because each language makes the same floating-point operations in the same order: the iteration is written with real numbers, the test `zr2 + zi2 > 4` stands for `abs2(z) > 4`, and the C, C++ and Fortran compilers are told with `-ffp-contract=off` not to fuse a multiplication and an addition into one instruction. A pixel near the edge of a set can need hundreds of iterations, so a difference in the last bit of one operation can change its count. The wiki The Same Result Across Compilers explains why, and the action **Fused and Not Fused** builds the code again with fusing allowed to show it.

## What Do the Actions of Mix Julia with Compiled Code Add?

**Picture of the Set** draws the counts of the compiled code as a heatmap on a log scale, with the real part across and the imaginary part down. **Source and Build Command** prints the source, where it is saved, the command that built it and the version of the compiler. **Julia and Compiled Times** times the filling of all the pixels by Julia alone and through the compiled code, with Chairmarks. **Fused and Not Fused** builds the compiled code with `-ffp-contract=fast` and counts the pixels that then differ from Julia's. **Share of Pixels Inside** gives the share of pixels that did not escape and the area they cover. The two Compare actions are offered in **Call C**, **Call Fortran**, **Call C++** and **Julia Callback**, where Julia calls the compiled code as a library.

## How Does Mix Julia with Compiled Code Differ from Add a Language?

Add a Language, from Compose > Profiling, compiles a computation in C, Fortran or Rust to join the race of Run a Speed Race, and is about time. Mix Julia with Compiled Code is about the crossing itself: what a matrix looks like on the other side, how a complex number or a function pointer crosses, who owns the memory, and how a program starts Julia. Its checks ask for the same count at every pixel, and its times are there to show the cost of a crossing, such as a call back into Julia for each pixel. Rust is not one of its tabs, as Add a Language already calls a Rust library from Julia.

## References

<a id="ref-Jul1918a"></a>Julia, G. (1918). Mémoire sur l'itération des fonctions rationnelles. *Journal de Mathématiques Pures et Appliquées* 1, 47–245. [numdam.org](http://www.numdam.org/item/JMPA_1918_8_1__47_0/)

<a id="ref-Man1980a"></a>Mandelbrot, B. B. (1980). Fractal aspects of the iteration of z → λz(1 − z) for complex λ and z. *Annals of the New York Academy of Sciences* 357(1), 249–259. [doi:10.1111/j.1749-6632.1980.tb29690.x](https://doi.org/10.1111/j.1749-6632.1980.tb29690.x)

## See Also

- [Factsheet](factsheet.md) · [Memory Across the Boundary](memory-across-the-boundary.md) · [Callbacks and Embedding](callbacks-and-embedding.md) · [The Same Result Across Compilers](same-result-across-compilers.md)
