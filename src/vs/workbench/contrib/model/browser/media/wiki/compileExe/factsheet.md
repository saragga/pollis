# Compile Julia to an Executable: Factsheet

The tools, requirements, build calls, entry points, inputs, files, names and actions of Compile Julia to an Executable at a glance.

## Tools of Compile Julia to an Executable

| Tab | Build call | Runtime in the program | Julia versions |
|---|---|---|---|
| **JuliaC** | `juliac --output-exe fractal --bundle <folder>/bundle --project <folder> --trim=safe --experimental fractal.jl` | A trimmed Julia runtime, in the libraries of the bundle | 1.12 and later |
| **PackageCompiler** | `create_app(package, app; executables = ["fractal" => "julia_main"], filter_stdlibs = true, force = true)` | The whole Julia runtime and a system image, in the app folder | 1.10 and later |
| **StaticCompiler** | `compile_executable(static_main, (Int64, Ptr{Ptr{UInt8}}), bin; filename = "fractal")` | None | Tested on 1.11 and 1.12 |

## Requirements of Compile Julia to an Executable

| Tab | Installed by the code | Needed beforehand |
|---|---|---|
| **JuliaC** | The app juliac, with `Pkg.Apps.add("JuliaC")`, in `~/.julia/bin` | A C compiler on the path, which juliac links with |
| **PackageCompiler** | Nothing | PackageCompiler.jl in the environment, and a C compiler on the path |
| **StaticCompiler** | Nothing | StaticCompiler.jl and StaticTools.jl in the environment; no C compiler, as StaticCompiler brings its own clang and lld |

A C compiler is `cc`, `gcc` or `clang` on macOS and Linux (the Command Line Tools on macOS, with `xcode-select --install`), and MinGW-w64 on Windows. StaticCompiler describes itself as extra experimental on Windows, and expected to work under WSL.

## Entry Points of Compile Julia to an Executable

| Tab | Where the program starts | How it reads its arguments | How it prints |
|---|---|---|---|
| **JuliaC** | `function @main(args::Vector{String})::Cint` | `args`, without the program's name | `println(Core.stdout, ...)` |
| **PackageCompiler** | `julia_main()::Cint` in the module Fractal | `ARGS`, without the program's name | `println(Core.stdout, ...)` |
| **StaticCompiler** | `static_main(argc::Int64, argv::Ptr{Ptr{UInt8}})` | `argparse(T, argv, i)`, with the program's name at 1 | `printf(c"%lld\n", inside)` |

## Inputs of Compile Julia to an Executable

| Input | Default | Meaning |
|---|---|---|
| **Example** | Mandelbrot Set | The Mandelbrot set, or the Julia set of c |
| **Pixels Across** | 800 | Pixels across the picture; the pixels down follow from the region, with square pixels |
| **Iterations** | 256 | The most iterations of a pixel; a pixel that has not escaped counts as inside |
| **Real Part of c** | -0.8 | The real part of c, for the Julia set only |
| **Imaginary Part of c** | 0.156 | The imaginary part of c, for the Julia set only |
| **Folder** | `programs/executables` of the open Pollis Workspace, else `~/.pollis/programs/executables` | Where the programs are built, in a folder for each tool; **Choose...** picks another |

The program receives them as its arguments, after the files it writes: `picture.bmp counts.bin height width x0 y0 spacing julia_set cr ci maxiter`. With no arguments it draws the Mandelbrot set, 800 by 640 pixels with 256 iterations, into `fractal.bmp` in the folder it starts in, and opens it.

## Files Written by Compile Julia to an Executable

| Tab | Folder in **Folder** | Files |
|---|---|---|
| **JuliaC** | `juliac` | `fractal.jl`, `Project.toml`, `bundle/` (the program in `bin`, the Julia libraries in `lib`), `fractal.bmp`, `counts.bin` |
| **PackageCompiler** | `packagecompiler` | `Fractal/` (the package), `app/` (the program in `bin`, with the runtime and the system image), `fractal.jl`, `fractal.bmp`, `counts.bin` |
| **StaticCompiler** | `staticcompiler` | `static_main.jl`, `fractal.jl`, `bin/fractal`, `fractal.bmp`, `counts.bin` |

Each folder also holds `built_from.txt`, the Julia version and the source the program was built from: a program is built again only when one of them changes. `fractal.jl` is the program as a Julia script, which **Start-Up and Run Time** runs with julia.

## Names Set by the Code of Compile Julia to an Executable

| Name | What it is |
|---|---|
| `kernel_code` | The source of `escape_time` and `fill_counts`, which the session includes and every program contains |
| `program_code`, `script_code` | The function `fractal(args)`, and the whole program as a script with `@main` |
| `static_code` | The function `static_main(argc, argv)` of the **StaticCompiler** tab |
| `julia_counts`, `julia_inside` | The counts and the pixels inside, from the session |
| `compiled_counts`, `compiled_inside` | The counts and the pixels inside, from the program |
| `program`, `shipped_folder`, `source_file`, `built_with` | The program, the folder it comes in, the source compiled and the build call |
| `arguments`, `command`, `script_command` | The program's arguments, the command that runs it, and julia running the script |
| `programs` | Each tool built in the session, with its build time, program size, folder and command |

## Actions of Compile Julia to an Executable

| Group | Action | Output |
|---|---|---|
| Visualise | **Picture of the Set** | The picture the program drew, `fractal.bmp`, read back and shown |
| Diagnose | **Source and Build Command** | The Julia source, the build call and the command that runs the program |
| Diagnose | **Program Contents** | Sizes of the program and its folder, and the libraries needed at run time |
| Compare | **Sizes and Build Times** | Each tool run in the session, its build time, program size and folder size |
| Compare | **Start-Up and Run Time** | Each program run whole, beside julia running the script and `fill_counts` alone |
| Interpret | **Share of Pixels Inside** | The share of pixels that did not escape, and their area |

## See Also

- [Overview](overview.md) · [Entry Points and Arguments](entry-points.md) · [Start-Up Time](startup.md) · [Writing for StaticCompiler](staticcompiler.md) · [Shipping an Executable](shipping.md)
