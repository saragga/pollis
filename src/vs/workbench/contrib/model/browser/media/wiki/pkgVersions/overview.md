# Compare Package Versions: Overview

Compare Package Versions times the same Julia code with several versions of a package, from the Julia REPL, with AirspeedVelocity. Its **Releases** tab compares published versions of a package, chosen by their Git tags, and its **Local Clone** tab compares the branches and commits of a clone on the computer, with its uncommitted changes. Each tab prints one table: the median time of the code and its interquartile range in each version, and the time to load the package.

## How Does AirspeedVelocity Time Several Versions of a Package?

For each version it is given, AirspeedVelocity makes a new, temporary Julia environment, installs that version of the package in it with BenchmarkTools, and starts a new Julia process in that environment, the `julia` program on the path, without the startup file. The new process runs the benchmark script, which defines `SUITE`, a `BenchmarkGroup` of BenchmarkTools, runs every benchmark of `SUITE`, and writes the results to a JSON file, one for each version, named after the package and the version. Each version is therefore timed in a Julia of its own, with nothing loaded from the session that started it or from the other versions. `load_results` reads the JSON files back, and `create_table` makes the table.

## What Does the Benchmark Script of Compare Package Versions Contain?

Compare Package Versions writes the benchmark script itself, from two inputs. **Code to Time** is the call that is timed, such as `countmap(x)`. **Data** is the code that makes its arguments, such as `x = rand(1:10, 10000)`, which goes in the `setup` of the benchmark: BenchmarkTools runs the setup before each sample and leaves it out of the time. The script loads BenchmarkTools and the package, and gives the benchmark the name `code` in `SUITE`. The same script runs with every version, so the versions are timed on the same code. The **Benchmark Script** action prints it and where it was saved.

## What Is the Difference Between the Releases and Local Clone Tabs?

**Releases** takes a registered package by name and the versions to compare as Git tags of its repository, such as `v0.34.0`, or as branches. AirspeedVelocity installs each version from the package's repository. **Local Clone** takes the folder of a clone of the package on the computer, such as one that `Pkg.develop` made in `~/.julia/dev`, and the branches or commits to compare. The revision `dirty` stands for the files of the clone as they are, committed or not, so a change can be timed against the branch it starts from before it is committed. In both tabs the first version is the one the others are compared against.

## What Else Does AirspeedVelocity Measure Beside the Code?

AirspeedVelocity adds a benchmark of its own, `time_to_load`, beside the benchmarks of the script: the time to load the package with `using`, in a new Julia. It measures it once in the process that runs the benchmarks and again in further new processes, five samples by default, so the load time has a median and an interquartile range like the other benchmarks. A new version of a package can change its load time as much as the speed of its functions, through new dependencies, more code or changes to its precompilation. Load and Compile Time, in Compose > Profiling, shows where the load time of one version goes.

## What Do the Actions of Compare Package Versions Add?

**Bar Chart per Benchmark** draws the median time of each benchmark in each version, one chart for each, with the interquartile range as an error bar. **Releases in the Registry** lists the versions of the package in the registries of the Julia session, the names to put in **Releases**. **Benchmark Script** prints the script that ran. **Allocations and Memory** makes the table of the allocations and the memory of each benchmark in place of its time. **Is the Change Clear?** gives, for each benchmark, the median of the last version as a multiple of the first, and whether their interquartile ranges overlap. Every action uses `results`, which the code of the tab sets: run the tab's code first.

## See Also

- [Factsheet](factsheet.md) · [Reading a Comparison of Versions](reading-comparisons.md)
