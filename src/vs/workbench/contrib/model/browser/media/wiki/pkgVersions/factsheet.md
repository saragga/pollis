# Compare Package Versions: Factsheet

The tabs, inputs, functions, files and actions of Compare Package Versions at a glance.

## Tabs of Compare Package Versions

| Tab | Versions compared | Where AirspeedVelocity takes them from |
|---|---|---|
| **Releases** | Git tags or branches, such as `v0.34.0` | The repository of the registered package |
| **Local Clone** | Branches, commits and `dirty` | A clone of the package on the computer |

`dirty` is the clone's files as they are, with the changes not yet committed. The first version in the list is the one the others are compared against.

## Inputs of Compare Package Versions

| Input | Tab | Default | Meaning |
|---|---|---|---|
| **Package** | Both | `StatsBase` | The package, by name |
| **Releases** | Releases | `v0.34.0, v0.34.13` | The versions, separated by commas |
| **Local Clone** | Local Clone | empty | The folder of the clone |
| **Revisions** | Local Clone | `main, dirty` | The branches or commits, separated by commas |
| **Data** | Both | `x = rand(1:10, 10000)` | The setup of the benchmark, not timed |
| **Code to Time** | Both | `countmap(x)` | The call timed with each version |

## Functions of AirspeedVelocity Used by Compare Package Versions

| Function | What it does |
|---|---|
| `benchmark(name, revs; script, output_dir, path)` | Installs each version in a new environment, runs the script in a new Julia, writes a JSON file of results for each |
| `load_results(name, revs; input_dir)` | Reads the JSON files into one dictionary, by version and then by benchmark |
| `create_table(results)` | A Markdown table of the median ± interquartile range of each benchmark in each version |
| `create_table(results; key = "memory")` | The same table of the allocations and the memory |

With two versions, `create_table` adds a column with the ratio of the first version's value to the second's.

## Files Written by Compare Package Versions

| File | Where | Content |
|---|---|---|
| The benchmark script | `pollis-airspeed-<package>.jl` in the temporary folder | `SUITE`, with the benchmark `code` |
| The results | `results_<package>@<version>.json` in `pollis-airspeed` of the temporary folder | The times, allocations and memory of each benchmark, for one version |

The temporary folder is the one `tempdir()` returns. A result file is replaced when the same version of the same package is timed again.

## Actions of Compare Package Versions

| Group | Action | Output |
|---|---|---|
| Visualise | **Bar Chart per Benchmark** | The median of each benchmark in each version, with its interquartile range |
| Diagnose | **Releases in the Registry** | The last versions of the package in the registries of the session |
| Diagnose | **Benchmark Script** | The script that ran, and where it is |
| Compare | **Allocations and Memory** | The table of allocations and memory of each version |
| Interpret | **Is the Change Clear?** | The median of the last version as a multiple of the first, and whether the interquartile ranges overlap |

The actions use `results`, which the code of the tab sets: run the tab's code first.

## Further Reading on Comparing Package Versions

The README of AirspeedVelocity describes its command-line programs, `benchpkg`, `benchpkgtable` and `benchpkgplot`, their options, and a GitHub Action that comments a table on each pull request; its documentation lists the functions of its Julia interface. The manual of BenchmarkTools describes `BenchmarkGroup`, `@benchmarkable`, its `setup` and the parameters of a benchmark. Time a Function, in Compose > Profiling, times code with one version of a package.

## See Also

- [Overview](overview.md) · [Reading a Comparison of Versions](reading-comparisons.md)
