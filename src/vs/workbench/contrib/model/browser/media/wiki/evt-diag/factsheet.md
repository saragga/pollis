# Factsheet

The Extreme Value Diagnostics panel examines the upper tail of a loss series before a tail model is relied on. Its three tabs show how excesses change with the threshold, how a tail estimate changes with the number of largest losses, and how a fitted distribution lines up with the data.

## What the Extreme Value Diagnostics Panel Does

| Item | Description |
|---|---|
| **Purpose** | Choosing a threshold and judging whether a generalised extreme value (GEV) or generalised Pareto (GP) fit is believable |
| **Julia stack** | Extremes.jl and Distributions.jl for the fits; Statistics and Plots.jl for the plots |
| **Models** | **Mean Excess**, **Hill Plot** and **QQ Plot** tabs |
| **Input shape** | **Data series** is a vector of losses as positive numbers, larger meaning worse; for **GEV** it must hold block maxima |
| **Key choice** | Which threshold, or how many of the largest losses, belong to the tail |

## What Each Extreme Value Diagnostics Tab Draws and Prints

| Tab | Statistic | Plot | Printed values |
|---|---|---|---|
| **Mean Excess** | Mean of x − u over the losses above u | Points against threshold u | Mean excess at the 50th, 75th and 90th percentiles |
| **Hill Plot** | Mean of log(x(i) / x(k+1)) over the k largest positive losses | Line against k, up to k = 200 | xi and alpha = 1/xi at k = 10, 50 and 100, when k is under the sample size |
| **QQ Plot** | Sorted data against quantiles of the fitted distribution at (i − 0.5)/n | Points with a 45-degree line | **Shape xi**, scale sigma, QQ correlation, and QQ RMSE over the standard deviation |

## Which Inputs the Extreme Value Diagnostics Tabs Use

| Input | Tab | Default | Meaning |
|---|---|---|---|
| **Data series** | All | `losses` | The vector of losses |
| **Grid points** | **Mean Excess** | 100 | Number of thresholds |
| **Upper pct** | **Mean Excess** | 0.95 | Highest threshold, as a quantile |
| **Min obs** | **Mean Excess** | 10 | Thresholds with fewer exceedances are skipped |
| **Distribution** | **QQ Plot** | **GEV** | **GEV** fits the series; **GP** fits the excesses |
| **Estimation method** | **QQ Plot** | **Maximum Likelihood** | How the distribution is fitted |
| **Threshold u (GP)** | **QQ Plot** | `quantile(losses, 0.9)` | Used only with **GP** |

## Which Extremes.jl Function Each Estimation Method in the QQ Plot Calls

| **Estimation method** | **GEV** | **GP** | Values drawn and printed |
|---|---|---|---|
| **Maximum Likelihood** | `gevfit` | `gpfit` | The single fitted value |
| **Probability-Weighted Moments** | `gevfitpwm` | `gpfitpwm` | The single fitted value |
| **Bayesian Estimation** | `gevfitbayes` | `gpfitbayes` | The posterior mean of each parameter, from No-U-Turn sampling |

The method applies to the **QQ Plot** tab alone. **Threshold Stability** always calls `gpfit`. A gap between the methods on one data set shows how much the fitted tail depends on the way it was estimated.

## See Also

- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
