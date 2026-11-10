# Add a Language: Calling Compiled Code from Julia

How Julia calls a function compiled from C, Fortran or Rust, as Add a Language does, what the optimisation level changes, and what a race against compiled code can show.

## What Is a Shared Library?

A shared library is a file of compiled functions that a running program loads and calls: `.so` on Linux, `.dylib` on macOS and `.dll` on Windows, the extension that `Libdl.dlext` gives in Julia. Compilers make one from source with an option, `-shared` for GCC and gfortran and `--crate-type cdylib` for rustc. `Libdl.dlopen` loads a library into the Julia process and `Libdl.dlsym` finds a function in it by name, giving its address. A library stays loaded once it is opened, so a library rebuilt under the same name would not be read again; Add a Language therefore gives a new name to the library of each new source.

## How Do C, Fortran and Rust Give a Function a Name Julia Can Call?

Julia calls compiled functions through the calling convention of C, the rules for passing arguments and results that most compiled languages can follow. A C function has it already, under its own name. Fortran adds `bind(c, name = "...")`, from the module `iso_c_binding` of the Fortran standard, which gives the function a C name and C arguments; the attribute `value` passes the number of values by value, as C does. Rust adds `extern "C"`, for the calling convention, and `#[no_mangle]`, which keeps the name as written instead of the one the compiler would make. All three races then take a pointer to the values and their number.

## How Does ccall Pass a Julia Vector to Compiled Code?

`ccall` takes the address of the function, the type of its result, the types of its arguments and the arguments. A `Vector{Float64}` passed where the type is `Ptr{Float64}` is passed as the address of its first element, which the Julia manual's section on calling C and Fortran code describes: the compiled function reads the values where Julia keeps them, and Julia keeps the vector from being freed while the call runs. Nothing is copied, so the compiled function sees exactly the numbers of the Julia vector. A function that changes the values, such as a sort in place, would change the Julia vector, which is why the Sort races of C and Rust sort a copy, as `sort` does in Julia.

## What Does the Optimisation Level of the Compiler Change?

The optimisation level tells the compiler how much work to put into making faster machine code. Level 0 translates the source almost line by line, which keeps the code easy to debug; levels 1 to 3 add more transformations, such as keeping values in registers, inlining calls and unrolling or vectorising loops. GCC and gfortran take `-O0` to `-O3`, and rustc takes `-C opt-level=0` to `3`. **Optimisation Levels** builds the race at each level and times it beside Julia, which compiles its own code with optimisations of its own. None of the levels allows the compiler to change the order of floating-point operations, so each result follows the order the source gives.

## Why Can Compiled Code and Julia Give Different Last Digits?

Floating-point addition depends on the order of the operations. The loops of C, Fortran and Rust add the values one after another, in the order of the source, and the compilers keep that order. Julia's `sum` adds the values pairwise, in a different order, so the mean, and through it the sum of squares, can differ in the last digits. The order in which the Fortran intrinsic `sum` adds its values is left to the compiler. Add a Language therefore checks the results to a relative difference of 1 in 100 million, and **Results Digit by Digit** prints them in full. A larger difference means the programs compute different things.

## What Can a Race Against Compiled Code Show?

A race against compiled code times one computation, written one way, built by one compiler with one set of options, on one computer. Julia and the three compiled languages all turn a loop into machine code, so the differences between them come from what each compiler does with it, which options such as the level or the target processor change. A sort measures the sort of a library: `qsort` of C calls the comparison through a pointer for each comparison, while the sorts of Rust and Julia are compiled for the type of the values. The times describe the race, not the languages in general.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md)
