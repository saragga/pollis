# Diagnostics

The Extreme Value Risk Measures panel offers **Exceedance Rate Analysis** and **Return Level Uncertainty** under Diagnose, and **Empirical vs Extreme Value Risk** under Interpret. None of the three tests whether the tail fit is correct, and that test belongs to the Extreme Value Diagnostics panel.

## Why the Extreme Value Risk Tabs Stop with an Error Under Extremes.jl 1.0.5

The panel's code uses calls that the source of Extremes.jl 1.0.5 does not provide. As a result the three tabs, **Return Level Uncertainty** and **Empirical vs Extreme Value Risk** cannot complete with that version.

| Call in the panel | Where it appears | What Extremes.jl 1.0.5 has |
|---|---|---|
| `gevfit(x; method = ...)`, `gpfit(y; method = ...)` | All tabs, **Empirical vs Extreme Value Risk** | No `method` keyword; separate `gevfit`, `gevfitpwm`, `gevfitbayes` and the same for `gpfit` |
| `sigma_hat, xi_hat = params(fm_gp)` | **Peaks-Over-Threshold**, **Tail Risk**, **Empirical vs Extreme Value Risk** | `params` gives a vector of tuples; `scale(fm)` and `shape(fm)` give the values |
| `round(rl, digits = 4)` | **Return Levels** | `returnlevel` gives a `ReturnLevel` object, with its figures in `value` |
| `returnlevel(fm, T; confidencelevel = 0.95)` and `.estimate`, `.lower`, `.upper` | **Return Level Uncertainty** | No such keyword or fields; `cint(returnlevel(fm, T), 0.95)` gives the interval |

## How to Read the Exceedance Rate Analysis

**Exceedance Rate Analysis** plots `mean(x .> u)` over 50 thresholds from the minimum of the data to the 95th percentile. The curve is the empirical survival function, falling from near 1 towards 0.05. Its action description speaks of validating the setup, but the plot involves no fit, so it cannot confirm that a GP tail is right.

The plot does show how many exceedances a threshold leaves. Multiply a rate by n to get the count, and treat a threshold that leaves only a few dozen excesses with caution. A step or plateau shows repeated or rounded values. The action uses `mean` but loads only Extremes and Plots, so it depends on Statistics or Distributions being already loaded in the session.

## How to Use the Return Level Uncertainty Step

**Return Level Uncertainty** is meant to print a 95 percent interval at T = 10, 50 and 100. It refits by `gevfit(x)`, which is maximum likelihood whatever the **Estimation method**, and it ignores **Return periods**. Its description says profile likelihood, but Extremes.jl 1.0.5 has no such interval. For a maximum likelihood fit, `cint` gives a Normal interval from the delta method, which is symmetric around the estimate, while the true uncertainty at long periods is usually skewed upward.

A useful interval widens steadily with T. An interval whose upper end is several times the estimate means the data do not fix that level, and the figure needs reporting as a range. Bayesian fits give a posterior interval and probability-weighted fits a bootstrap one through the same `cint`.

## How to Judge the Empirical vs Extreme Value Risk Comparison

**Empirical vs Extreme Value Risk** prints the **Empirical VaR**, `quantile(x, 1 - alpha)`, and the **Empirical ES**, the mean of the losses above it, beside the Extreme Value figures. The step takes the threshold and alpha of the **Tail Risk** tab.

Where alpha is well inside the data, such as several percent of a long sample, the two sets of figures should be close. A wide gap there suggests a poor threshold or fit. A gap at very small alpha is expected, since empirical figures stop at the largest loss in the record while the fit goes on. Neither direction of difference shows which figure is right. Closeness at moderate alpha also does not validate the extrapolation at small alpha.

## What to Check Outside the Extreme Value Risk Measures Panel

| Concern | What the user can do |
|---|---|
| Choice of threshold | **Mean Excess**, **Threshold Stability** in the Extreme Value Diagnostics panel |
| Fit of the distribution | **QQ Plot** in the Extreme Value Diagnostics panel; `diagnosticplots(fm)` in Extremes.jl |
| Fit at long periods | `returnlevelplot(fm)` and `returnlevelplotci(fm)` in Extremes.jl |
| Calibration of VaR | Fit on an early sample, count later losses above VaR, and compare the share with alpha |
| Sensitivity | Repeat each tab at nearby thresholds and with another **Estimation method** |

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
