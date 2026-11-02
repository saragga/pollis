# Assumptions

Entropy values have a clear meaning only for stationary series of adequate length. The surrogate tests add assumptions of their own, in the form of the stated null.

## What Stationarity Assumes

All the measures treat the series as coming from one unchanging process. Pattern frequencies from a series with a change of regime mix the regimes together. A trend also pushes the permutation patterns towards monotonic ones and widens r through the sd. Remove known trends first. **Stationarity (PE)** and **Entropy vs Time** can reveal change. An even split of the series only tests for one kind of change, so a matching pair of halves does not prove stationarity. Rolling windows show more detail, at the price of noisier values.

## What Adequate Length Assumes

Estimates need many instances of each pattern. For permutation entropy, the rule is about 5 m! points. Sample entropy needs enough template matches, a number that falls rapidly with m and r. Below these sizes, estimates are biased and they vary widely. [Kantz and Schreiber (2004)](#ref-KS2004a) warn against reading much from too little data in this kind of work. The sampling rate also matters: many points in one slow cycle do not count as many independent patterns, however long the series looks.

## What Sampling Assumes

The measures depend on how the signal was sampled. Very fine sampling yields long monotonic runs, and low entropy, for any smooth signal. Coarse sampling can make a smooth system look random. Comparing two series means comparing them at the same rate. Rounding introduces ties, which can bias the permutation measure. Filtering before analysis changes the structure of the patterns, and can introduce regularity. Report the sampling rate and any filtering, as they belong to the result as much as the value does.

## What the Tests of Linearity Assume

Each surrogate method defines a family of processes. `RandomFourier` assumes a stationary, linear Gaussian process, with a periodic extension over the record. `IAAFT` extends this to a static transform of such a process. Rejection applies only to the stated family. A surrogate series also keeps sample properties in a way a fresh draw would not, which is the sense in which the null is constrained. Each of the panel's tests is one-sided, and that fixes a view about direction, so a change in direction needs a change in the formula.

## What the Summary Numbers Assume

One number is taken to describe irregularity. Two very different processes can share a value, and comparison across settings can reverse order. A high value does not mean a rich structure: noise has the maximum of entropy, and many authors therefore separate randomness from complexity. An entropy reading alone cannot tell apart a deterministic and a stochastic source. Thresholds such as those in **Complexity Regime** are working rules, without theoretical backing, so treat the labels with caution.

## References

<a id="ref-KS2004a"></a>Kantz, H. and Schreiber, T. (2004). *Nonlinear Time Series Analysis* (2nd ed.). Cambridge University Press.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
