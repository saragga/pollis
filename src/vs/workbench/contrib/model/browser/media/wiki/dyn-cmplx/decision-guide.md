# Decision Guide

The choices are which measure suits the data, how to set m and r, which null to test, and how much weight the result can bear.

## Which Tab Fits the Question

| Question | Tab |
|---|---|
| Quick summary of a long series, robust to rescaling | **Permutation Entropy** |
| Regularity of a moderate series, where amplitude matters | **Sample Entropy** |
| Is there structure beyond the null? | **Surrogate Testing** |

Both entropies are descriptive, and neither gives a test. Use the third tab whenever a claim goes beyond description, and report the baseline in every case. For a series with many irregular outliers or an unknown sensor scale, ordinal methods are the safer of the two.

## Which Measure Fits the Data

| Data | Better measure |
|---|---|
| Very long, or streamed | Permutation entropy |
| Fewer than a few hundred points | Sample entropy with m of 1 or 2 |
| Unknown or nonlinear sensor scale | Permutation entropy |
| Amplitude patterns matter | Sample entropy |
| Heavy ties or rounding | Sample entropy |

Compute both if there is doubt, and interpret any disagreement. Consider multiscale entropy where the process has several time scales.

## How to Set the Embedding Dimension

For permutation entropy, choose the largest m with 5 m! below N: 3 for 30 points, 4 for 120, 5 for 600 and 6 for 3600. Common practice stays within 3 to 7. For sample entropy, use m of 1 to 3, and go higher only with a long series. The panel has one input for both, so set **Embedding dim (m)** per tab rather than leaving 5. Keep m fixed across all series in a comparison.

## How to Set the Tolerance

Keep **Tolerance (r)** at 0.1 to 0.25 of the sd unless there is a reason not to. A lower r needs a longer series, and a higher r loses detail. Use one r across a comparison: fixing r in absolute units would make the measure track amplitude changes, and fixing it relative to each sd removes them. Decide which of those you want, as the code uses the second. Use **SampEn vs r** to look for a range in which conclusions hold.

## Which Null to Test

Use `RandomShuffle` for the question of any time structure. Use `IAAFT` for nonlinear structure, as it covers non-Gaussian shapes, and treat `RandomFourier` as a first look on series that look Gaussian. Pick the null before looking at the results, and take at least 199 surrogates for a level of 0.05 in a one-sided test with some precision. Use more for smaller p. Trim the series for matching ends, since end effects otherwise pass for structure.

## What to Report from a Complexity Analysis

Report the length, sampling rate, cleaning and detrending. Give m, r as a fraction of the sd, any delay, and the normalisation used. For each test, give the surrogate kind, the number, the statistic, the direction, and the p-value. Also give a baseline on noise or surrogates. Say that thresholds such as those of **Complexity Regime** are conventions. Keep the claims modest: reduced entropy under a stated setting, or rejection of a stated null, rather than complexity in general.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Sample Entropy](sample-entropy.md) · [Surrogate Testing](surrogates.md)
