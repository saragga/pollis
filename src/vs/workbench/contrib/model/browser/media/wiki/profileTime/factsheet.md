# Find Where the Time Goes: Factsheet

The tabs, inputs, functions and actions of Find Where the Time Goes at a glance.

## Tabs of Find Where the Time Goes

| Tab | Report | Where it opens | Package |
|---|---|---|---|
| **Flame Graph** | An interactive flame graph, `@profview` | A tab of Pollis | Pollis' Julia REPL, from the Julia extension |
| **Line by Line** | Samples of each line of each source file, and a table of the functions, `statprofilehtml` | Pollis' browser | StatProfilerHTML.jl |
| **Text Report** | A tree of calls or a flat list of lines, `Profile.print` | The REPL | Profile, Julia's standard library |

## Inputs of Find Where the Time Goes

| Input | Default | Meaning |
|---|---|---|
| **Function** | bootstrap_median | The function to profile, by name; the default estimates the standard error of the median of a sample by the bootstrap |
| **Arguments** | x, 10000 | The arguments of the call, as written in it; the default is a simulated sample of 1 000 values and 10 000 resamples |
| **Repeats** | 5 | How many times the call runs within the profile |
| **Format** | Tree | Tree or Flat, **Text Report** only |

## Functions Used by Find Where the Time Goes

| Function | Package | What it does |
|---|---|---|
| `Profile.@profile` | Profile | Runs an expression and takes backtraces while it runs |
| `Profile.clear` | Profile | Empties the buffer of samples |
| `Profile.print` | Profile | Prints the samples as a tree or a flat list; `mincount` leaves out lines with fewer samples |
| `Profile.Allocs.@profile` | Profile | Records allocations, the fraction set by `sample_rate` |
| `@profview` | Pollis' Julia REPL | Clears the samples, profiles an expression and shows its flame graph |
| `view_profile` | Pollis' Julia REPL | Shows the flame graph of the samples taken; `C = true` keeps the frames of C code |
| `@profview_allocs` | Pollis' Julia REPL | Records the allocations of an expression, the fraction set by `sample_rate`, and shows their flame graph |
| `statprofilehtml` | StatProfilerHTML | Writes the line-by-line report to the folder `path` |
| `Pollis.browse` | Pollis | Opens an HTML file or a link in Pollis' browser |

## Files Written by Find Where the Time Goes

| Report | File, in the temporary folder |
|---|---|
| **Line by Line** | `pollis-statprof/index.html` |
| **Before and After a Change** | `pollis-statprof-before/index.html` and `pollis-statprof-after/index.html` |

The flame graphs of `@profview`, `view_profile` and `@profview_allocs` are not files: they open in a tab of Pollis. Each run of a line-by-line report rewrites its folder, and `Pollis.browse` reloads the page in the tab of Pollis' browser that shows it. The folders stay in the temporary folder until the system clears it.

## Actions of Find Where the Time Goes

| Group | Action | Output |
|---|---|---|
| Visualise | **Allocation Flame Graph** | A flame graph of the memory allocated, one allocation in a hundred recorded |
| Visualise | **Flame Graph with C Code** | The flame graph with the frames of the runtime and of libraries in C |
| Diagnose | **Type Instabilities** | `@code_warntype` of the call |
| Diagnose | **Garbage Collection** | Time of a call, memory allocated and share of the time collecting garbage |
| Compare | **Before and After a Change** | Line-by-line reports of the function and of a changed version, `other`, with the time of a call of each |

**Before and After a Change** defines `other` for the default function only; with a function of your own, `other` is your changed version of it.

## Further Reading on Profiling

| Topic | Source |
|---|---|
| Attributing the time of routines to their callers, the call graph profile | [Graham, Kessler and McKusick (1982)](#ref-GKM1982a) |
| Flame graphs: what the axes, widths and the top edge show | [Gregg (2016)](#ref-Gre2016a) |

The documentation of ProfileCanvas, whose viewer the Julia extension uses for its flame graphs, and of StatProfilerHTML describes their reports, and the chapter on profiling of the Julia manual describes Profile, Profile.Allocs and the options of `Profile.print`.

## References

<a id="ref-GKM1982a"></a>Graham, S. L., Kessler, P. B. and McKusick, M. K. (1982). Gprof: a call graph execution profiler. *ACM SIGPLAN Notices* 17(6), 120–126. [doi:10.1145/872726.806987](https://doi.org/10.1145/872726.806987)

<a id="ref-Gre2016a"></a>Gregg, B. (2016). The flame graph. *Communications of the ACM* 59(6), 48–57. [doi:10.1145/2909476](https://doi.org/10.1145/2909476)

## See Also

- [Overview](overview.md) · [Reading a Flame Graph](reading-a-flame-graph.md)
