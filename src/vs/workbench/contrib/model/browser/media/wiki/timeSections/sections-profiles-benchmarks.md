# Time Sections of Code: Sections, Profiles and Benchmarks

When to time sections of code with TimerOutputs, when to profile with a sampling profiler and when to benchmark with BenchmarkTools or Chairmarks, and what the cost of timing a section means for the table.

## When Are Timed Sections Better Than a Profile?

A sampling profiler, such as the one behind `@profview` in Find Where the Time Goes, records where the program is at regular intervals and needs no change to the code, but it reports functions and lines, as the compiler and the libraries arrange them. Timed sections report the parts the user names, such as reading the data, fitting the model and writing the results, whatever functions each part calls. They count every call of a section rather than sampling it, and give its allocations beside its time. Sections suit a long script or program whose steps are known; a profile suits the search for the function inside a step where the time goes.

## When Are Timed Sections Better Than a Benchmark?

A benchmark with BenchmarkTools or Chairmarks runs one call many times, in isolation, and gives the distribution of its time, which makes it the measure to compare two versions of a function. Timed sections measure the parts of a program as it runs, once or as many times as the program calls them, with the data and the state of a real run, and give the share of each part in the whole. The README of TimerOutputs advises BenchmarkTools for proper benchmarking. The two work together: the sections show which part of a program is worth speeding up, and a benchmark of that part shows whether a change made it faster.

## What Does Timing a Section Cost?

Each section that runs reads the clock and the count of allocated bytes when it starts and when it ends, and records them in the timer, which takes a small, fixed time each call; the README of TimerOutputs gives about 30 nanoseconds on a modern machine and says the package does not suit sections that finish very quickly. In **Every Statement**, a statement inside a loop is a section for each iteration, so a short statement can show more time than it takes without the timer. **With and Without the Timer** measures the cost on the analysis of **Labelled Sections**, by timing it with `TimerOutput` and with `NoTimerOutput`.

## How Can Timed Sections Stay in a Package's Code?

Sections of `@timeit` written into a package cost time each call even when nobody reads the table. TimerOutputs offers two ways to keep them at no cost. `NoTimerOutput()` is a timer whose operations do nothing: when its type is known to the compiler, as for a `const` or a type parameter of the struct that holds it, the sections compile away, and a `TimerOutput` in its place turns them on. `@timeit_debug` writes sections that are off by default in their module and are turned on with `TimerOutputs.enable_debug_timings` for that module, which recompiles the functions that use them.

## Can One Timer Be Used by Several Threads?

A `TimerOutput` keeps the section that is running as it goes, so the README of TimerOutputs says that one timer must be used by only one task at a time: sections timed on the same timer from several threads or tasks at once race with one another and give wrong rows. Code that runs in parallel gives each task a timer of its own and combines them at the end with `merge!`, which a lock protects, or with `merge`, which returns a new timer. The combined table then adds up the calls and times of the sections of all the tasks.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md)
