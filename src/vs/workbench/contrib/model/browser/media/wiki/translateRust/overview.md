# Translate Julia to Rust: Overview

Translate Julia to Rust takes a Julia function to Rust, a compiled language designed for memory safety without a garbage collector ([Matsakis and Klock (2014)](#ref-MK2014a)), and calls the Rust version from Julia. Its example counts the pixels of the Mandelbrot set or of the Julia set of a point c, and Compare checks that the Rust version gives the same count at every pixel before it times the two.

## What Are the Four Steps of Translate Julia to Rust?

**The Function** names the Julia function and the call to translate, and runs it in the Julia REPL; for the example it first defines the region, the size of the picture and the function `fractal_counts`. **Translate** shows the Rust version: for the example, the crate written out, with its `Cargo.toml` and `src/lib.rs`, and the Julia function `fractal_counts_rust` that calls it; for a function of your own, **Translate with Agent** asks your coding agent to write both. **Build** compiles the crate with `cargo build --release` and defines the Julia function that calls it. **Compare** calls the original and the Rust version with the same arguments, checks that they give the same result, and times them with BenchmarkTools.jl. Every step sends its code to the Julia REPL, where its results show.

## What Are the Two Parts of a Rust Version That Julia Calls?

Julia cannot call a Rust function as Rust code calls it, so the Rust version comes in two parts. The first is a Rust crate built as a C dynamic library, a `cdylib`, whose function takes only numbers and pointers and follows the conventions of C: in the example, `fill_counts`, which writes the count of every pixel into memory it is given. The second is a Julia function with the arguments and the result of the original, which prepares what Rust needs and calls the library with `@ccall`: in the example, `fractal_counts_rust` allocates the matrix of counts, passes its pointer, splits c into its real and imaginary parts, and returns the matrix. Compare sees two Julia functions with the same arguments, and can call them in the same way.

## What Does the Example of Translate Julia to Rust Compute?

`fractal_counts(x0, y0, spacing, height, width, julia_set, c, maxiter)` returns a `Matrix{Int32}` with one row for each pixel down and one column for each pixel across. The count of a pixel is the number of iterations of z → z^2 + c before |z| passes 2, at most `maxiter`, for the sets that carry the names of [Julia (1918)](#ref-Jul1918a) and [Mandelbrot (1980)](#ref-Man1980a): the Mandelbrot set starts z at 0 with c at the pixel, and the Julia set starts z at the pixel with c fixed. The iteration is written with real numbers, `zr2 + zi2 > 4.0`, as on the other pages of Compilation Lab, and the **Example** choice of step 1 switches between the two sets and their regions.

## What Does Translate with Agent Do?

**Translate with Agent** starts your coding agent with the translate-to-rust skill of Pollis Agents, the function's name, its call and the name of the Julia function that is to call the Rust version. The agent finds the function, then explains its plan before writing anything: the type each argument takes in Rust, the memory that stays with Julia, the order of operations it keeps, and what does not translate as it is. Once you agree, it writes a new crate and a new Julia file beside the function's file, builds the crate, checks that the two versions give the same result, and times them; the function's own file is never changed. For the example, Pollis first saves the example's code to `~/.pollis/rust/fractal_counts.jl`, for the agent to read.

## Why Does Compare Check the Result Before the Times?

A translation that runs faster but gives another answer is not a translation of the function. Compare therefore calls both versions first and checks that the results are equal with `isequal`, and only when they differ in a way `isapprox` accepts does it count them as the same, to rounding. For the example the check is exact: the two versions perform the same floating-point operations in the same order, so every count must agree. BenchmarkTools then times each version for a second, and Compare gives the minimum time and the allocations of a call, how many times as fast the Rust version is, and the verdict of `judge` on the medians. A Rust version is not always faster: a Julia function that is already type-stable and free of allocations compiles to machine code of the same kind.

## References

<a id="ref-KN2023a"></a>Klabnik, S. and Nichols, C. (2023). *The Rust Programming Language*, 2nd ed. San Francisco: No Starch Press. [doc.rust-lang.org/book](https://doc.rust-lang.org/book/)

<a id="ref-MK2014a"></a>Matsakis, N. D. and Klock, F. S. (2014). The Rust language. *ACM SIGAda Ada Letters* 34(3), 103–104. [doi:10.1145/2692956.2663188](https://doi.org/10.1145/2692956.2663188)

<a id="ref-Jul1918a"></a>Julia, G. (1918). Mémoire sur l'itération des fonctions rationnelles. *Journal de Mathématiques Pures et Appliquées* 1, 47–245. [numdam.org](http://www.numdam.org/item/JMPA_1918_8_1__47_0/)

<a id="ref-Man1980a"></a>Mandelbrot, B. B. (1980). Fractal aspects of the iteration of z → λz(1 − z) for complex λ and z. *Annals of the New York Academy of Sciences* 357(1), 249–259. [doi:10.1111/j.1749-6632.1980.tb29690.x](https://doi.org/10.1111/j.1749-6632.1980.tb29690.x)

## See Also

- [Factsheet](factsheet.md) · [From Julia to Rust](julia-to-rust.md) · [Calling Rust from Julia](calling-rust.md) · [The Same Result in Rust](same-result.md)
