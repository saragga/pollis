# Factsheet

**Complexity & Entropy** summarises a time series with permutation entropy and sample entropy, and tests structure against surrogates, using `ComplexityMeasures` and `TimeseriesSurrogates`.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Measure the irregularity of a series and test for nonlinear structure |
| Julia stack | `ComplexityMeasures`, `TimeseriesSurrogates`, with `GLMakie.jl` for figures |
| Tabs | **Permutation Entropy**, **Sample Entropy**, **Surrogate Testing** |
| Printed result | An entropy value, or a p-value |

All Next Steps read the same series, and none of them simulates or loads data of its own.

## What the Inputs of the Panel Default To

| Input | Default | Used by |
|---|---|---|
| **Time series (x)** | `x` | All actions |
| **Embedding dim (m)** | 5 | Permutation order, and template length |
| **Tolerance (r)** | 0.2 | Sample entropy, as a fraction of the sd |

The variable named in **Time series (x)** must exist before running, since the code does not create it. The default m of 5 is a sensible order for permutation entropy, but a high one for sample entropy.

## What the Generated Code Fixes

| Item | Value |
|---|---|
| **Surrogate Testing** | 99 phase-randomised surrogates |
| **Surrogate Distribution** | 199 surrogates |
| **Nonlinearity Test** | 999 surrogates, level 0.05 |
| **Multiple Surrogates** | `RandomFourier`, `IAAFT`, `RandomShuffle`, 199 each |
| **Entropy vs Time** | Window 200, step 10 |
| **SampEn vs r** | 20 values of r from 0.05 to 0.5 sd |
| **Order Sensitivity** | Orders 3 to 8 |
| **Entropy Rate** | Template lengths 2 to 6 |
| **Complexity Regime** | Cut-offs at 0.3 and 0.7 |
| Test direction | One-sided, low permutation entropy |

## What Each Next Step in the Panel Shows

| Action | Result |
|---|---|
| **Entropy vs Time** | Rolling permutation entropy |
| **Surrogate Distribution** | Null histogram with the observed value |
| **SampEn vs r** | Sample entropy across tolerances |
| **Stationarity (PE)** | Permutation entropy of each half |
| **Order Sensitivity** | Permutation entropy per order |
| **Complexity Regime** | Low, moderate or high label |
| **Entropy Rate** | Sample entropy per template length |
| **PE vs SampEn** | Both values, and a rough agreement flag |
| **Multiple Surrogates** | p-value per null |
| **Complexity Summary** | Length and both entropies |
| **Nonlinearity Test** | p-value and verdict |

## See Also

- [Overview](overview.md) · [Permutation Entropy](permutation-entropy.md) · [Sample Entropy](sample-entropy.md) · [Surrogate Testing](surrogates.md)
