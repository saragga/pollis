# Compile Julia to a Shared Library: Libraries with and without a Runtime

What the Julia runtime does inside a shared library, how the libraries of juliac and PackageCompiler start it, and what a library of StaticCompiler gives up by having none, in the tabs of Compile Julia to a Shared Library.

## What Is the Julia Runtime in a Shared Library?

Compiled Julia code relies on a runtime: the garbage collector that allocates and frees memory, the handling of errors, tasks and threads, and the tables of types and methods. It lives in `libjulia` and `libjulia-internal`, the libraries that every Julia installation has. A library made by juliac or PackageCompiler holds compiled code together with an image of the Julia data it needs, and depends on those runtime libraries, which **Library Contents** lists among the libraries needed at run time. The runtime has to be started before the compiled code runs, and stopped when the program ends. The three tools of Compile Julia to a Shared Library differ in how much of this they keep: juliac keeps a runtime for a trimmed image, PackageCompiler a runtime for a whole system image, and StaticCompiler none.

## How Does a Library of juliac Start Its Runtime?

A library built by juliac starts its Julia runtime when a program loads it, so the program calls `fill_counts` like any C function, with nothing before it. The C program of Julia's own tests of trimmed libraries works the same way: it includes the library's header and calls its functions directly. In the **JuliaC** tab, the program `caller` is therefore compiled without `INIT_JULIA`, and its only call into the library is `fill_counts`. The cost of starting the runtime is paid once, when the program starts, and **Start-Up and Call Time** includes it, as it times the whole program. The runtime of a trimmed library has only the methods trimming kept, so it cannot compile code that was not compiled in advance.

## How Does a Library of PackageCompiler Start Its Runtime?

A library of PackageCompiler leaves the start and the end of its runtime to the calling program, through two functions it exports, `init_julia(int argc, char *argv[])` and `shutdown_julia(int retcode)`, which PackageCompiler's own example library declares in its header. In the **PackageCompiler** tab, `caller.c` is compiled with `-DINIT_JULIA`, which adds a call to `init_julia` before `fill_counts` and a call to `shutdown_julia` after it. The program passes only its own name to `init_julia`, as the arguments it receives are numbers for `fill_counts` and not options for Julia. The runtime then has the whole system image of the package, with Base and the standard libraries kept, so the library could run any Julia code its package contains, at the cost of its size.

## What Does a Library of StaticCompiler Give Up?

A library of StaticCompiler is compiled with no Julia runtime, so it depends only on the system's own libraries and loads like a library written in C. The StaticCompiler documentation lists what that excludes: memory managed by the garbage collector, global variables that need to be allocated, code that is not type-stable, and errors, except those given a replacement with `@device_override`. Arguments and results must be native types such as `Int64`, `Float64` or a pointer; StaticCompiler warns that any other return type may lead to undefined behaviour, which is why `fill_counts` returns the number of pixels inside as an `Int64`. Its documentation suggests passing work arrays as arguments, as `fill_counts` does with the memory for the counts, and managing memory by hand with StaticTools.jl when a function needs its own.

## Can Two Julia Runtimes Share One Process?

Each library of juliac or PackageCompiler brings its runtime into the process that loads it. A program that loads two such libraries, or a Julia session that loads one, would hold two Julia runtimes, each with its own memory and state. JuliaC has an option for this, `--privatize`, which renames the bundled `libjulia` files and their symbol versions with a prefix of their own on Linux and macOS, so that runtimes loaded into the same process stay apart. Compile Julia to a Shared Library avoids the question by calling each library from its own C program, as a program written in another language would. A library of StaticCompiler has no runtime to clash with, and can be loaded into a Julia session with `Libdl.dlopen`, as the StaticCompiler documentation shows.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Trimming and What It Leaves Out](trimming.md) · [Shipping a Library](shipping.md)
