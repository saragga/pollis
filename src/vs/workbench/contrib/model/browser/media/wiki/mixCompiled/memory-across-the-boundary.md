# Mix Julia with Compiled Code: Memory Across the Boundary

What compiled code sees of a Julia matrix, in what order its values are, how a complex number crosses, and who owns and frees the memory, in the tabs of Mix Julia with Compiled Code.

## What Does Compiled Code Receive When @ccall Passes a Julia Matrix?

When a `Matrix{Int32}` is passed to `@ccall` where the argument type is `Ptr{Int32}`, the compiled function receives the address of the matrix's first value and nothing else: not its height, not its width, not its type. That is why every `fill_counts` of Mix Julia with Compiled Code takes the height and width as separate arguments, and why their types must agree on both sides: an `Int64` in Julia is an `int64_t` in C and C++ and an `integer(c_int64_t)` in Fortran. The compiled code writes the counts into the memory of the Julia matrix itself, so after the call the matrix `compiled_counts` holds them, with no copy in either direction. The Julia manual states that `@ccall` keeps all its arguments from being collected by the garbage collector until the call returns, so the matrix cannot disappear while C, Fortran or C++ is writing to it.

## In What Order Are the Values of a Julia Matrix in Memory?

Julia stores a matrix column by column: the values of the first column come first, then those of the second, and so on. In Mix Julia with Compiled Code, row i is the height y and column j the width x, so the pixels of one vertical line of the picture are next to each other in memory. C and C++ receive a flat pointer and compute the place of a pixel themselves, as `counts[i + j * height]` with indices that start at 0. Fortran also stores arrays column by column, so the subroutine of **Call Fortran** declares `counts(height, width)` and writes `counts(i, j)`, with indices that start at 1, exactly as Julia writes `counts[i, j]`. A C library that expects rows one after another would need the transpose of the matrix, or its height and width swapped.

## How Does a Complex Number Cross to Fortran and C++?

The Julia manual lists `ComplexF64` as exactly the `complex double` of C and the `COMPLEX*16` of Fortran: two `Float64` values, the real part and then the imaginary part. **Call Fortran** therefore passes the point c of the Julia set as one argument of type `ComplexF64`, received by value as `complex(c_double_complex), value`, and the subroutine takes its parts with `real(c)` and `aimag(c)`. In C++, `std::complex<double>` holds its two parts in the same order, but it is a C++ class, not a C type, so the function behind `extern "C"` in **Call C++** takes it as `const std::complex<double> *`. On the Julia side, the argument type `Ref{ComplexF64}` makes Julia pass the address of a copy of c that it keeps alive for the call. **Call C** and **Julia Callback** pass the two parts of c as two `double` values.

## When Is GC.@preserve Needed with Compiled Code?

`@ccall` protects its own arguments, so passing a matrix directly needs nothing more, which is how every tab of Mix Julia with Compiled Code calls its compiled code. `GC.@preserve` is needed when a raw pointer is taken by hand, with `pointer(x)`, and used later: without it, nothing tells the garbage collector that `x` is still in use while the pointer is. The Julia manual advises passing variables directly to `@ccall` rather than taking pointers. A harder case is a C library that keeps a pointer to Julia memory after the call returns, to use it in a later call: the manual then asks that the Julia object be kept reachable, for example in a global vector, until the library says it is finished with it.

## Who Owns and Frees the Memory in Mix Julia with Compiled Code?

In **Call C**, **Call Fortran**, **Call C++** and **Julia Callback**, Julia allocates the matrix and Julia's garbage collector frees it: the compiled code only writes into it and must never free it. In **Julia from C** the roles are reversed. The C program allocates the memory for the counts with `malloc`, and the Julia function `fill_counts_at` sees it as a matrix with `unsafe_wrap`, which by default does not take ownership of the memory. Julia then writes the counts, the program saves them to a file and frees the memory with `free`. The rule in both directions is that the side that allocates memory frees it, with its own allocator: memory from `malloc` is freed with `free`, and memory from Julia is left to Julia.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Callbacks and Embedding](callbacks-and-embedding.md) · [The Same Result Across Compilers](same-result-across-compilers.md)
