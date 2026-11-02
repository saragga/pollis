# Sample Entropy

Sample entropy asks: given that two stretches of a series match for m steps, how likely are they to go on matching at the next step? Irregular series lose matches quickly, and regular ones keep them.

## How the Measure Is Computed

Form all templates of length m. Two templates match if every pair of values lies within a tolerance r. Let B count the matching pairs at length m and A count those at length m + 1. Then:

- SampEn(m, r, N) = −ln(A / B)

A is at most B, so the value is not negative. A near B means that the next value is largely decided, which gives an entropy near 0. **Tolerance (r)** is multiplied by the sd in the code, so that the result does not depend on units.

## How It Improves on Approximate Entropy

[Pincus (1991)](#ref-Pin1991a) introduced approximate entropy, which counts each template as matching itself, to avoid taking the log of zero. Self-matches bias the value low and make it depend strongly on length. [Richman and Moorman (2000)](#ref-RM2000a) proposed sample entropy, which leaves out self-matches and uses only one ratio over all templates. The result depends less on N, and it holds its relative order more consistently across settings. The cost is that A or B may be zero, and in that case the value is undefined or infinite.

## What White Noise Gives

For independent Gaussian values, the chance of a match at one step is the same at every step, and it does not depend on m. Since the difference of two values has sd √2 σ:

| r / σ | P(match) | SampEn |
|---|---|---|
| 0.1 | 0.0564 | 2.88 |
| 0.2 | 0.1125 | 2.19 |
| 0.5 | 0.2763 | 1.29 |

The value falls by about ln 2 when r doubles at small r. A test on simulated noise should reach these figures, and it gives a quick check on any implementation.

## How to Choose m and r

Common practice uses m of 1 to 3, and r of 0.1 to 0.25 sd. The count of matches falls quickly with m, and a common rule of thumb asks for 10^m to 20^m points, which for m = 5 means 100000 at the very least. The panel shares **Embedding dim (m)** with permutation entropy, whose default of 5 is thus high here, so lower it on this tab for a typical series. The value r should stay above the noise level, or matches will reflect noise. **SampEn vs r** shows how much the choice matters.

## Why Short Series Can Mislead

Few matches make A and B small, so that the ratio is noisy and the estimate may be undefined. For N points, a large m with a small r can leave no matches. The bullet in the panel calls the measure robust to short and noisy data, which holds in comparison with older measures, and within moderate m. Trends inflate the sd, so that r becomes too wide, and matches become too easy. Remove them in advance. The cost grows with N², so very long series can be slow.

## How the Scale Enters

A single value reflects one time scale, that of the sampling. Averaging the series over windows and then computing entropy gives a curve over scales, known as multiscale entropy, from [Costa, Goldberger and Peng (2002)](#ref-CGP2002a). White noise loses entropy quickly with scale, whereas a series with long-range structure holds it. To try it, coarse-grain the series with a mean over windows of k points, and rerun the tab for several k. The panel does not automate that. A coarse series is shorter, so that m has to stay small.

## References

<a id="ref-CGP2002a"></a>Costa, M., Goldberger, A. L. and Peng, C.-K. (2002). Multiscale entropy analysis of complex physiologic time series. *Physical Review Letters* 89(6), 068102. [doi:10.1103/PhysRevLett.89.068102](https://doi.org/10.1103/PhysRevLett.89.068102)

<a id="ref-Pin1991a"></a>Pincus, S. M. (1991). Approximate entropy as a measure of system complexity. *Proceedings of the National Academy of Sciences* 88(6), 2297–2301. [doi:10.1073/pnas.88.6.2297](https://doi.org/10.1073/pnas.88.6.2297)

<a id="ref-RM2000a"></a>Richman, J. S. and Moorman, J. R. (2000). Physiological time-series analysis using approximate entropy and sample entropy. *American Journal of Physiology* 278(6), H2039–H2049. [doi:10.1152/ajpheart.2000.278.6.H2039](https://doi.org/10.1152/ajpheart.2000.278.6.H2039)

## See Also

- [Factsheet](factsheet.md) · [Permutation Entropy](permutation-entropy.md) · [Surrogate Testing](surrogates.md) · [Diagnostics](diagnostics.md)
