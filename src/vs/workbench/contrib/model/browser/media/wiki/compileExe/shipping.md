# Compile Julia to an Executable: Shipping an Executable

The folder that each tool of Compile Julia to an Executable makes, what it holds, how the program finds its libraries, and what the program needs to run on another computer.

## What Does the Folder of Each Tool Hold?

The **JuliaC** tab passes `--bundle`, so juliac puts the program in `bundle/bin` and the Julia libraries it needs in `bundle/lib` and `bundle/lib/julia`, with the artifacts of its packages beside them; on Windows everything goes in `bin`. The **PackageCompiler** tab gets an app folder from `create_app`: the program in `app/bin`, the Julia runtime and the system image the program loads, and `app/share/julia`, which the program uses as its Julia depot, with the artifacts of the packages and the app's project file. The **StaticCompiler** tab gets a single file, `bin/fractal`, and nothing beside it. **Program Contents** counts the files of each folder and adds up their size, and **Sizes and Build Times** sets the sizes of the tools run in the session side by side.

## How Does the Program of Each Tool Find Its Libraries?

A program built against shared libraries records where to look for them, and the operating system follows that record when the program starts. With `--bundle`, juliac records a path relative to the program itself, `@loader_path/../lib` on macOS and `$ORIGIN/../lib` on Linux, so the program finds the libraries of its bundle wherever the folder is put; on Windows the libraries are in the program's own folder, where Windows looks first. PackageCompiler's documentation says that `create_app` bundles every library the app needs, and the artifacts of its packages, and sets things up so that they are found when the app runs on another computer. The program of StaticCompiler depends only on the system's own libraries, which every computer with the same operating system has, so **Program Contents** lists none of Julia's.

## Can the Program Run on Another Computer?

JuliaC's documentation describes a bundle as a relocatable folder that can be distributed, and PackageCompiler's documentation says the same of an app folder, which can be put in an archive or wrapped in an installer and sent to another computer that can run the Julia version that made it. In both, the whole folder has to go, not the program alone. PackageCompiler's documentation adds a condition on the packages: a package that writes an absolute path of the build computer into its code, such as a path to a library found when it was compiled, makes the app fail elsewhere, and the artifact system of Pkg is the way to depend on external libraries so that they travel with the app. The single file of StaticCompiler can be copied on its own to another computer with the same operating system.

## Which Processors Does an Executable Run On?

The program runs only on processors that have the instructions it was compiled with. `create_app` takes a `cpu_target`, whose default compiles a generic version together with versions for newer processors on x86-64, so an app runs on older and newer processors of the family. juliac follows `JULIA_CPU_TARGET` when that environment variable is set, and otherwise, on Julia 1.13 and later, the target of Julia's own system image. StaticCompiler compiles for the processor of the computer that builds the program, with all of its features, so the program can fail on an older processor of the same kind, unless it is compiled with a `StaticTarget` for another processor.

## What Does an App of PackageCompiler Reveal About Its Source?

PackageCompiler's documentation notes that an app carries no source code, but that some of it can still be read back. Julia records the file and line of each method it compiles, so the absolute paths of the build computer, including the folder of the package, appear among the strings of the system image. The app folder also holds a `julia` program that starts with the app's system image, there so that the app can start new Julia processes for distributed computing; anyone can start it, list the names of the package's functions and globals, and read the lowered code of its methods. The preferences active while building are kept in `share/julia/LocalPreferences.toml`; when they may hold something confidential, the documentation suggests deleting the file before the app is distributed, or passing `include_preferences = false` to `create_app`.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Entry Points and Arguments](entry-points.md) · [Start-Up Time](startup.md) · [Writing for StaticCompiler](staticcompiler.md)
