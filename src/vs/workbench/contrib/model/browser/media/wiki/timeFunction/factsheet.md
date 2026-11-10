# Time a Function: Factsheet

The tabs, inputs, macros and actions of Time a Function at a glance.

## Tabs of Time a Function

| Tab | Macro | Result | Package |
|---|---|---|---|
| **Chairmarks** | `@be x f` | Every sample: time, allocations, bytes, garbage collection and compile fractions | Chairmarks.jl |
| **BenchmarkTools** | `@benchmark f($x)` | Minimum, median, mean and maximum, a histogram of the times, memory estimate | BenchmarkTools.jl |
| **First Call** | `@timed f(x)`, twice | Time of the first call and of the second, and time compiling on Julia 1.11 and later | Base Julia |

## Inputs of Time a Function

| Input | Default | Meaning |
|---|---|---|
| **Function** | work | The function to time, by name; the default is the mean square of a vector |
| **Argument** | x | The argument of the call: a variable or an expression; the default is 10 000 simulated values |
| **Seconds** | 1 | Time budget of the benchmark, **Chairmarks** and **BenchmarkTools** only |

## Macros and Functions Used by Time a Function

| Name | Package | What it does |
|---|---|---|
| `@b` | Chairmarks | One sample made of the minimum of each field over the samples |
| `@be` | Chairmarks | A benchmark: the vector of its samples |
| `@benchmark` | BenchmarkTools | A trial: the times and memory of every sample |
| `judge` | BenchmarkTools | Improvement, regression or invariant, between two estimates |
| `@timed` | Base | The value, time, bytes, garbage collection time and, on Julia 1.11 and later, compile time of one call |
| `@code_warntype` | InteractiveUtils | The types inferred for the variables of a call |

## Times and Units in Time a Function

| Result | Unit |
|---|---|
| `time` of a Chairmarks sample | Seconds per evaluation |
| `times` of a BenchmarkTools trial, and the `time` of its estimates | Nanoseconds |
| `time` and `compile_time` of `@timed` | Seconds |

The code of the panel converts these units when it prints: the time of a call in microseconds, and the calls of the **First Call** tab in milliseconds.

## Actions of Time a Function

| Group | Action | Output |
|---|---|---|
| Visualise | **Histogram of Times** | Histogram of the time of a call in each sample, with the minimum marked |
| Diagnose | **Allocations** | Allocations and bytes of one call |
| Diagnose | **Type Stability** | `@code_warntype` of the call |
| Diagnose | **Timing Stability** | Minimum of ten separate benchmarks and their spread |
| Predict | **Time Across Sizes** | Time for inputs of 100 to 1 000 000 values on log scales, the growth between the two largest, and the time it suggests for 10 000 000 |
| Compare | **Two Versions** | Time, allocations and ratio of the times of the function and of a changed version, `other` |
| Compare | **Judge a Change** | `judge` on the medians of the function and of `other` |
| Compare | **Chairmarks and BenchmarkTools** | Minimum of the same call by both packages, and how long each benchmark ran |
| Interpret | **Garbage Collection and Compiling** | Share of the time of the samples in garbage collection and in compiling |
| Interpret | **Time per Element** | Minimum time divided by the number of elements of the argument |

**Two Versions** and **Judge a Change** define `other` for the default function only; with a function of your own, `other` is your changed version of it.

## Further Reading on Benchmarking

| Topic | Source |
|---|---|
| The strategy of BenchmarkTools, and the minimum as an estimate | [Chen and Revels (2016)](#ref-CR2016a) |
| Repetitions and confidence intervals for comparing two systems | [Kalibera and Jones (2013)](#ref-KJ2013a) |
| How the setup of the computer biases a measurement | [Mytkowicz, Diwan, Hauswirth and Sweeney (2009)](#ref-MDHS2009a) |

The documentation of Chairmarks and of BenchmarkTools describes their macros, the fields of their results and their keyword arguments, such as `seconds`, `samples` and `evals`.

## References

<a id="ref-CR2016a"></a>Chen, J. and Revels, J. (2016). Robust benchmarking in noisy environments. [arXiv:1608.04295](https://arxiv.org/abs/1608.04295)

<a id="ref-KJ2013a"></a>Kalibera, T. and Jones, R. (2013). Rigorous benchmarking in reasonable time. In *Proceedings of the 2013 International Symposium on Memory Management*, 63–74. [doi:10.1145/2464157.2464160](https://doi.org/10.1145/2464157.2464160)

<a id="ref-MDHS2009a"></a>Mytkowicz, T., Diwan, A., Hauswirth, M. and Sweeney, P. F. (2009). Producing wrong data without doing anything obviously wrong! In *Proceedings of the 14th International Conference on Architectural Support for Programming Languages and Operating Systems*, 265–276. [doi:10.1145/1508244.1508275](https://doi.org/10.1145/1508244.1508275)

## See Also

- [Overview](overview.md) · [Benchmarking Pitfalls](benchmarking-pitfalls.md)
