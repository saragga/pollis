# Time Sections of Code: Overview

Time Sections of Code times the parts of a script or a function that the user marks, with TimerOutputs, from the Julia REPL, and prints one table with the calls, the time and the allocations of each part. Its tabs are three ways of marking the parts: **Labelled Sections**, with `@timeit` and a label around each part, **Every Statement**, with `@timeit_all` before a function, and **Test Sets**, with `@timed_testset` in place of `@testset`.

## What Does TimerOutputs Record for Each Section?

TimerOutputs keeps its measurements in a `TimerOutput`, a timer made with `TimerOutput()`. Each time the code of a section runs, the timer adds one call, the time the section took and the bytes it allocated, and keeps the fastest and the slowest call. A section that runs again under the same label, in the same place, adds to the same row, so a section inside a loop of a thousand iterations is one row with a thousand calls. Sections can contain sections: a label used inside two different sections makes two rows, one under each. `print_timer(to)` prints the table of the timer `to`, and `reset_timer!(to)` empties it.

## How Is the Table of TimerOutputs Read?

Each row of the table that `print_timer` prints is a section, those inside another indented below it. The columns `ncalls`, `time`, `%tot` and `avg` give the number of calls, the total time of the section, its share of the total and the time of an average call; `alloc`, `%tot` and `avg` give the same for the bytes allocated. The bar columns draw each share. Above the rows, `Tot / % measured` gives the time and the allocations since the timer was made and the share of them that falls inside sections: a low share means much of the time went in code that no section covers. By default the rows are sorted by time, the slowest first.

## How Do the Three Tabs of Time Sections of Code Mark the Sections?

**Labelled Sections** places `@timeit to "label"` before each part to time, a single call or a `begin ... end` block, and the macro returns the value of the code it times, so the results can be assigned as before. **Every Statement** places `@timeit_all to` before a function: the whole function becomes a section, and each statement inside it, loops and conditions included, a section named by its line number. **Test Sets** replaces each `@testset` with `@timed_testset to`, which runs the tests as `@testset` does and adds each test set to the timer as a section. `Test` must be loaded where the test sets are written.

## Why Does the Code of Time Sections of Code Run Once Before Timing?

The first call of a Julia function compiles it for the types of its arguments, and the time of compiling falls in the section where the call happens. In **Labelled Sections**, the analysis therefore runs once on a timer of its own, which is thrown away, and then the repetitions run on the timer `to`. In **Every Statement**, the first call of the function is timed and then cleared with `reset_timer!`. In **Test Sets**, the first run is kept: a test suite runs once, compiling included, and its timings are meant to show the time the tests take as they run.

## What Do the Actions of Time Sections of Code Add?

**Bar Chart of Sections** draws the time of each section, named by its path. **What Was Not Timed** prints the table with `complement = true`, which adds a row for the time outside every section and, under each section, a row for the part outside its own sections. **Fastest and Slowest Calls** adds the fastest and slowest call, the standard deviation and the time in garbage collection. **With and Without the Timer** times the analysis with a `TimerOutput` and with a `NoTimerOutput`. **Shares of Time and Allocations** sets the two shares side by side, and **Same Labels Added Together** adds up the sections of one label. The actions use `to`, which the code of the tab sets: run the tab's code first.

## See Also

- [Factsheet](factsheet.md) · [Sections, Profiles and Benchmarks](sections-profiles-benchmarks.md)
