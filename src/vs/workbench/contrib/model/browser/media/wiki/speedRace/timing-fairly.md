# Run a Speed Race: Timing Fairly Across Languages

What makes a race between Julia, Python and R fair, as Run a Speed Race runs it, and what its times can and cannot say about the languages.

## What Makes a Race Between Languages Fair?

A race between languages compares their times on the same task only when four things hold. The programs work on the same data: Run a Speed Race makes the data once, in Julia, and copies it to the other languages. The programs compute the same thing: each race checks that the results agree before it prints the times. Each program is written the way a user of that language would write it for that task: a loop as a loop, whole-array operations with NumPy in Python and vector arithmetic in R. And each time is taken the same way: inside the language, the fastest of several timings, each long enough for the resolution of its timer.

## Why Keep the Fastest of Several Timings?

A timing of code includes the delays caused by everything else the computer does while the code runs: other programs, the operating system, a processor that changes its speed. Those delays only ever add time, so the fastest timing is the one least affected by them. The documentation of Python's `timeit` recommends the minimum of repeated timings for this reason, and `@b` of Chairmarks, the Julia timer of the race, reports the fastest of its samples. Run a Speed Race keeps the fastest of **Repeats** timings in each language, so that the three times are estimates of the same quantity, the time of a call when nothing else interferes.

## Why Is a Loop in Python or R Slower Than in Julia?

Julia compiles a function to machine code for the types of its arguments, so a loop over a vector of `Float64` runs as a loop of machine instructions. CPython, the usual Python, and R run code through interpreters: each step of a loop is a series of operations on objects whose types are checked as the code runs, which takes far longer than the arithmetic itself. NumPy and R's vector arithmetic avoid that cost by running the loop in compiled code, written in C or Fortran, on the whole array at once. The **Loop** race of Run a Speed Race shows the cost of interpreted loops; the **Vectorised** and **Sort** races show what compiled libraries recover.

## What Can a Speed Race Between Languages Not Say?

A race times one computation, written one way, on one computer, with given versions of the languages and their libraries. Another way of writing the same computation, such as a Python loop compiled with a just-in-time compiler or a sum in R through a compiled package, can change the order of the languages. The time of a library routine, such as a sort, measures the library more than the language that calls it. The time of a whole program also includes loading packages, compiling and reading data, which a race of one computation leaves out, and which Load and Compile Time, in Compose > Profiling, measures for Julia. The times of Run a Speed Race describe the race, not the languages in general.

## Why Does Calling Python or R from Julia Cost Time?

A call from Julia into R or Python crosses between two runtimes: the arguments are converted, or copied into the other language's objects, the call runs there, and the result is converted back. RCall copies a Julia vector into a new R vector each time it is passed with `$`; PythonCall can pass a Julia array to Python without a copy, and NumPy's `np.array` then copies it. For a short computation on a large array, the copy can take longer than the computation. Run a Speed Race leaves that cost out by timing inside each language, and the **Timed Inside and from Julia** action shows it for R.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md)
