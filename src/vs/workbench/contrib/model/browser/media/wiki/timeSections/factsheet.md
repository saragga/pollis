# Time Sections of Code: Factsheet

The tabs, inputs, macros, functions, printing options and actions of Time Sections of Code at a glance.

## Tabs of Time Sections of Code

| Tab | Macro | What becomes a section | Example |
|---|---|---|---|
| **Labelled Sections** | `@timeit to "label" code` | The code after the label | An analysis in three sections, one with two inside it |
| **Every Statement** | `@timeit_all to function ... end` | The function and each of its statements | A moving average |
| **Test Sets** | `@timed_testset to "title" begin ... end` | Each test set | Tests of the mean, the variance and a sort |

## Inputs of Time Sections of Code

| Input | Tab | Default | Meaning |
|---|---|---|---|
| **Values** | All | 1000 | The rows of the regression, the length of the series or the values tested |
| **Repetitions** | Labelled Sections | 20 | How many times the analysis runs on the timer |

The time of the whole code grows with both inputs, and the number of calls of a section in **Labelled Sections** is the number of repetitions.

## Functions of TimerOutputs Used by Time Sections of Code

| Function | What it does |
|---|---|
| `TimerOutput()` | A new, empty timer |
| `print_timer(to; ...)` | Prints the table of the timer |
| `reset_timer!(to)` | Removes every section and starts the timer again |
| `TimerOutputs.flatten(to)` | A timer whose sections of the same label are added together, wherever they were nested |
| `Tables.rows(to)` | A row for each section: `path`, `section`, `depth`, `ncalls`, `time_ns`, `gc_time_ns`, `allocated_bytes` and others |
| `NoTimerOutput()` | A timer that records nothing, whose sections compile away |

## Printing Options of print_timer

| Keyword | Effect |
|---|---|
| `allocations = false` | Leaves out the allocation columns |
| `compact = true` | Leaves out the averages and the bars |
| `gc = true` | Adds the time in garbage collection |
| `sortby` | `:time`, the default, `:ncalls`, `:allocations`, `:name` or `:firstexec` |
| `maxdepth` | Prints sections nested up to that depth |
| `complement = true` | Adds the rows of the time no section covers |
| `columns` | The columns to print, in order, such as `[:ncalls, :time, :time_min, :time_max]` |

## Actions of Time Sections of Code

| Group | Action | Output |
|---|---|---|
| Visualise | **Bar Chart of Sections** | The time of each section, by its path |
| Diagnose | **What Was Not Timed** | The table with the rows of time outside the sections |
| Diagnose | **Fastest and Slowest Calls** | The fastest and slowest call, the standard deviation and garbage collection |
| Compare | **With and Without the Timer** | The analysis with `TimerOutput` and with `NoTimerOutput`, in **Labelled Sections** |
| Interpret | **Shares of Time and Allocations** | Each top-level section's two shares side by side |
| Interpret | **Same Labels Added Together** | The table of `TimerOutputs.flatten` |

The actions use `to`, which the code of the tab sets: run the tab's code first.

## Further Reading on Timing Sections of Code

The README of TimerOutputs describes every macro and printing option, `@timeit_debug`, which turns the sections of a package on and off module by module, shared timers made with `get_timer`, merging the timers of several tasks with `merge!`, the conversion of a timer to a dictionary with `TimerOutputs.todict`, and a flame graph of the sections through FlameGraphs. Time a Function and Find Where the Time Goes, in Compose > Profiling, benchmark a call and profile it.

## See Also

- [Overview](overview.md) · [Sections, Profiles and Benchmarks](sections-profiles-benchmarks.md)
