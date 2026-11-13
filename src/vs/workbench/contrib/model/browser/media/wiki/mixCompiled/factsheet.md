# Mix Julia with Compiled Code: Factsheet

The tabs, compilers, types, inputs, files, names and actions of Mix Julia with Compiled Code at a glance.

## Tabs and Compilers of Mix Julia with Compiled Code

| Tab | Direction | Compiler | What is built |
|---|---|---|---|
| **Call C** | Julia calls C | `cc`, `gcc` or `clang` | A shared library with `fill_counts` |
| **Call Fortran** | Julia calls Fortran | `gfortran` | A shared library with `fill_counts`, from a module with `bind(c)` |
| **Call C++** | Julia calls C++ | `c++`, `g++` or `clang++`, with `-std=c++17` | A shared library with `fill_counts` behind `extern "C"` |
| **Julia Callback** | C calls Julia | `cc`, `gcc` or `clang` | A shared library whose loop calls a function pointer |
| **Julia from C** | A C program starts Julia | `cc`, `gcc` or `clang`, with the flags of `julia-config.jl` | A program linked against `libjulia` |

The shared libraries are built with `-O2 -shared -fPIC -ffp-contract=off`, and gfortran puts its module file in the same folder with `-J`.

## Installing the Compilers of Mix Julia with Compiled Code

| Compiler | macOS | Linux | Windows |
|---|---|---|---|
| C and C++ | The Command Line Tools, `xcode-select --install` | The `gcc` and `g++` packages of the distribution | MinGW-w64 |
| gfortran | `brew install gcc` | The `gfortran` package of the distribution | MinGW-w64 |

`Sys.which` looks for each compiler on the path of the Julia session.

## Types Across the Boundary in Mix Julia with Compiled Code

| Julia | C | Fortran | C++ | Used for |
|---|---|---|---|---|
| `Ptr{Int32}`, from a `Matrix{Int32}` | `int32_t *` | `integer(c_int32_t) :: counts(height, width)` | `std::int32_t *` | The matrix of counts |
| `Int64` | `int64_t` | `integer(c_int64_t), value` | `std::int64_t` | Height and width |
| `Float64` | `double` | `real(c_double), value` | `double` | Coordinates and spacing |
| `Int32` | `int32_t` | `integer(c_int32_t), value` | `std::int32_t` | Iterations, and the example as 0 or 1 |
| `ComplexF64` | `double _Complex` | `complex(c_double_complex), value` | `std::complex<double>`, by pointer | The point c of the Julia set |
| `Ptr{Cvoid}`, from `@cfunction` | A function pointer | | | The Julia callback |

## Inputs of Mix Julia with Compiled Code

| Input | Default | Meaning |
|---|---|---|
| **Example** | Mandelbrot Set | The Mandelbrot set, or the Julia set of c |
| **Pixels Across** | 800 | Pixels across the picture; the pixels down follow from the region, with square pixels |
| **Iterations** | 256 | The most iterations of a pixel; a pixel that has not escaped counts as inside |
| **Real Part of c** | -0.8 | The real part of c, for the Julia set only |
| **Imaginary Part of c** | 0.156 | The imaginary part of c, for the Julia set only |

## Files Written by Mix Julia with Compiled Code

| Tab | Folder | Files |
|---|---|---|
| **Call C** | `~/.pollis/mix/c` | `fractal.c`, and `fractal-<contract>-<hash>` with `.so`, `.dylib` or `.dll` |
| **Call Fortran** | `~/.pollis/mix/fortran` | `fractal.f90`, `fractal.mod` and the libraries |
| **Call C++** | `~/.pollis/mix/cpp` | `fractal.cpp` and the libraries |
| **Julia Callback** | `~/.pollis/mix/callback` | `fractal.c` and the libraries |
| **Julia from C** | `~/.pollis/mix/embed` | `fractal.jl`, `fractal.c`, the program `fractal-<hash>` and `counts.bin` |

`<contract>` is `off` or `fast`, the `-ffp-contract` of the build; a changed source gets a new `<hash>`, so a library already loaded is never read again under the same name.

## Names Set by the Code of Mix Julia with Compiled Code

| Name | What it is |
|---|---|
| `escape_time`, `fill_counts!` | The Julia functions for one pixel and for the matrix |
| `julia_counts`, `compiled_counts` | The counts of Julia and of the compiled code, `height` by `width` |
| `x0`, `x1`, `y0`, `y1`, `spacing` | The region drawn and the distance between pixels |
| `c`, `julia_set`, `maxiter` | The point c, whether the example is the Julia set, and **Iterations** |
| `compiled_fill(contract)`, `fill_compiled!` | The compiled filling of a matrix, built with that contract, and with `off` (not in **Julia from C**) |
| `source_file`, `built_with`, `compiler`, `language` | The source, the command that built it, the compiler and the name of the crossing |

## Actions of Mix Julia with Compiled Code

| Group | Action | Tabs | Output |
|---|---|---|---|
| Visualise | **Picture of the Set** | All | The counts as a heatmap on a log scale |
| Diagnose | **Source and Build Command** | All | The source, its folder, the command and the compiler's version |
| Compare | **Julia and Compiled Times** | The first four | The time to fill all pixels, in Julia and through the compiled code |
| Compare | **Fused and Not Fused** | The first four | The pixels that differ from Julia's, built with and without fusing |
| Interpret | **Share of Pixels Inside** | All | The share of pixels that did not escape, and their area |

## See Also

- [Overview](overview.md) · [Memory Across the Boundary](memory-across-the-boundary.md) · [Callbacks and Embedding](callbacks-and-embedding.md) · [The Same Result Across Compilers](same-result-across-compilers.md)
