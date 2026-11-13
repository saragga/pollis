# Compile Julia to a Shared Library: Shipping a Library

What has to go with a library compiled from Julia when it runs on another computer, how JuliaC and PackageCompiler gather it, how a program finds the library, and which processors the library is compiled for.

## Does a Library of Compile Julia to a Shared Library Run on Another Computer?

Not as the page builds it, except for StaticCompiler's. The **JuliaC** tab builds without `--bundle`, and JuliaC's documentation says that its default then links the library to the libraries of the Julia installation that built it, by their absolute paths: convenient on the computer where it was built, but the library fails wherever that Julia is not installed in the same place. The folder of the **PackageCompiler** tab, `build`, holds the library together with the Julia runtime, and can be copied as a whole. The library of the **StaticCompiler** tab depends only on the system's own libraries, so the single file can be copied to another computer with the same operating system and a compatible processor. **Library Contents** lists what each library needs at run time.

## What Does --bundle of JuliaC Gather?

`juliac --bundle <dir>` copies into one folder everything the output needs: the Julia libraries, the standard libraries and the artifacts of its packages, with `--bundle-lazy-artifacts` for artifacts that are downloaded on first use. JuliaC's documentation describes the layout: on macOS and Linux the program in `<dir>/bin` and the libraries in `<dir>/lib` and `<dir>/lib/julia`; on Windows everything in `<dir>/bin`. The output is linked with a path relative to its own location, `@loader_path/../lib` on macOS and `$ORIGIN/../lib` on Linux, so the folder can be moved or copied anywhere and still find its libraries. In the library API of JuliaC the same choice is `rpath = "@bundle"` in `LinkRecipe`, where the default, `"@julia"`, uses the absolute paths of the installation.

## What Does create_library of PackageCompiler Gather?

`create_library` writes to its destination folder the library itself, in `lib` on macOS and Linux and in `bin` on Windows, the Julia libraries it needs beside it, an `include` folder with C headers, and an `artifacts` folder for the libraries that packages download. The **PackageCompiler** tab passes `filter_stdlibs = true`, which keeps only the standard libraries the package uses, and makes the folder smaller. PackageCompiler's documentation lists ways for a program to find the library: an environment variable (`LD_LIBRARY_PATH` on Linux, `DYLD_FALLBACK_LIBRARY_PATH` on macOS, `PATH` on Windows), a standard location such as `/usr/local/lib`, a path relative to the program recorded with rpath, or, on Windows, the library in the program's own folder. On macOS and Linux the library's name must start with `lib`, which `create_library` ensures.

## How Does the Calling Program Find the Library?

A program linked against a shared library records the library's name, and the system looks for it when the program starts. JuliaC names a library `@rpath/libfractal.dylib` on macOS and gives it the name `libfractal.so` on Linux, so the system looks for it in the folders the program records as its rpath. The calling program of every tab is linked with `-Wl,-rpath,<the library's folder>`, which records that folder. Windows has no rpath: a program finds a DLL in its own folder or on the path, so each tab adds the library's folder to the path when it runs the program, and the **JuliaC** tab adds the folder of the Julia installation, where `libjulia` is. A program shipped with a library would record a relative path instead, as `--bundle` does.

## Which Processors Is a Library Compiled For?

Compiled code uses the instructions of the processors it was built for, and fails on a processor that lacks them. JuliaC compiles for the processors named by the environment variable `JULIA_CPU_TARGET` when it is set, and otherwise, on Julia 1.13 and later, for the same processors as Julia's own system image. `create_library` takes a `cpu_target` keyword, whose default for x86-64 is a generic target together with versions for newer processors, and `generic` on ARM. StaticCompiler compiles by default for the processor of the computer that builds the library, with its features, which may not run on an older processor of the same family; a `StaticTarget` with another platform and processor compiles for those instead.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Trimming and What It Leaves Out](trimming.md) · [Libraries with and without a Runtime](runtimes.md)
