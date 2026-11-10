# Run a Speed Race: Overview

Run a Speed Race times the same computation written in Julia, Python and R, on the same data, from the Julia REPL. Each of its three races, **Loop**, **Vectorised** and **Sort**, checks first that the three languages give the same result, and then prints the fastest time of a call in each language and its ratio to Julia's.

## How Does Run a Speed Race Run Python and R from Julia?

Run a Speed Race calls Python through PythonCall and R through RCall, two Julia packages that run the other language inside the same process as Julia. PythonCall uses a Python that CondaPkg installs for the active Julia environment, with the Python packages the code asks for, such as NumPy, so no Python needs to be installed beforehand. RCall uses the R installed on the computer, which it finds from the `R` program on the path or from the variable `R_HOME`; without an R installation, RCall cannot be installed. The data is made once in Julia, with a fixed seed, and copied to Python and to R, so that the three languages work on the same numbers.

## Why Does Each Language Time Itself in Run a Speed Race?

A call from Julia into Python or R crosses from one language to the other, converts its arguments and converts the result back, and that cost is not part of the computation being raced. Run a Speed Race therefore times each language inside that language, with its own timer: Chairmarks in Julia, the module `timeit` of Python's standard library, and `system.time` of base R. Each timer calls the code as many times as it takes for a short interval, at least a tenth of a second, and repeats that timing **Repeats** times; the fastest timing, divided by its number of calls, is the time of a call. The **Timed Inside and from Julia** action shows the cost the race leaves out, for R.

## What Do the Three Races of Run a Speed Race Compare?

**Loop** writes the sum of squared deviations from the mean as a loop over the values, in each language: Julia compiles the loop to machine code, while Python and R run each step of it in their interpreters, on a Python list and an R vector. **Vectorised** computes the same sum with operations on whole arrays: in Python with NumPy and in R with its vector arithmetic, both of which run their loops in compiled code. **Sort** sorts the values with each language's own sort, compiled code in all three, and returns the value in the middle. The three races differ in how much of the work the language itself runs, and how much compiled libraries run for it.

## Why Does Run a Speed Race Compare the Results First?

A faster program is the winner of a race only if it computes the same thing. Each race of Run a Speed Race returns, beside the times, the result of each language, and checks that they agree with Julia's to a relative difference of 1 in 100 million before it prints the times. Floating-point addition depends on the order of the operations, and the three languages may add the same numbers in different orders, so results agree to many digits but not always to the last one. The **Results Digit by Digit** action prints each result in full with its relative difference from Julia's. A difference larger than rounding means the programs compute different things, and their times are not comparable.

## What Do the Actions of Run a Speed Race Add?

**Bar Chart of Times** draws the time of a call in each language on a log scale, where equal ratios are equal steps. **Times Across Sizes** runs the race of the tab again on 1 000 to 1 000 000 values and plots each language's time against the number of values on log scales, which shows whether a fixed cost dominates for small inputs. **Results Digit by Digit** and **Timed Inside and from Julia** compare the results and the cost of calling R from Julia. **Time per Element** divides each time by the number of values, giving nanoseconds a value, which can be compared across sizes.

## See Also

- [Factsheet](factsheet.md) · [Timing Fairly Across Languages](timing-fairly.md)
