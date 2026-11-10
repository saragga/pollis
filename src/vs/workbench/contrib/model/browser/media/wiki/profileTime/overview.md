# Find Where the Time Goes: Overview

Find Where the Time Goes profiles a call of a Julia function: it records where the code is while the call runs, and shows which functions and lines take the time. The panel runs Julia's profiler, Profile, and shows its samples in one of three reports: **Flame Graph**, **Line by Line** and **Text Report**.

## What Does a Sampling Profiler Record?

Julia's Profile is a sampling profiler. While the profiled code runs, it takes a backtrace at regular intervals: the function running at that moment, the function that called it, and so on down to the top level. Each backtrace is a sample. A line that appears in many samples is one where the code spends much of its time, so the share of the samples in a function estimates the share of the time spent in it and in the functions it calls. The interval and the size of the buffer that holds the samples are set with `Profile.init`. A sampling profiler leaves the code unchanged, so the profiled code runs at close to its normal speed, and functions that take very little time may not appear at all.

## How Does a Profile Attribute Time to the Functions That Call Others?

A program is made of small routines that implement abstractions for the routines that call them, and the time of a routine matters as part of the time of its callers. [Graham, Kessler and McKusick (1982)](#ref-GKM1982a) built gprof on this view: it combines samples of where the program is with counts of the calls between routines, and adds the running time of the routines called to the time of the routines that call them, a call graph profile. A backtrace holds the whole chain of calls, so Julia's profiler attributes each sample to the function running and to every function beneath it in the chain, which the flame graph and the tree report show.

## What Do the Three Tabs of Find Where the Time Goes Show?

**Flame Graph** runs `@profview`, a macro that Pollis' Julia REPL has from the Julia extension: it clears an earlier profile, profiles the expression and shows an interactive flame graph in a tab of Pollis. The ProfileCanvas documentation says that the Julia extension uses its viewer, which it describes as navigated with the mouse wheel and by clicking a frame to zoom on it, with calls resolved at run time in red and garbage collection in yellow. **Line by Line** writes the report of StatProfilerHTML: an HTML page for each source file, with the samples of each line, and a table of the functions. **Text Report** prints `Profile.print` in the REPL: with **Format** set to Tree, each call with the calls it makes indented beneath it; set to Flat, one line per line of code, with its count of samples.

## Why Does Find Where the Time Goes Call the Function Before Profiling It?

The first call of a function with arguments of given types compiles it, and the samples taken while Julia compiles show the compiler's functions, not the function profiled. Each tab of the panel calls the function once, then clears the profiler's buffer with `Profile.clear()`, then profiles the call. **Repeats** runs the call several times within the profile: a call that takes a fraction of a second gives few samples, and more samples make the shares of the functions more precise.

## Where Do the Reports of Find Where the Time Goes Open?

The **Flame Graph** opens in a tab of Pollis, where the Julia extension shows its profiles. The **Line by Line** report is a set of HTML pages written to the computer's temporary folder, `index.html` and the pages of the source files in the folder `pollis-statprof`. `Pollis.browse`, a function of every Julia session of Pollis, opens it in Pollis' browser; running the code again rewrites the report, which reloads in the tab already open. The **Text Report** needs no tab: it prints in the REPL, where it can be copied into notes or a question.

## How Are Allocations Profiled?

`Profile.Allocs` records the allocations of a call: for each allocation recorded, the type of the object, its size and the backtrace of the code that made it. Its `sample_rate` sets the fraction of allocations recorded: 1 records all of them, and a smaller rate costs less time. The **Allocation Flame Graph** action of the panel runs `@profview_allocs`, which records one allocation in a hundred and shows the result as a flame graph, the width of a frame then being the share of the memory allocated in a function and in the functions it calls.

## References

<a id="ref-GKM1982a"></a>Graham, S. L., Kessler, P. B. and McKusick, M. K. (1982). Gprof: a call graph execution profiler. *ACM SIGPLAN Notices* 17(6), 120–126. [doi:10.1145/872726.806987](https://doi.org/10.1145/872726.806987)

## See Also

- [Factsheet](factsheet.md) · [Reading a Flame Graph](reading-a-flame-graph.md)
