# Check a Property: Overview

What a property is, how Supposition.jl tries one on the inputs it generates and shrinks the input that breaks it, and what the three tabs of Check a Property check.

## What Is Property-Based Testing?

A test written by hand checks a function on a few inputs chosen by its author, each with the result expected. A property-based test states instead a property, a rule the function must satisfy for every input in a range, and a library generates the inputs and tries the rule on each. [Claessen and Hughes (2000)](#ref-CH2000a) introduced the approach with QuickCheck, a tool for Haskell in which properties are written as functions and tested automatically on random input. [MacIver, Hatfield-Dodds and many other contributors (2019)](#ref-MH...2019a) describe the same style in Hypothesis, the property-based testing library of Python: tests specify properties that hold for a wide range of inputs, and the library tries to generate test cases that refute them. Supposition.jl, inspired by Hypothesis, brings the approach to Julia, and its `@check` macro reports a property's result inside a Julia `@testset`.

## How Does Supposition Generate and Shrink Inputs?

Supposition draws each input from a generator, such as `Data.Floats{Float64}()` for numbers or `Data.Vectors` for vectors of them, and records the random choices that made it. When an input breaks the property, Supposition shrinks it: it searches for a smaller input, made from simpler choices, that still breaks the property, and reports the smallest one it finds. [MacIver, Hatfield-Dodds and many other contributors (2019)](#ref-MH...2019a) describe the single representation of test cases on which Hypothesis builds its test-case reduction, which works with no intervention from the user, and Supposition's documentation describes its own generation and shrinking as based on the sequence of choices. A shrunk counterexample is usually easier to read than the input that first failed: a short vector of simple numbers in place of a long vector of arbitrary ones.

## What Do the Three Tabs of Check a Property Check?

| Tab | Kind of property | The example in the tab |
|---|---|---|
| **Invariant** | A rule true of every result | The variance is not negative and the median lies between the smallest and the largest value |
| **Round Trip** | A function followed by its inverse gives back the input | `quantile(Normal(), cdf(Normal(), x))` gives back `x` |
| **Simple Version** | A fast function agrees with a simple one taken as right | A variance computed in one pass agrees with `var` of Statistics, on values near 1 000 000 |

Each tab draws its inputs with a generator called `gen` and keeps the result of `@check` in `sr`, which the Next Steps use. The one-pass variance of **Simple Version** subtracts two large sums to get a small difference, which loses digits when the values are far from zero and close together, as the levels of a price or of a series are: the tab draws such values, and **Welford's Algorithm**, in the Next Steps, checks a one-pass variance that avoids the subtraction.

## How Does a Property Differ from a Published Benchmark?

Published Benchmarks, the other entry of Compose > Correctness Tests, checks Julia's results on a few fixed problems against values certified by their publisher, such as the datasets of the National Institute of Standards and Technology (NIST). A benchmark knows the right answer for its inputs and nothing about other inputs. A property knows no answer for any single input, only a rule that relates the inputs and the results, and so it can be tried on thousands of inputs that nobody has solved. The two kinds of check find different errors: a benchmark finds a result that is wrong on a hard problem, and a property finds the input, often an edge such as zero, a vector of equal values or numbers far from zero, on which a function stops behaving as it should.

## How Does Check a Property Report a Failure?

When an input breaks the property, `@check` prints `Found counterexample`, the name of the property and the shrunk input, each argument with its name and type. Values recorded with `event!` while the case ran are printed below the input, under their labels. The **Seed** of the panel fixes the random number generator passed to `@check` as `rng`, so the same seed draws the same inputs again. Supposition can also record the counterexamples it finds in a database, set by the `db` option of `@check`, and replay them when the property is checked again; the panel passes `db=false`, so that the seed alone decides the inputs.

## References

<a id="ref-CH2000a"></a>Claessen, K. and Hughes, J. (2000). QuickCheck: a lightweight tool for random testing of Haskell programs. In *Proceedings of the Fifth ACM SIGPLAN International Conference on Functional Programming*, 268–279. [doi:10.1145/351240.351266](https://doi.org/10.1145/351240.351266)

<a id="ref-MH...2019a"></a>MacIver, D. R., Hatfield-Dodds, Z. and many other contributors (2019). Hypothesis: a new approach to property-based testing. *Journal of Open Source Software* 4(43), 1891. [doi:10.21105/joss.01891](https://doi.org/10.21105/joss.01891)

## See Also

- [Factsheet](factsheet.md) · [Choosing Properties to Check](choosing-properties.md)
