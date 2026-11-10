# Check a Property: Factsheet

The tabs, inputs, generators, functions and actions of Check a Property at a glance.

## Tabs of Check a Property

| Tab | Property | Generator `gen` |
|---|---|---|
| **Invariant** | `var(x) >= 0` and `minimum(x) <= median(x) <= maximum(x)` | Vectors of 2 to **Longest Vector** numbers between -1 000 000 and 1 000 000 |
| **Round Trip** | `quantile(Normal(), cdf(Normal(), x))` within **Absolute Tolerance** of `x` | Numbers between -5 and 5 |
| **Simple Version** | `one_pass_var(x)` within **Relative Tolerance** of `var(x)` | Vectors of 2 to **Longest Vector** values from 999 000 to 1 001 000, in steps of 0.01 |

No generator of the panel draws `NaN` or an infinite number: the generators of **Invariant** and **Round Trip** set `infs = false` and `nans = false`, and that of **Simple Version** maps integers to values. Every `@check` of the panel passes `db=false`, so that it keeps no record of earlier counterexamples.

## Inputs of Check a Property

| Input | Default | Tabs | Meaning |
|---|---|---|---|
| **Examples** | 10000 | All | The most inputs `@check` tries, its `max_examples` |
| **Seed** | 1 | All | The seed of `rng = Xoshiro(seed)`, which draws the inputs |
| **Longest Vector** | 50 | Invariant, Simple Version | The `max_size` of the vectors; `min_size` is 2 |
| **Absolute Tolerance** | 1e-8 | Round Trip | The `atol` of `isapprox` |
| **Relative Tolerance** | 1e-8 | Simple Version | The `rtol` of `isapprox` |

## Generators Used by Check a Property

| Generator | What it draws |
|---|---|
| `Data.Floats{Float64}(; infs, nans, minimum, maximum)` | Floating-point numbers, with or without infinities and `NaN`, within the bounds |
| `Data.Vectors(elements; min_size, max_size)` | Vectors of the elements' generator, with a length between the two sizes |
| `Data.Integers(min, max)` | Integers from `min` to `max` |
| `Data.SampledFrom(collection)` | One element of a collection, each equally likely |
| `map(f, gen)` and `filter(f, gen)` | The values of `gen` transformed by `f`, or only those for which `f` is true |

## Functions and Macros of Supposition

| Name | What it does | In the panel |
|---|---|---|
| `@check` | Tries a property, written as a function whose arguments default to generators, and reports the result in a `@testset` | Every tab |
| `event!(label, value)` | Records a value, printed with the counterexample when the property fails | **Both Values on a Failure** |
| `example(gen)` | Draws one input from a generator, outside `@check` | **Inputs Drawn by the Generator** |
| `Supposition.num_testcases(sr)` | The number of cases the `@check` whose result is `sr` ran | **Cases Tried** |
| `assume!(condition)` | Leaves out the current case, as invalid, when the condition is false | Not used |
| `target!(score)` | Gives the current case a score that steers the search toward higher scores; set once per case | Not used |

## Options of `@check`

| Option | Meaning |
|---|---|
| `rng` | The random number generator that draws the inputs |
| `max_examples` | The most inputs drawn; 10 000 by default |
| `db` | Where counterexamples are recorded and replayed: `true` for the default database, `false` for none, as in the panel |
| `broken` | Marks a property known to fail, so that its failure is not counted |
| `record` | Whether the result is recorded in the enclosing test sets |

## Actions of Check a Property

| Group | Action | Tabs | Output |
|---|---|---|---|
| Visualise | **Inputs Drawn by the Generator** | All | A histogram of the values of 1 000 inputs |
| Visualise | **Lengths of the Vectors** | Invariant, Simple Version | A histogram of the lengths of 1 000 vectors |
| Diagnose | **A Vector of One Value** | Invariant | The variance and the median of a single value |
| Diagnose | **Inputs Near Zero** | Round Trip | The round trip on numbers from 1e-2 to 1e-20, with the relative error |
| Diagnose | **Both Values on a Failure** | Simple Version | The property with `event!` on the two variances |
| Compare | **Welford's Algorithm** | Simple Version | The property for Welford's variance, and three variances of three close values |
| Interpret | **Cases Tried** | All | The cases run by the tab's `@check`, against the **Examples** |

The actions use `gen`, `sr` and, in **Simple Version**, `one_pass_var`, which the tab's code defines: run the tab's code first.

## Further Reading on Checking a Property

The documentation of Supposition.jl describes its generators, `@check` and its options, targeted search, events and stateful testing, with an example for each. The documentation of Hypothesis, the Python library that inspired Supposition, describes the same ideas at greater length, with many examples of properties. The documentation of Julia describes `isapprox` and its `rtol` and `atol` keywords. Published Benchmarks, in Compose > Correctness Tests, checks results against certified values.

## See Also

- [Overview](overview.md) · [Choosing Properties to Check](choosing-properties.md)
