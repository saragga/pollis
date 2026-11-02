# Loss Risk Measures: Factsheet

A quick reference for **Loss Risk Measures**: the four tabs, the inputs, the formulas and the actions. All measures are written directly in Julia with `Statistics`, `StatsBase` and `Distributions`.

## Inputs and defaults

| Input | Default | Tabs | Meaning |
|---|---|---|---|
| **Returns** | `0.0004 .+ 0.01 .* randn(1000)` | All | Return series; the code treats it as simple returns |
| **Window** | 252 | **Drawdown** | Length of the rolling drawdown window |
| **MAR** | 0.0 | **Downside Risk** | Minimum acceptable return per period |
| **Alpha** | 0.05 | **Value at Risk**, **Expected Shortfall** | Tail probability; 0.05 means the 95% level |

The code also sets `ppy = 252`, the periods per year. For weekly or monthly data, change it to 52 or 12 by hand.

## Formulas on each tab

| Tab | Name | Formula |
|---|---|---|
| **Drawdown** | `dd` | wealth / running peak − 1 |
| **Drawdown** | `calmar` | annualised return / maximum drawdown |
| **Drawdown** | `sterling` | annualised return / (average drawdown + 0.10) |
| **Downside Risk** | `semi_dev` | √mean(min(r − mean(r), 0)²) |
| **Downside Risk** | `down_dev` | √mean(min(r − MAR, 0)²) |
| **Downside Risk** | `sortino` | (mean(r) − MAR) / downside deviation × √ppy |
| **Downside Risk** | `omega` | sum of gains above MAR / sum of losses below MAR |
| **Value at Risk** | `var_hist` | −quantile(r, a) |
| **Value at Risk** | `var_norm` | −(μ + σ z) |
| **Value at Risk** | `var_cf` | −(μ + σ cf(z)) |
| **Expected Shortfall** | `es_hist` | −mean of returns at or below the quantile |
| **Expected Shortfall** | `es_norm` | −(μ − σ φ(z) / a) |

`es_cf` averages the adjusted quantile over 1,000 points in (0, a).

## Normal multiples worth knowing

For zero-mean normal returns, in units of σ:

| Alpha | Level | VaR | ES | ES / VaR |
|---|---|---|---|---|
| 0.10 | 90% | 1.282 | 1.755 | 1.37 |
| 0.05 | 95% | 1.645 | 2.063 | 1.25 |
| 0.01 | 99% | 2.326 | 2.665 | 1.15 |

## Actions by group

| Group | Action | Output |
|---|---|---|
| Visualise | **Wealth Index** | Growth of one unit with its running peak |
| Visualise | **Tail Histogram** | Histogram with the VaR cut-off |
| Diagnose | **Return Distribution** | Histogram, mean, standard deviation, skewness, excess kurtosis |
| Diagnose | **Drawdown Chart** | Full drawdown series |
| Diagnose | **VaR Backtest** | Expected and observed violations, coverage p-value |
| Predict | **Rolling VaR Forecast** | Next-period VaR from 250 periods; ES on its tab |
| Predict | **Multi-Period VaR** | 10-period scaled and historical VaR, lag-1 autocorrelation |
| Compare | **VaR Methods** | Historical against normal at 10%, 5% and 1% |
| Compare | **VaR vs Expected Shortfall** | VaR, ES and their ratio |
| Interpret | **Risk-Adjusted Performance** | Sharpe, Sortino, Calmar, Omega |
| Interpret | **CVaR Decomposition** | Portfolio ES and each asset's contribution |

## Software in the panel's list

The panel lists [Oehne (2024)](#ref-Oeh2024a), a Julia package for performance and risk analysis that holds many of these measures. The panel's own code does not load it, since every formula is written out in full, so it serves as a next step for anyone who wants ready-made functions. Reading the code here shows exactly how each number arises.

## References

<a id="ref-Oeh2024a"></a>Oehne, E. (2024). PerformanceAnalytics.jl: Performance and Risk Analysis of Returns. [GitHub](https://github.com/eohne/PerformanceAnalytics.jl)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
