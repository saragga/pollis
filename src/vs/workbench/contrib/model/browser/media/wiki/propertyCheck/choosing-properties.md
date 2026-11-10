# Check a Property: Choosing Properties to Check

Which properties a statistical function can have, why properties of floating-point results need a tolerance, how to limit the generated inputs, why the panel fixes the seed, what `target!` adds to a random search, and what a passing property cannot say.

## Which Properties Can a Statistical Function Have?

A statistical function rarely has a result that can be written down for any input, but it usually has properties that hold for every input. Some are bounds and signs: a variance is not negative, a probability lies between zero and one, a median lies between the smallest and the largest value. Some are invariances: the variance does not change when the same constant is added to every value, and a sample's median does not change when its values are reordered. Some relate a function to its inverse, as the quantile function of a distribution undoes its distribution function. And a fast or clever version of a computation can be checked against a slow, simple version whose result is trusted, which is the **Simple Version** tab of Check a Property. A property need not say everything about a function: several small properties, each easy to state, together cover much of what the function must do.

## Why Do Properties of Floating-Point Results Need a Tolerance?

Floating-point arithmetic rounds the result of most operations, so two ways of computing the same quantity seldom give the same bits. A property that compares two results with `==` fails on rounding alone, and `isapprox` compares them within a tolerance instead. When no absolute tolerance is given, `isapprox` uses a relative tolerance, the square root of the machine epsilon of the type, which allows a difference proportional to the size of the values. A relative tolerance asks for more and more digits as the values approach zero, and near zero a computation can lose all of them: the **Round Trip** tab therefore compares with an absolute tolerance, `atol`, which allows a fixed difference. The **Inputs Near Zero** action of the panel shows the round trip on numbers ever closer to zero.

## How Should the Generated Inputs Be Limited?

A generator that draws every floating-point number draws infinities, `NaN` and numbers so large that sums overflow, on which most statistical functions are not meant to work. Supposition offers two ways of keeping such inputs out. The generator itself can be limited: `Data.Floats` takes `infs = false`, `nans = false`, `minimum` and `maximum`, and `Data.Vectors` takes `min_size` and `max_size`. Or the property can call `assume!` with a condition, which leaves out a case that fails it as invalid rather than counting it as a counterexample. [MacIver, Hatfield-Dodds and many other contributors (2019)](#ref-MH...2019a) name the generation of only valid test cases as one of the problems of property-based testing. Limiting the generator wastes no cases; `assume!` suits conditions that are hard to build into a generator, such as a variance above zero. A generator can also draw only realistic inputs: **Simple Version** maps integers to values near 1 000 000, in steps of 0.01, as prices or the levels of a series are.

## Why Does Check a Property Fix the Seed and Keep No Record?

A property is tried on inputs drawn at random, so two runs of the same `@check` can try different inputs, and one may find a counterexample that the other misses. The **Seed** of Check a Property fixes the random number generator passed to `@check` as `rng`, so that a run can be repeated and its result compared with another person's. Supposition can also record each counterexample it finds in a database and replay it when the property is checked again, set by the `db` option of `@check`: in the tests of a package, the record keeps a failure found once from being lost when the generated inputs change. Check a Property passes `db=false`, so that it writes nothing to disk and the seed alone decides which inputs are tried.

## What Does target! Add to a Random Search?

Random inputs find an error that many inputs trigger, but they can miss an error that only a narrow region of inputs triggers, such as a loss of digits when values are far from zero and close together. [Löscher and Sagonas (2017)](#ref-LS2017a) introduced targeted property-based testing, in which a search strategy guides the generation of inputs, rather than generation being completely random. [MacIver, Hatfield-Dodds and many other contributors (2019)](#ref-MH...2019a) describe how Hypothesis supports it: the user gives a score, such as an error term to maximise, and the library steers the search toward higher scores without further work from the user. In Supposition, `target!(score)` gives each case its score, such as the relative error of a function against a simple version, and can be set once in each case.

## What Can a Passing Property Not Say?

A property that passes has held on the inputs that `@check` tried, at most **Examples** of them, drawn by its generator. It says nothing about inputs outside the generator's range, such as numbers beyond the bounds of `Data.Floats` or vectors longer than **Longest Vector**, and nothing certain about inputs within the range that were not drawn. A property is also only as strong as the rule it states: a variance that is never negative can still be wrong. A failing property, by contrast, is conclusive, as the counterexample it prints can be run again and examined. The **Cases Tried** action of the panel gives the number of cases behind a pass.

## References

<a id="ref-LS2017a"></a>Löscher, A. and Sagonas, K. (2017). Targeted property-based testing. In *Proceedings of the 26th ACM SIGSOFT International Symposium on Software Testing and Analysis*, 46–56. [doi:10.1145/3092703.3092711](https://doi.org/10.1145/3092703.3092711)

<a id="ref-MH...2019a"></a>MacIver, D. R., Hatfield-Dodds, Z. and many other contributors (2019). Hypothesis: a new approach to property-based testing. *Journal of Open Source Software* 4(43), 1891. [doi:10.21105/joss.01891](https://doi.org/10.21105/joss.01891)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md)
