# Find Allocations: Overview

Find Allocations finds the memory a call of a Julia function allocates on the heap: which lines allocate, how many bytes, and objects of which types. It records what one call actually allocates with Julia's allocation profiler, `Profile.Allocs`, in the **By Line** and **By Type** tabs, and lists every place the compiled code may allocate with AllocCheck, in the **Possible Allocations** tab.

## What Is an Allocation in Julia?

An allocation takes memory on the heap for a new object whose size or lifetime the compiler cannot settle in advance: an array, a copy of a slice of an array, a string, or a value boxed because its type is not known when the code is compiled. Julia's garbage collector frees the memory of an object once nothing refers to it. Both steps cost time: allocating finds and prepares the memory, and collecting stops the program while it runs. A function that allocates in a loop that runs many times can spend more of its time on allocation and garbage collection than on its own work. Values whose type and size are known, such as numbers in local variables, usually need no heap memory at all.

## What Does Julia's Allocation Profiler Record?

`Profile.Allocs`, of Julia's standard library, records the allocations made while an expression runs. `Profile.Allocs.@profile sample_rate=1 expr` records each of them, and `Profile.Allocs.fetch()` returns them: for each allocation, the type of the object, its size in bytes and the stack trace of the code that made it. The **Sample Rate** of Find Allocations sets the share recorded: 1 records all of them, and a lower rate records each allocation with that probability, which costs less time on a call that allocates a great deal. `Profile.Allocs.clear()` empties the record before a new profile, and each tab of Find Allocations calls the function once first, so that the allocations of compiling it are not recorded.

## What Do the Three Tabs of Find Allocations Show?

**By Line** prints `Profile.print` of the allocations in its flat format: one line of code per row, with two counts in bytes, **Count**, the bytes allocated at that line and in the functions it calls, and **Overhead**, the bytes allocated at the line itself. The rows come sorted by Count, so the lines with the most bytes are last, just above the prompt. **By Type** groups the same allocations by the type of the object, such as `Vector{Float64}` or `Memory{Float64}`, with their number and bytes, the type with the most bytes first. **Possible Allocations** runs `check_allocs` of AllocCheck on the function, for the types of its arguments, and prints each place the compiled code may allocate, with its line and the calls that lead there.

## How Is Possible Allocations Different from By Line?

**By Line** and **By Type** record what one call of the function did, with the arguments given: a path the call did not take, such as the branch for an empty input, leaves no record. **Possible Allocations** runs nothing. The AllocCheck documentation describes `check_allocs` as compiling the function for the types of its arguments and checking the compiled code for allocations, so it reports every place that may allocate, on any path. Its report can therefore name places a call never reaches, and its documentation says it determines whether a function may allocate, which differs from measuring what a call did. By default it leaves out the allocations of throwing an error, with `ignore_throw = true`.

## How Does Find Allocations Check That a Function No Longer Allocates?

The **Check No Allocations** action of Find Allocations uses AllocCheck's macro `@check_allocs`. A function defined with it is compiled and checked when it is first called, and the call raises an `AllocCheckFailure` when its code may allocate, with each place in its `errors`; otherwise it runs as usual. The action prints either that nothing may allocate or the places found, each with its line. For the default function, it checks `rolling_mean!`, which writes the means into an array that its caller allocates once, since a function that returns a new array must allocate it. The AllocCheck documentation suggests checking the top-level entry point of a computation or its main loop, rather than every function.

## See Also

- [Factsheet](factsheet.md) · [Heap, Stack and Garbage Collection](heap-stack-gc.md)
