# Interpretation

An entropy value describes the irregularity of one series under fixed settings. It becomes meaningful in comparison, whether with a baseline, with other series, or with surrogates.

## How to Read Permutation Entropy

A normalised value near 0 means that few ordinal patterns dominate, as in a trend or a smooth oscillation. A value near 1 means that all patterns are about equally frequent, as in noise. A strongly chaotic series can reach high values too. Differences matter only at the same m and the same sampling. Since ranks are all that count, the value says nothing about amplitude, so two series with very different sizes of movement can get the same value. It reports on order alone.

## How to Read Sample Entropy

SampEn is the negative log of the chance that a match at length m continues to length m + 1. A value of 0.5 means that about 61% of matches continue, since e^−0.5 = 0.61. A value of 2.19 means about 11%, which matches white noise at r = 0.2. The value depends on r, so a figure without r cannot be read. [Richman and Moorman (2000)](#ref-RM2000a) developed the measure on physiological signals, and a value has to be read against a baseline from the same kind of signal.

## How to Read the Complexity Regime

**Complexity Regime** labels values below 0.3 as low, below 0.7 as moderate, and otherwise high. The cuts are conventions of the panel, and they are not derived from theory. The label also hides a change with m: the same series can move between classes as m changes. Its printed wording about chaotic behaviour goes beyond what one number can show. Use the label for a rough first reading, and base any conclusion on the value itself, a baseline series, and a surrogate test.

## How to Read PE vs SampEn

The two measures answer different questions, so they can disagree without either being wrong. A series with stable order but noisy amplitude can have low permutation entropy and high sample entropy. **PE vs SampEn** prints an agreement flag, comparing permutation entropy with sample entropy divided by ln(m!). This is a rough rule of the panel, with no theoretical standing, since sample entropy has no such natural scale. The more informative comparison is between each measure and its value on a baseline of noise or surrogates.

## How to Read the p-Values

A small p in **Surrogate Testing**, **Multiple Surrogates** or **Nonlinearity Test** means that the data are more ordered than the chosen null allows. Read it against that null: rejection of `RandomShuffle` shows that time order exists, and rejection of `IAAFT` is the strongest sign of nonlinear structure in the panel. A p-value does not measure the size of an effect, so also look at the gap in **Surrogate Distribution**. With three nulls, also bear multiple testing in mind.

## What the Results Do Not Say

Low entropy does not establish determinism, and high entropy does not establish randomness. Rejection of a linear null does not establish chaos, and failure to reject does not establish linearity. A single entropy value does not measure system health, skill or risk without a study that links it to them. The values also cannot be compared across different lengths, sampling rates or settings. State the settings along with each value, and link any claim to the appropriate baseline and test.

## References

<a id="ref-RM2000a"></a>Richman, J. S. and Moorman, J. R. (2000). Physiological time-series analysis using approximate entropy and sample entropy. *American Journal of Physiology* 278(6), H2039–H2049. [doi:10.1152/ajpheart.2000.278.6.H2039](https://doi.org/10.1152/ajpheart.2000.278.6.H2039)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Permutation Entropy](permutation-entropy.md) · [Surrogate Testing](surrogates.md)
