# Time a Function: Overview

Time a Function measures how long a call of a Julia function takes. The panel has three tabs: **Chairmarks** and **BenchmarkTools**, two packages that run the call many times and summarise the times, and **First Call**, which sets the first call of a function, when Julia compiles it, beside a later one.

## Why Does a Benchmark Run a Function Many Times?

A single timing of a fast call is mostly noise: the timer has its own cost and resolution, and the operating system, other programs and the hardware delay some calls and not others. [Chen and Revels (2016)](#ref-CR2016a) describe a benchmarking strategy for these conditions, on which the BenchmarkTools.jl package is built. They treat the delays the environment adds as noise that can only lengthen a measurement, which is why BenchmarkTools reports the minimum time as a robust estimate of the time of the call. Their strategy also chooses how many times the call is evaluated within each sample, so that the timer's own cost is small beside the time measured. Chairmarks and BenchmarkTools both take many samples of a call and report the minimum among their summaries.

## What Does the Chairmarks Tab of Time a Function Measure?

The **Chairmarks** tab runs `@be x f`: `x` is the setup, computed outside the timing, and `f` is called on it, sample after sample, for the number of **Seconds** given. `@be` returns every sample: the Chairmarks documentation describes the fields of a sample as the number of evaluations, the time per evaluation in seconds, the allocations and bytes per evaluation, and the fractions of the time spent in garbage collection and in compiling. `@b` gives one sample made of the minimum of each field, the quickest summary, and stops after a tenth of a second by default. On Julia 1.9 and later, `median`, `mean` and `quantile` of a benchmark are defined field by field, as `minimum` and `maximum` are.

## What Does the BenchmarkTools Tab of Time a Function Measure?

The **BenchmarkTools** tab runs `@benchmark f($x)`. The `$` splices the value of `x` into the benchmarked expression, so that the time of looking up a global variable is left out. BenchmarkTools displays the result as a trial: the minimum, median, mean and maximum time, a histogram of the times of the samples, and estimates of the memory allocated and the number of allocations. Its documentation gives a default time budget of five seconds for a benchmark and at most 10 000 samples. `judge` compares two estimates, such as the medians of two versions of a function, and classifies the change as an improvement, a regression or invariant, with a default tolerance of 5% on time.

## What Does the First Call Tab of Time a Function Measure?

Julia compiles a method of a function the first time it is called with arguments of given types, and later calls with arguments of the same types run the compiled code. The **First Call** tab times two calls in a row with `@timed`: the first includes compiling, the second only runs. On Julia 1.11 and later, `@timed` also returns the time spent compiling, which the tab prints. A function that has already run on arguments of the same types is not compiled again, so a first call is timed in a new session of the REPL. Compile time is what a user of a package waits for once; the time of a later call is what a long computation repeats.

## Minimum, Median or Confidence Interval: Which Summary of the Times?

The minimum, as [Chen and Revels (2016)](#ref-CR2016a) argue, estimates the time of the call with the least disturbance from the environment. The median and the mean also count the delays that a program meets when it runs among others, and the histogram shows how they spread. [Kalibera and Jones (2013)](#ref-KJ2013a) set out a statistically rigorous method for repeating benchmarks and summarising their results, in which the repetitions go where the variation arises, between builds, executions or iterations, and a difference between two systems is reported as an effect size with a confidence interval. The **Timing Stability** action of the panel repeats a benchmark ten times and shows how much its minimum varies.

## References

<a id="ref-CR2016a"></a>Chen, J. and Revels, J. (2016). Robust benchmarking in noisy environments. [arXiv:1608.04295](https://arxiv.org/abs/1608.04295)

<a id="ref-KJ2013a"></a>Kalibera, T. and Jones, R. (2013). Rigorous benchmarking in reasonable time. In *Proceedings of the 2013 International Symposium on Memory Management*, 63–74. [doi:10.1145/2464157.2464160](https://doi.org/10.1145/2464157.2464160)

## See Also

- [Factsheet](factsheet.md) · [Benchmarking Pitfalls](benchmarking-pitfalls.md)
