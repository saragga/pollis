# Speed Up a Function: Overview

Speed Up a Function takes a Julia function from slow to fast in four steps, each running its code in the Julia REPL: **The Function**, the call to speed up; **Diagnose**, where its time goes; **Change**, a faster version of it; and **Compare**, which checks that the two versions give the same result and then times them. The example is a sample variance written slowly on purpose.

## Why Does Speed Up a Function Diagnose Before Changing the Code?

A change made on a guess at why a function is slow often speeds up a part of it that takes little of the time, and leaves the slow part as it was. The **Diagnose** step of Speed Up a Function looks first at three common causes. **Type Stability** shows whether Julia can infer one concrete type for each variable of the function, which lets it compile code specialised to those types. **Allocations** counts the memory one call takes on the heap, which costs time to allocate and to collect as garbage. **Profile** draws the flame graph of a few calls, which shows the functions and lines where the time goes. Each points at a kind of change that Common Ways to Speed Up Julia Code describes, so the change made in the **Change** step answers what the diagnosis found.

## What Does the Example of Speed Up a Function Show?

The example of Speed Up a Function, `slow_var`, computes the sample variance of a vector of simulated values with two faults placed on purpose. Its sum starts as the integer `0` and becomes a floating-point number in the first pass of the loop, so the type of the sum changes, which **Type Stability** shows as a `Union` of two types. It also computes the mean of the vector again in each pass of the loop, so a call reads the whole vector once for each of its values, which **Profile** shows as a wide frame of `sum`. The faster version, `fast_var`, computes the mean once, before the loop, and starts the sum at a zero of the type of the values.

## Why Does the Compare Step Check the Result First?

A faster version of a function is a speed-up only if it computes the same thing. The **Compare** step of Speed Up a Function calls both versions with the same arguments and checks their results with `isequal`, and with `isapprox` when they are numbers or arrays of numbers. Floating-point addition is not associative: a change that adds the same numbers in another order, or that computes a mean once instead of many times, can change the last digits of a result, which `isapprox` accepts and `isequal` does not. A result that differs by more says that the change has altered what the function computes, and the times that follow then compare two different computations.

## How Does the Compare Step Time the Two Versions?

The **Compare** step of Speed Up a Function benchmarks each version with `@benchmark` of BenchmarkTools for about a second, with the arguments interpolated, and prints the minimum time of a call and the allocations of each, and how many times as fast the faster version is. It then calls `judge` on the medians of the two benchmarks, which says whether the change is an improvement, a regression or invariant: by default, invariant when the medians are within 5% of each other. [Chen and Revels (2016)](#ref-CR2016a) describe the strategy of BenchmarkTools and argue for the minimum as the estimate least affected by other work on the computer. [Kalibera and Jones (2013)](#ref-KJ2013a) describe how many repetitions a comparison of two versions needs for a given precision.

## What Does Speed Up with Agent Do?

**Speed Up with Agent**, in the **Change** step of Speed Up a Function, starts the user's coding agent with the skill Speed Up a Function. The agent finds the function, in the folder of the workspace or, for the example, in a file that Pollis saves first, and diagnoses it in a Julia session of its own. It then explains its plan before writing any code: what the diagnosis found, each change it proposes with the finding that calls for it, and what it leaves out. Once the user agrees, it writes the faster version in a new file beside the function's, with the reason for each change in a comment, and checks that it gives the same result. The function's own file is never changed. The **Compare** step then times the two versions in the user's REPL, after the new file is included.

## References

<a id="ref-CR2016a"></a>Chen, J. and Revels, J. (2016). Robust benchmarking in noisy environments. [arXiv:1608.04295](https://arxiv.org/abs/1608.04295)

<a id="ref-KJ2013a"></a>Kalibera, T. and Jones, R. (2013). Rigorous benchmarking in reasonable time. In *Proceedings of the 2013 International Symposium on Memory Management*, 63–74. [doi:10.1145/2464157.2464160](https://doi.org/10.1145/2464157.2464160)

## See Also

- [Factsheet](factsheet.md) · [Common Ways to Speed Up Julia Code](common-fixes.md)
