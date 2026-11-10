# Time a Function: Benchmarking Pitfalls

A benchmark can report a time that is not the time of the call: the time of looking up a variable, a result computed before the benchmark ran, or the effect of the computer's setup. Each section below is one such pitfall and the way Chairmarks or BenchmarkTools avoids it.

## Why Interpolate a Global Variable with $ in @benchmark?

A global variable in Julia can be bound to a value of any type, so code that reads one cannot know its type in advance and looks it up while it runs. In `@benchmark f(x)` with a global `x`, that lookup is part of every evaluation. The BenchmarkTools documentation recommends interpolating the variable, `@benchmark f($x)`: the value is spliced into the benchmarked expression, which then times the call alone. In Chairmarks, the argument written before the function, `@be x f`, is the setup: it is computed outside the timing and passed to the function. Chairmarks also accepts `$` interpolation, which evaluates the value once, outside the timed code.

## Why Can a Benchmark Report Almost No Time? Constant Folding

When every input of an expression is known when the code is compiled, the compiler may compute the result then, and the benchmark times only the return of a constant. The BenchmarkTools documentation shows the effect on `@btime $a + $b` with interpolated numbers and a way round it: putting each number in a `Ref` and reading it back, `@btime $(Ref(a))[] + $(Ref(b))[]`, so that the compiler cannot treat it as a constant. A time of about a nanosecond for a call that does real work is a sign of a result computed at compile time. Inputs computed in the setup, as in the panel's `@be x f`, are values the compiler does not know in advance.

## Why Is a Function That Changes Its Argument Benchmarked with evals=1?

A sample can evaluate the call several times, and the setup runs once per sample, not once per evaluation. For a function that changes its argument, such as `sort!`, the evaluations after the first then work on the result of the one before: an array already sorted. The BenchmarkTools documentation sets `evals = 1` for such functions, so that every evaluation gets a fresh setup, and the Chairmarks documentation does the same in its example `@b rand(1000) sort! issorted(_) || error() evals=1`, where the teardown checks the result.

## Why Is the First Sample Slower?

The first time a benchmark calls a function, Julia may still be compiling it, and the data the call reads may not yet be in the processor's caches. BenchmarkTools runs the expression once before it takes samples, and a Chairmarks sample records in its `warmup` field whether a warm-up run came before it. The **First Call** tab of the panel measures the first call on purpose: it is the wait a user of the function meets once, which the other two tabs leave out. Mixing the two, by timing a single call of a function that has never run, reports compile time as run time.

## How Does the Setup of the Computer Bias a Benchmark?

[Mytkowicz, Diwan, Hauswirth and Sweeney (2009)](#ref-MDHS2009a) show that aspects of an experiment's setup that seem innocuous, such as the size of the environment variables of the shell or the order in which object files are linked, change performance enough to overstate an effect or reverse a conclusion, a measurement bias they found on every architecture and compiler they tried. They propose two remedies: randomizing the setup across runs, to avoid the bias, and causal analysis, to detect it. Comparing two versions of a function in the same session, one after the other, keeps much of the setup the same for both, though not all of it.

## How Many Repetitions Does a Comparison of Two Versions Need?

[Kalibera and Jones (2013)](#ref-KJ2013a) model the cost of an experiment and identify how many repetitions are needed at each level, builds, executions or iterations, for a given precision, putting them where most of the variation arises. They report a comparison as an effect size with a confidence interval, not as a single ratio. BenchmarkTools' `judge` classifies a change within its default tolerance of 5% of the time as invariant. The **Timing Stability** action of Time a Function shows how much the minimum of one benchmark varies when it is repeated, which bounds the differences that can be told apart in the same session.

## References

<a id="ref-KJ2013a"></a>Kalibera, T. and Jones, R. (2013). Rigorous benchmarking in reasonable time. In *Proceedings of the 2013 International Symposium on Memory Management*, 63–74. [doi:10.1145/2464157.2464160](https://doi.org/10.1145/2464157.2464160)

<a id="ref-MDHS2009a"></a>Mytkowicz, T., Diwan, A., Hauswirth, M. and Sweeney, P. F. (2009). Producing wrong data without doing anything obviously wrong! In *Proceedings of the 14th International Conference on Architectural Support for Programming Languages and Operating Systems*, 265–276. [doi:10.1145/1508244.1508275](https://doi.org/10.1145/1508244.1508275)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md)
