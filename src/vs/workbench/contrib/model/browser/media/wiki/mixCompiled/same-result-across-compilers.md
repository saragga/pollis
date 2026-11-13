# Mix Julia with Compiled Code: The Same Result Across Compilers

Why Julia and C, Fortran or C++ can give exactly the same count at every pixel, what fused multiply-add changes, and how Mix Julia with Compiled Code writes and builds its arithmetic so that the counts agree.

## Why Can the Counts of Mix Julia with Compiled Code Be Checked Exactly?

The IEEE 754 standard for floating-point arithmetic requires addition, subtraction, multiplication and division to be correctly rounded: the result is the exact result rounded to the nearest number of the format. [Goldberg (1991)](#ref-Gol1991a) explains why this makes results reproducible: two programs that make the same operations on the same `Float64` values, in the same order, get the same bits. The counts of Mix Julia with Compiled Code are whole numbers that depend only on such operations, so Julia and a compiled language that follow the same steps must give the same count at every pixel. A check to a tolerance, as for a sum of many values, would hide a real difference here: any pixel that differs means that some operation was not the same.

## What Is a Fused Multiply-Add?

A fused multiply-add computes `a * b + c` as one operation, rounded once, instead of a product rounded and then a sum rounded. It is often more accurate and faster, and processors such as those of ARM computers and x86-64 processors since about 2013 have an instruction for it. But its result can differ from the separate operations in the last bit. In the iteration of Mix Julia with Compiled Code, a difference in the last bit of z grows from one iteration to the next, and a pixel near the edge of a set, where z stays close to escaping for many iterations, can then escape one iteration earlier or later. A single fused operation in the compiled code is therefore enough to make some counts differ from Julia's.

## When Do Compilers Fuse a Multiply and an Add?

The option `-ffp-contract` decides whether a C, C++ or Fortran compiler may fuse a product and a sum. GCC and gfortran fuse wherever they can by default (`fast`), unless a strict ISO C standard is asked for. Clang, including the `cc` of macOS, fuses within one expression by default (`on`). Julia fuses only when the code asks for it, with `muladd`, `fma` or `@fastmath`, and Rust does not fuse unless asked either. On x86-64 a compiler uses the fused instruction only when told that the processor has it, with an option such as `-mfma`. Mix Julia with Compiled Code builds with `-ffp-contract=off`, so that every product and sum is rounded separately, as in Julia, and **Fused and Not Fused** builds the same source with `-ffp-contract=fast` (and `-mfma` on x86-64) to show the pixels that change.

## Why Does Mix Julia with Compiled Code Test zr2 + zi2 > 4 and Not abs(z) > 2?

The modulus of a complex number, `abs(z)` in Julia, is computed with `hypot`, a function of the mathematics library that takes care to avoid overflow and is not required to be correctly rounded. Its last bit can differ between the libraries of Julia, C, Fortran and C++, and a pixel whose |z| falls almost exactly on 2 could escape in one language and not in another. The test `zr2 + zi2 > 4`, the same as `abs2(z) > 4` in Julia, needs only products and a sum, which IEEE 754 requires to be correctly rounded, and the squares `zr2` and `zi2` are reused in the next step of the iteration. The two tests describe the same set, and only the second gives the same answer in every language.

## How Is the Arithmetic Written the Same in Every Language?

Each tab writes the iteration with real numbers: `zr2 = zr * zr`, `zi2 = zi * zi`, then `zi = 2.0 * zr * zi + ci` and `zr = zr2 - zi2 + cr`, in the same order. Julia, C and C++ group operations of the same precedence from left to right, so `2.0 * zr * zi` is `(2.0 * zr) * zi`; the Fortran standard lets a compiler evaluate any mathematically equivalent form that keeps the parentheses, and gfortran keeps the order written unless an option such as `-ffast-math` allows it to change it. The coordinates of a pixel are computed the same way, `x0 + j * spacing`, from a pixel index converted to `Float64`, which is exact. The constants are written as `Float64` values in every language: `4.0`, `2.0`, `4.0_c_double` in Fortran. Library functions with their own rounding, such as complex multiplication with `std::complex` in C++, are avoided in the loop: the C++ code takes the parts of c once and then works with `double` values.

## What Can Still Make Compiled Results Differ?

Options that allow the compiler to change the arithmetic itself, such as `-ffast-math` or `-Ofast`, permit reordering and approximations, and the counts would then differ for reasons other than fusing. The optimisation levels `-O0` to `-O3` do not change floating-point results on their own. Old 32-bit x86 code that keeps intermediate values in the 80-bit registers of the x87 unit rounds differently from `Float64`, which 64-bit processors do not do. A different order of the same operations, such as `zr2 + cr - zi2`, is a different computation, rounded differently. When **Fused and Not Fused** reports no difference, the processor may simply have no fused instruction available to the build, or no pixel of the picture may be close enough to the edge to be affected.

## References

<a id="ref-Gol1991a"></a>Goldberg, D. (1991). What every computer scientist should know about floating-point arithmetic. *ACM Computing Surveys* 23(1), 5–48. [doi:10.1145/103162.103163](https://doi.org/10.1145/103162.103163)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Memory Across the Boundary](memory-across-the-boundary.md) · [Callbacks and Embedding](callbacks-and-embedding.md)
