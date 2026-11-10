# Load and Compile Time: Factsheet

The tabs, inputs, macros and actions of Load and Compile Time at a glance.

## Tabs of Load and Compile Time

| Tab | Macro | What it prints | Package |
|---|---|---|---|
| **Load Time** | `@time_imports` | Each package loaded, with its time in milliseconds and the share spent compiling | Base Julia |
| **First Use** | `@time` | The time of loading, of the first run and of the second, with the share spent compiling | Base Julia |
| **Inference Time** | `@snoop_inference` | The total time of inference and code generation, and the ten methods whose inference took the longest | SnoopCompile.jl |

Every tab and action but **Precompile Workload** runs its measure in a new Julia, started from the REPL with its environment and no startup file; the output prints in the REPL.

## Inputs of Load and Compile Time

| Input | Default | Meaning |
|---|---|---|
| **Package** | Distributions | The package whose load and first use are timed, as written after `using` |
| **First Use** | `fit(Normal, rand(Normal(0, 1), 1000))` | The code run once the package is loaded, on one line; **First Use** and **Inference Time** only, and the actions that use it |

The package must be in the environment of the REPL, since the new Julia uses that environment. The default package is installed if the REPL's Julia does not have it.

## Macros and Functions Used by Load and Compile Time

| Name | Package | What it does |
|---|---|---|
| `Base.julia_cmd` | Base | The command that starts the Julia running, with its options |
| `Base.active_project` | Base | The Project.toml of the active environment |
| `@time_imports` | InteractiveUtils | Times each package that a `using` loads |
| `@time` | Base | The time, allocations and compile share of an expression |
| `@snoop_inference` | SnoopCompileCore | Records the type inference of an expression as a tree of timings |
| `inclusive`, `flatten` | SnoopCompile | The total time of a tree, and its methods sorted by their own time |
| `@snoop_invalidations` | SnoopCompileCore | Records the compiled methods an expression invalidates |
| `uinvalidated`, `invalidation_trees` | SnoopCompile | The methods invalidated, and the trees of their causes |
| `@setup_workload`, `@compile_workload` | PrecompileTools | The workload that precompiling a package runs |

## Actions of Load and Compile Time

| Group | Action | Output |
|---|---|---|
| Diagnose | **Invalidations** | The number of compiled methods invalidated by loading the package, and the three causes that invalidate the most |
| Diagnose | **Methods Compiled at First Use** | The precompile statements written by `--trace-compile`, their number, and a file with all of them |
| Compare | **Julia Alone and with the Package** | The time of a new Julia alone, with the package loaded, and with its first use |
| Interpret | **Precompile Workload** | The block of PrecompileTools for the package's module, with the first use as its workload |

## Further Reading on Load and Compile Time

The documentation of SnoopCompile describes its tutorials on inference timing, invalidations and precompile directives, and the documentation of PrecompileTools describes `@setup_workload`, `@compile_workload` and what a package gains by them. The Julia manual describes `--trace-compile` and package images, the native code that precompiling stores. Find Where the Time Goes and Time a Function, in Compose > Profiling, measure the code once it is compiled.

## See Also

- [Overview](overview.md) · [Precompilation and Invalidations](precompilation-invalidations.md)
