# Compile Julia to a Shared Library: Factsheet

The tools, requirements, build calls, inputs, files, names and actions of Compile Julia to a Shared Library at a glance.

## Tools of Compile Julia to a Shared Library

| Tab | Build call | Runtime in the library | Julia versions |
|---|---|---|---|
| **JuliaC** | `juliac --output-lib libfractal.<ext> --project <folder> --compile-ccallable --trim=safe --experimental fractal.jl` | A trimmed Julia runtime, started when the library is loaded | 1.12 and later |
| **PackageCompiler** | `create_library(package, destination; lib_name = "libfractal", filter_stdlibs = true, force = true)` | The whole Julia runtime and a system image, started by `init_julia` | 1.10 and later |
| **StaticCompiler** | `compile_shlib(fill_counts, argument_types, folder; filename = "libfractal")` | None | Tested on 1.11 and 1.12 |

`<ext>` is `so`, `dylib` or `dll`, as `Libdl.dlext` gives it.

## Requirements of Compile Julia to a Shared Library

| Tab | Installed by the code | Needed beforehand |
|---|---|---|
| **JuliaC** | The app juliac, with `Pkg.Apps.add("JuliaC")`, in `~/.julia/bin` | A C compiler on the path |
| **PackageCompiler** | Nothing | PackageCompiler.jl in the environment, and a C compiler |
| **StaticCompiler** | Nothing | StaticCompiler.jl in the environment, and a C compiler |

The C compiler (`cc`, `gcc` or `clang`) builds the calling program in every tab: the Command Line Tools on macOS (`xcode-select --install`), the `gcc` package on Linux, MinGW-w64 on Windows.

## Inputs of Compile Julia to a Shared Library

| Input | Default | Meaning |
|---|---|---|
| **Example** | Mandelbrot Set | The Mandelbrot set, or the Julia set of c |
| **Pixels Across** | 800 | Pixels across the picture; the pixels down follow from the region, with square pixels |
| **Iterations** | 256 | The most iterations of a pixel; a pixel that has not escaped counts as inside |
| **Real Part of c** | -0.8 | The real part of c, for the Julia set only |
| **Imaginary Part of c** | 0.156 | The imaginary part of c, for the Julia set only |

The inputs reach the library as arguments of the calling program, so changing them needs no new build.

## Files Written by Compile Julia to a Shared Library

| Tab | Folder in `~/.pollis/sharedlib` | Files |
|---|---|---|
| **JuliaC** | `juliac/<hash>` | `fractal.jl`, `Project.toml`, `libfractal.<ext>`, `caller.c`, `caller`, `counts.bin` |
| **PackageCompiler** | `packagecompiler/<hash>` | `Fractal/` (the package), `build/` (the library in `lib`, or `bin` on Windows, beside the Julia runtime), `caller.c`, `caller`, `counts.bin` |
| **StaticCompiler** | `staticcompiler/<hash>` | `fractal.jl`, `libfractal.<ext>`, `caller.c`, `caller`, `counts.bin` |

`<hash>` changes with the Julia source, the C program and the Julia version, so a library is rebuilt only when one of them changes.

## Names Set by the Code of Compile Julia to a Shared Library

| Name | What it is |
|---|---|
| `escape_time`, `fill_counts` | The Julia functions for one pixel and for all the pixels, as the library has them |
| `kernel_code` | Their source, which the session includes and the tools compile |
| `julia_counts`, `julia_inside` | The counts and the pixels inside, from the session |
| `compiled_counts`, `compiled_inside` | The counts and the pixels inside, from the library through the C program |
| `library`, `shipped_folder`, `source_file`, `built_with` | The library, the folder it comes in, the source compiled and the build call |
| `caller`, `caller_file`, `caller_built_with`, `command` | The calling program, its source, its build command and the command that runs it |
| `builds` | Each tool built in the session, with its build time, library size and command |

## Actions of Compile Julia to a Shared Library

| Group | Action | Output |
|---|---|---|
| Visualise | **Picture of the Set** | The library's counts as a heatmap on a log scale |
| Diagnose | **Source and Build Command** | The Julia source, the C program and the commands that built them |
| Diagnose | **Library Contents** | Sizes, the libraries needed at run time, and the library's own exported functions |
| Compare | **Sizes and Build Times** | Each tool run in the session, its build time and library size |
| Compare | **Start-Up and Call Time** | Each tool's program, run whole, beside `fill_counts` alone in the session |
| Interpret | **Share of Pixels Inside** | The share of pixels that did not escape, and their area |

## See Also

- [Overview](overview.md) · [Trimming and What It Leaves Out](trimming.md) · [Libraries with and without a Runtime](runtimes.md) · [Shipping a Library](shipping.md)
