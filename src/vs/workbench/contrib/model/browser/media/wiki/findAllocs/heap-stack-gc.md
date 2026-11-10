# Find Allocations: Heap, Stack and Garbage Collection

Why an allocation costs time, which values need no heap memory, and how to read the counts of Find Allocations, from Julia's allocation profiler and from AllocCheck.

## Why Does an Allocation on the Heap Cost Time?

Memory on the heap is shared by every object a program makes, and an object there lives until nothing refers to it. Allocating finds a free block of the right size and records it, and Julia's garbage collector later walks the objects still in use to find the memory it can free. A collection pauses the program, and the more the program allocates, the more often collections run. The time a call spends collecting garbage is part of its time, which `@timed` and `@time` report beside the time of the call. An allocation made once, before a loop, is rarely a problem; the same allocation made in every pass of a loop that runs a million times can take most of the time of the function.

## Which Values Need No Heap Memory in Julia?

A value whose type and size the compiler knows, and which does not outlive the function that makes it, can stay out of the heap: numbers in local variables, and immutable structs and tuples of such values, are usually kept in the processor's registers or on the stack, the memory of the function call, which is freed at no cost when the call returns. A value whose type is known only at run time must be boxed: put in a heap object that also records its type. That is why a variable whose type changes, or a global variable that is not `const`, can allocate in Find Allocations even in code that makes no array. An array is mutable and of a size known only at run time, so making one allocates.

## Why Does a Copy of a Slice Allocate in Julia?

An expression that indexes an array with a range, such as `x[i-w+1:i]` or `A[:, j]`, returns a new array holding a copy of the elements, which is allocated on the heap. A view, made by `view(x, i-w+1:i)` or by the macro `@views`, refers to the elements of the original array without copying them, and the compiler can often keep it off the heap. The same holds for operations that return new arrays: `a .+ b` allocates its result, while `y .= a .+ b` writes into the existing `y`. In the **By Type** tab of Find Allocations, copies of slices appear as arrays of the element type of the original, made as many times as the line runs.

## Why Does push! Allocate Only Some of the Time?

An array that grows with `push!` keeps spare room beyond its length, and a call of `push!` that fits in that room allocates nothing. When the room runs out, Julia allocates a larger block of memory, copies the elements into it, and the old block becomes garbage. The new block is larger than the old one, so that later calls of `push!` again find room, but each reallocation copies every element made so far, and a function that builds a long array this way makes several such copies. An array allocated once at its final size, with `zeros`, `similar` or `Vector{Float64}(undef, n)`, or one with room reserved by `sizehint!`, avoids those copies. **By Line** shows the allocations of `push!` at the line that calls it.

## What Does the Sample Rate Change in the Counts of Find Allocations?

With a **Sample Rate** below 1, `Profile.Allocs` records each allocation with that probability, so the counts and bytes of **By Line** and **By Type** are those of a sample of the allocations, not of all of them. The share of each line or type in the total is then an estimate, more precise when the call makes many allocations, and an allocation made a few times may not be recorded at all. Dividing a count by the sample rate estimates the number of allocations of the call. A rate of 1 records each allocation, which slows a call that allocates a great deal; for a function that allocates a few thousand times, a rate of 1 costs little.

## Why Can AllocCheck Report an Allocation That a Call Never Makes?

AllocCheck checks the compiled code of a function for the types of its arguments, without running it. Every place where that code may allocate is reported, on every path: the branch for an input that never occurs, a fallback that grows an array, or a dynamic dispatch that might box a value. The **Possible Allocations** tab of Find Allocations can therefore list more places than **By Line** records for a given call, and a function can pass a test with `@allocations` and still fail `@check_allocs`. By default, AllocCheck leaves out the allocations made when an error is thrown.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md)
