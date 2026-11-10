# Add a Language: Overview

Add a Language adds C, Fortran or Rust to the race of Run a Speed Race, from the Julia REPL. Each tab writes the races in its language, compiles them to a shared library with the compiler on the computer, calls the library from Julia, checks that its result agrees with Julia's, and times it. When the race of Run a Speed Race ran on the same values in the same session, the language joins it, beside Julia, Python and R.

## How Does Add a Language Bring a Language into the Race?

Each tab of Add a Language goes through the same four steps. **Toolchain** finds the compiler on the path: GCC for C, gfortran for Fortran and rustc for Rust, with a message on how to install it when it is missing. **Build** writes the source to a folder of `~/.pollis/race` and compiles it to a shared library at the chosen **Optimisation** level. **Call** opens the library and calls the function of the race with `ccall`, Julia's way of calling compiled code. **Check** compares the result with Julia's, to a relative difference of 1 in 100 million, before any time is taken: a program that computes something else is stopped there.

## How Does a Compiled Language Join the Race of Run a Speed Race?

Run a Speed Race leaves its results and times in `race`, in the Julia session. Add a Language makes the values with the same seed as Run a Speed Race, so the same number of values gives the same numbers, and computes Julia's result on them. When `race` exists and its Julia result is the same, the new language is added to it, and the race then holds Julia, Python, R and the new language; another tab adds another language. When there is no such race, the language races Julia alone. **Race** chooses which of the three races of Run a Speed Race the language joins.

## Why Is the Compiled Code Timed from Julia?

Run a Speed Race times Python and R inside each language, because calling them from Julia converts or copies the data. A compiled function is called from Julia with `ccall` as a call into C: the values of the Julia vector are passed as a pointer to the memory where they already are, with nothing copied or converted. The Julia manual describes a `ccall` as compiled to the same machine code as a call from C, so Add a Language times the compiled function from Julia with Chairmarks, the timer that Run a Speed Race uses for Julia, and the two languages are timed in the same way.

## Which Races Does Each Language Run in Add a Language?

**Loop** is the sum of squared deviations from the mean written as a loop, in all three languages. **Vectorised** is the same sum written with operations on whole arrays: Fortran has them in the language, with `sum` over an array expression; Rust writes it with iterators over the slice; C has no operations on whole arrays, so its Vectorised race is the loop again. **Sort** copies and sorts the values and returns the one in the middle: C with `qsort` of the C library, Rust with `sort_unstable_by` of its standard library. Fortran has no sort in its standard library, so it takes part in Loop and Vectorised only.

## What Do the Actions of Add a Language Add?

**Bar Chart of Times** draws the time of a call in each language of the race on a log scale. **Source and Build Command** prints the source, where it is saved, the command that built the library and the version of the compiler. **Times Across Sizes** times Julia and the compiled language on 1 000 to 1 000 000 values. **Optimisation Levels** builds the race at levels 0 to 3 and times each beside Julia. **Results Digit by Digit** prints each result in full, and **Time per Element** gives nanoseconds a value. The actions use `race`, `julia_race` and `compiled_function`, which the code of the tab sets: run the tab's code first.

## See Also

- [Factsheet](factsheet.md) · [Calling Compiled Code from Julia](calling-compiled-code.md)
