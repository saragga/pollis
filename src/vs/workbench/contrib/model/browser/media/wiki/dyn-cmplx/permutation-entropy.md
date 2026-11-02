# Permutation Entropy

Permutation entropy looks only at the order of neighbouring values, and asks how evenly the possible orderings occur. The result is fast, simple and unaffected by rescaling.

## How the Measure Is Built

[Bandt and Pompe (2002)](#ref-BP2002a) proposed the method. Slide a window of m values along the series. Replace each window by the ranking of its values, which is one of m! possible patterns. Then count how often each pattern occurs, and take the Shannon entropy of those frequencies:

- H = −Σ p(π) ln p(π)

Dividing by ln(m!) puts it on a scale of 0 to 1, with 0 for a single pattern and 1 for all patterns equally frequent.

## How the Calculation Goes by Hand

Take the series 4, 7, 9, 10, 6, 11, 3, the example used by Bandt and Pompe.

| Order | Windows | Frequencies | H | H / ln(m!) |
|---|---|---|---|---|
| m = 2 | 6 pairs | 4 rises, 2 falls | 0.637 | 0.918 |
| m = 3 | 5 triples | 2, 2, 1 | 1.055 | 0.589 |

For m = 3, the windows 4, 7, 9 and 7, 9, 10 both rise. The windows 9, 10, 6 and 6, 11, 3 share a pattern, and 10, 6, 11 is on its own. Small series like this one are useful for checking a code path.

## Which Properties Make It Useful

Only ranks enter, so any monotonic transformation of the series gives the same answer: a log, a change of units, or a nonlinear sensor. Slow drift has less effect than it does on the mean. Outliers change only a few windows. The computation grows linearly with length, so long series are easy to handle. Noise does affect it, as small noise can reorder close values, most of all at fine sampling or when the series is flat.

## How Long the Series Must Be

All m! patterns need a chance of appearing. A common rule asks for at least 5 m! points, as discussed by [Riedl, Müller and Wessel (2013)](#ref-RMW2013a).

| m | m! | Points by the rule |
|---|---|---|
| 3 | 6 | 30 |
| 4 | 24 | 120 |
| 5 | 120 | 600 |
| 6 | 720 | 3600 |
| 7 | 5040 | 25200 |
| 8 | 40320 | 201600 |

Short series are biased low, by about (m! − 1) / (2N) on the unnormalised scale. For white noise at m = 5, a window of 200 gives about 0.94 and not 1.

## What Delay and Ties Change

The windows in the code use consecutive values. A delay τ uses every τ-th value, which helps when a series is heavily oversampled, as neighbours are then nearly always in rising or falling runs. Ties need a rule, because equal values have no natural rank, and rounded data or long flat stretches may give many of them. Implementations break ties in different ways, and this can shift the value on coarse data. Forbidden patterns, which deterministic systems may never produce, are one more reason why entropy can be low.

## What the Panel Reports as Normalised

The code expects a value from 0 to 1, as its comment and **Complexity Regime** assume. Check that with a known case: the value for a long random series should be close to 1, and a value above 1 shows that the estimator is not dividing by ln(m!). A normalised value can only be compared with others at the same m. In code that returns the raw value, divide by ln(m!) yourself, using the base of logarithm that the package uses.

## References

<a id="ref-BP2002a"></a>Bandt, C. and Pompe, B. (2002). Permutation entropy: a natural complexity measure for time series. *Physical Review Letters* 88(17), 174102. [doi:10.1103/PhysRevLett.88.174102](https://doi.org/10.1103/PhysRevLett.88.174102)

<a id="ref-RMW2013a"></a>Riedl, M., Müller, A. and Wessel, N. (2013). Practical considerations of permutation entropy. *The European Physical Journal Special Topics* 222(2), 249–262. [doi:10.1140/epjst/e2013-01862-7](https://doi.org/10.1140/epjst/e2013-01862-7)

## See Also

- [Factsheet](factsheet.md) · [Sample Entropy](sample-entropy.md) · [Surrogate Testing](surrogates.md) · [Diagnostics](diagnostics.md)
