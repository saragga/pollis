# Compile Julia to an Executable: Entry Points and Arguments

Where each program of Compile Julia to an Executable starts, how it receives its command line, how it reads numbers from it, and how it reports its result.

## What Is the Entry Point of an Executable?

An executable starts at one function, its entry point, which receives the words of the command line and returns an exit status, a number that tells whoever started the program whether it succeeded: zero for success, anything else for a failure. In C the entry point is `main(int argc, char *argv[])`. A Julia program compiled to an executable needs an entry point of its own, and each tool of Compile Julia to an Executable asks for it in a different form: `@main` for juliac, `julia_main` for PackageCompiler, and a function with the arguments of C's `main` for StaticCompiler. In all three tabs the entry point does nothing but read the arguments, call `fill_counts` and `fill_picture` and report, so that the three programs compute exactly the same thing.

## How Does @main Start a Program of juliac?

Julia 1.11 added the macro `@main`, which marks the function `main` of a module as an entry point. When julia runs a script whose `Main.main` is marked, it calls `main(ARGS)` once the whole script has been loaded, and uses its return value, `nothing` or a number convertible to `Cint`, as the exit status. juliac uses the same mark: `--output-exe` compiles the program to start at `@main`, and JuliaC's documentation asks for `function @main(args::Vector{String})` in the source file or package. In the **JuliaC** tab, `@main` only calls `fractal(args)`, which returns a `Cint`, so that the same file, `fractal.jl`, is both the source juliac compiles and the script julia runs in **Start-Up and Run Time**. The vector `args` holds the arguments without the program's name, so the picture file is `args[1]` and the counts file `args[2]`; an empty `args` means the program was started with no arguments, as by a double-click.

## How Does julia_main Start a Program of PackageCompiler?

`create_app` compiles a package, and its documentation asks the package for a function `julia_main()::Cint`, called when the program starts. The function takes no arguments: it reads the command line from `ARGS`, as a Julia script does, and its return value is the exit status. The keyword `executables` of `create_app` names the programs to make and the function each starts at, here `["fractal" => "julia_main"]`. In the **PackageCompiler** tab, the module Fractal holds `escape_time`, `fill_counts` and `fractal`, and `julia_main()::Cint = fractal(ARGS)`. A program of PackageCompiler keeps the whole Julia runtime, so its command line can also carry options for Julia itself, after `--julia-args`, such as the number of threads.

## How Does main(argc, argv) Start a Program of StaticCompiler?

A program of StaticCompiler has no Julia runtime to build `ARGS` from, so its entry point receives the command line as the C library gives it: `argc`, the number of words, and `argv`, a pointer to an array of pointers to C strings. `compile_executable` is given the function and its argument types, `(Int64, Ptr{Ptr{UInt8}})`. The first word is the program's own name, so in the **StaticCompiler** tab `argc` is 12 for the eleven arguments, the picture file is the second word and the counts file the third, and `argparse(Float64, argv, 6)` reads the fifth argument, `x0`. An `argc` of 1 means no arguments, as by a double-click. `static_main` prints the usage and returns 1 when the number of words is wrong, and returns 0 otherwise.

## How Does Each Program Read Its Numbers?

The numbers reach the program as text, and the counts can only match Julia's if the program reads back exactly the `Float64` values of the session. The session writes each number with `repr`, which gives the shortest decimal that reads back to the same `Float64`. The programs of juliac and PackageCompiler read them with `parse(Float64, ...)`, and the program of StaticCompiler with `argparse`, which StaticTools implements with the C library's `strtod`; both round a decimal to the nearest `Float64`, and so recover the value written. The integers, the size of the picture, the example and the most iterations, are read as `Int64` or `Int32`.

## How Does Each Program Report Its Result?

Each program reports in three ways: the picture, a BMP file, which the session compares byte for byte with its own; the counts in a file, `counts.bin`, written as 32-bit integers column by column, which the session reads back with `read!` into a matrix of the same shape; and the number of pixels inside, printed as one line, which the session reads with `readchomp`. The programs of juliac and PackageCompiler print with `println(Core.stdout, inside)`: the Julia documentation on trimming advises `Core.stdout` over `stdout` in code that is to be trimmed. The program of StaticCompiler prints with `printf(c"%lld\n", inside)` of StaticTools, where `%lld` is the C format for a 64-bit integer.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Start-Up Time](startup.md) · [Writing for StaticCompiler](staticcompiler.md) · [Shipping an Executable](shipping.md)
