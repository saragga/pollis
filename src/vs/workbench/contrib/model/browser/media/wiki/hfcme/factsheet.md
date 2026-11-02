# High-Frequency Covariance Matrix Estimation: Factsheet

A quick reference for **High-Frequency Covariance Matrix Estimation**: the four tabs, the inputs with their defaults and the actions. The panel runs on the Julia package `HighFrequencyCovariance`.

## Tabs and their methods

| Tab | Method symbol | Optional setting | Positive semi-definite by construction |
|---|---|---|---|
| **Realized** | `:simple_covariance` | None | Yes |
| **Pre-averaged** | `:preaveraged_covariance` | `theta` | No |
| **Two-Scales** | `:two_scales_covariance` | `num_grids` | No |
| **Realized Kernel** | `:bnhls_covariance` | `H` | Yes |

All four go through the same call, `estimate_covariance(ts, assets, method)`, and differ only in the method symbol and its setting.

## Inputs and defaults

| Input | Default | Tab | Effect |
|---|---|---|---|
| **Tick Data** | `simulated` | All | Four assets, 10,000 asynchronous ticks, known true covariance |
| **Pre-averaging Window (theta)** | 0.15 | **Pre-averaged** | Window k = theta × √(number of ticks) |
| **Sub-grids (K)** | Blank | **Two-Scales** | Blank means fewest ticks of any asset / 100, at least 3 |
| **Kernel Bandwidth (H)** | Blank | **Realized Kernel** | Blank means c* × (mean ticks per asset)^0.6 |

By hand, theta = 0.15 with 10,000 ticks gives k = 0.15 × 100 = 15. An asset with 1,500 ticks at the low end gives K = 15, and one with 200 ticks gives K = 3 through the floor.

## Objects in the workspace

| Name | Meaning | Scale |
|---|---|---|
| `ts` | Sorted tick data | Log-prices |
| `assets` | Asset names | Symbols |
| `est` | Fitted estimate | Holds correlation and volatility |
| `Sigma` | Covariance matrix from `covariance(est)` | One time unit |
| `rho` | Correlation matrix | Unit-free |
| `sigma` | Volatilities | Per square root of one time unit |

On the simulated default, `true_covar` and `true_noise` also hold the values used to draw the data.

## Actions by group

| Group | Action | Output |
|---|---|---|
| Visualise | **Correlation Heatmap** | Picture of `rho` |
| Visualise | **Trading Activity** | `ticks_per_asset` |
| Diagnose | **Matrix Validity** | `is_psd_matrix`, `valid_correlation_matrix`, three smallest eigenvalues |
| Diagnose | **Microstructure Noise** | `noise_variance`, `vol_squared`, `noise_to_signal` |
| Predict | **Portfolio Volatility** | `daily_volatility`, `risk_share` at equal weights |
| Predict | **Return Scenarios** | `q01`, `q05`, `worst` from 10,000 normal draws |
| Compare | **All Five Estimators** | Mean absolute distance |
| Compare | **Raw Against Regularised** | Squared Frobenius distance to `rho` |
| Interpret | **Strongest Pairs** | Pairs ranked by absolute correlation |
| Interpret | **Annualised Volatilities** | Percent, with √252 ≈ 15.87 |

## Main sources

[Barndorff-Nielsen, Hansen, Lunde and Shephard (2011)](#ref-BHLS2011a) give the multivariate realised kernel of **Realized Kernel**, together with refresh-time sampling. [Zhang (2011)](#ref-Zha2011a) carries the two-scales idea into the multivariate setting used by **Two-Scales**. Both are the panel's own listed references, and both address noise and asynchrony together. The univariate origins of the bias correction are cited in [Diagnostics](diagnostics.md) and [Decision Guide](decision-guide.md).

## References

<a id="ref-BHLS2011a"></a>Barndorff-Nielsen, O. E., Hansen, P. R., Lunde, A., & Shephard, N. (2011). Multivariate Realised Kernels: Consistent Positive Semi-Definite Estimators of the Covariation of Equity Prices with Noise and Non-Synchronous Trading. *Journal of Econometrics* 162(2), 149-169. [doi:10.1016/j.jeconom.2010.07.009](https://doi.org/10.1016/j.jeconom.2010.07.009)

<a id="ref-Zha2011a"></a>Zhang, L. (2011). Estimating Covariation: Epps Effect, Microstructure Noise. *Journal of Econometrics* 160(1), 33-47. [doi:10.1016/j.jeconom.2010.03.012](https://doi.org/10.1016/j.jeconom.2010.03.012)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
