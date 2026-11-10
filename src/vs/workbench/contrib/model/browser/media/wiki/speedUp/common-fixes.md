# Speed Up a Function: Common Ways to Speed Up Julia Code

The changes listed in the **Change** step of Speed Up a Function, each with the problem it answers and the diagnosis that shows it. The Performance Tips of the Julia manual describe each of them at more length.

## Why Start a Sum at zero(eltype(x)) in Julia?

A variable whose type changes inside a function is not type stable: Julia cannot compile the code that uses it for one concrete type, and either checks its type on each use or treats it as a value of any type. A common case is a sum started at the integer `0` and then added to floating-point numbers: after the first pass of the loop it is a `Float64`, so its type is a `Union` of `Int64` and `Float64`. Starting it at `zero(eltype(x))`, a zero of the type of the values, keeps its type the same throughout. The **Type Stability** diagnosis of Speed Up a Function shows such a variable in colour in the output of `@code_warntype`.

## Why Is a Global Variable Slow Inside a Julia Function?

A global variable that is not declared `const` can be given a value of any type at any time, so a function that reads it cannot know its type when it is compiled. Every use of it inside the function is then resolved while the code runs, and its value may need to be boxed, which allocates memory. The Performance Tips of the Julia manual recommend passing the data to the function as an argument, or declaring the global with `const` when its value is fixed, or giving it a type, `x::Vector{Float64} = ...`. The **Type Stability** diagnosis of Speed Up a Function shows the reads of such a global with the type `Any`.

## Why Move Work out of a Loop in Julia?

Work inside a loop whose result does not change from one pass to the next is done again in every pass. When that work reads a whole array, such as a sum, a mean or a sort, a loop over the same array does it once for each element, so the time of the function grows with the square of the size of the array instead of in proportion to it. Computing it once, before the loop, and keeping the result in a variable removes the repeated work without changing the result beyond the last digits. The **Profile** diagnosis of Speed Up a Function shows such work as a wide frame of the function repeated, beneath the frame of the function being sped up.

## How Do Preallocation and Functions Ending in ! Avoid Allocations?

An array created in each pass of a loop, by a function that returns a new array or by an expression such as `a .+ b`, allocates memory on the heap every time, and Julia's garbage collector must later free it. Allocating the array once, before the loop, and filling it in place in each pass removes those allocations. By convention, Julia functions whose names end in `!` change one of their arguments, such as `sort!`, `mul!` and `map!`, and the dotted assignment `y .= a .+ b` writes into an existing `y`. The **Allocations** diagnosis of Speed Up a Function counts the allocations of a call, which a change of this kind lowers.

## Why Use @views for Slices of an Array in Julia?

A slice of an array, such as `x[2:end]` or `A[:, j]`, makes a copy by default: a new array, allocated on the heap, filled with the elements of the slice. A view reads the elements of the original array without copying them. The macro `@views`, put before an expression or a function, turns its slices into views, and `view(A, :, j)` makes one view. A view saves the allocation and the copy, which matters most for a slice taken inside a loop; it does not help when the slice is small or is then read many times, since a copy can be faster to read. The **Allocations** diagnosis of Speed Up a Function shows the allocations that slices add.

## Why Does the Order of Loops over a Matrix Matter in Julia?

Julia stores a matrix column by column: the elements of a column are next to each other in memory, and the elements of a row are a column's length apart. A processor reads memory in blocks, so a loop that runs down a column reads elements already brought into its cache, while one that runs along a row reads a new block for each element. In nested loops over a matrix `A[i, j]`, the loop over the first index, `i`, should be the innermost, as in `for j in axes(A, 2), i in axes(A, 1)`. The **Profile** diagnosis of Speed Up a Function shows the time of such a loop, but not its cause: the order of the loops is read in the code.

## When Do @inbounds and @simd Speed Up a Loop in Julia?

Julia checks that each index into an array is within its bounds, which costs a comparison on each access and can stop the compiler from turning a loop into vector instructions. The macro `@inbounds` removes those checks in the code it marks, and `@simd` allows the compiler to reorder the passes of a loop so that several are done at once by one instruction. Both are safe only when the indices are known to be valid, as with `eachindex(x)`: an index out of bounds under `@inbounds` reads or writes the wrong memory without an error. `@simd` can change the order in which floating-point numbers are added, and so the last digits of a sum. They are best kept for last, after the changes above.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md)
