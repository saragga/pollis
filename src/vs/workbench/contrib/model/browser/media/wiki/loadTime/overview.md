# Load and Compile Time: Overview

Load and Compile Time measures the time Julia takes before code gives its first result: loading a package and the packages it depends on, and compiling the code of its first use. Its three tabs, **Load Time**, **First Use** and **Inference Time**, each start a new Julia from the REPL, with the same environment, and print what it measures in the REPL.

## Where Does the Time Before the First Result Go in Julia?

The first time a Julia session runs some code, three things happen before the result. Loading the packages, with `using`, reads their precompiled code from disk and runs their initialisation, for the package and for every package it depends on. Compiling then turns each method the code calls into machine code for the types of its arguments, unless the package's precompiled code already holds that method for those types: type inference first, then the generation of native code. Only then does the code run. The second run of the same code skips the first two steps, which is why it is often far faster: the wait of the first run is the latency users notice when they start working with a package.

## Why Does Load and Compile Time Start a New Julia for Each Measure?

A package already loaded in the REPL takes no time to load again, and a method already compiled takes no time to compile, so a measure taken in a REPL that has been in use reports less than a new session would. The documentation of SnoopCompile advises starting from a fresh session for the same reason. Each tab of Load and Compile Time therefore runs its code in a new Julia process, started with `Base.julia_cmd()`, the environment of the REPL, `Base.active_project()`, and no startup file, and that process prints its results in the REPL before it ends. The REPL itself loads and compiles nothing of the package, so the measures can be repeated in the same session.

## What Do the Three Tabs of Load and Compile Time Show?

**Load Time** runs `@time_imports using` the package, which prints a line for each package loaded, the package and its dependencies in the order they load, with the time in milliseconds and the share of it spent compiling. **First Use** runs `@time` on loading the package and then twice on the code of **First Use**: the first run reports its time and the share of it spent compiling, and the second shows the time once the code is compiled. **Inference Time** records the first run with SnoopCompile's `@snoop_inference` and prints the total time of inference and code generation, then the ten methods whose inference took the longest, each with its own time and the time of what it called.

## How Is the Inference Time of SnoopCompile Read?

`@snoop_inference`, of SnoopCompileCore, records each method that type inference handles while the code runs, as a tree of calls with their times. The documentation of SnoopCompile describes two times for each node: an exclusive time, spent on that method alone, and an inclusive time, which adds the time of the methods it called; by default both include the generation of native code. `inclusive` of the root of the tree gives the total time recorded. `flatten` turns the tree into a list of methods sorted by their exclusive time, so its last entries are the methods that took the longest. SnoopCompileCore is loaded first and alone, so that the compiling of SnoopCompile itself is not recorded.

## What Do the Actions of Load and Compile Time Add?

**Invalidations** runs SnoopCompile's `@snoop_invalidations` on loading the package, and prints how many compiled methods it made invalid and the three causes that invalidate the most: a method that the package adds or changes, with the compiled code that depended on the old one. **Methods Compiled at First Use** starts Julia with the flag `--trace-compile`, which writes a precompile statement for each method compiled while the code runs. **Julia Alone and with the Package** times three new sessions, so that the share of starting Julia, of loading the package and of the first use shows. **Precompile Workload** prints the block of PrecompileTools that a package's author can add so that precompiling also compiles the first use.

## See Also

- [Factsheet](factsheet.md) · [Precompilation and Invalidations](precompilation-invalidations.md)
