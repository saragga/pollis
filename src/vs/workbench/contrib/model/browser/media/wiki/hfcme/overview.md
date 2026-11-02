# High-Frequency Covariance Matrix Estimation

Tick data record every trade, so a single day can hold far more information about how assets move together than years of daily closes. Recovering a covariance matrix from those ticks takes care, because the raw prices are noisy and the assets trade at different moments.

## Why ticks promise a sharper covariance

Daily returns give one observation per day, so a covariance matrix for many assets needs a long history, and the matrix then describes an average over that history. Summing products of returns over very short intervals estimates the covariation of the price paths within one window. Under idealised conditions the estimate converges to the true integrated covariance as the intervals shrink, with no need for a parametric model of how volatility changes over time ([Barndorff-Nielsen and Shephard (2004)](#ref-BS2004c)). The covariance of this week or this morning can therefore be measured almost directly, instead of being inferred from a model fitted to years of data.

## Two obstacles in real tick data

Microstructure noise is the first. An observed log-price is the efficient price plus a small error from bid-ask bounce and discrete tick sizes. Each observed return then holds two errors, and with noise of variance ω² a realised variance over n returns gains a bias of about 2nω². Sampling faster makes the estimate worse, which is the opposite of what the idealised theory promises.

Asynchronous trading is the second. Two assets rarely trade at the same instant, so at a very short interval many return pairs do not overlap and measured correlation drifts towards zero. Stock correlations fall as the interval shortens, a pattern reported by [Epps (1979)](#ref-Epp1979a) and now called the Epps effect.

## Four estimators, four remedies

Each tab handles the two obstacles differently.

| Tab | Idea | Treatment of noise | Treatment of asynchrony |
|---|---|---|---|
| **Realized** | Outer products of log-returns on one time grid | None beyond the choice of spacing | Common grid |
| **Pre-averaged** | Local averages of tick returns before multiplying | Averaging over a window | Overlapping intervals |
| **Two-Scales** | Slow-scale estimate minus a scaled fast-scale estimate | Bias cancelled | Previous-tick alignment |
| **Realized Kernel** | Parzen-weighted autocovariance matrices | Kernel weights | Refresh-time sampling |

Only **Realized** and **Realized Kernel** promise a positive semi-definite matrix by construction. The other two can return a matrix that needs repair before use in a portfolio.

## What each run produces

A run prints the asset names, the correlation matrix and the volatilities, and keeps the covariance matrix over one time unit. With tick times in seconds, that unit is one second, so the raw numbers look tiny until they are scaled to a day or a year.

The default **Tick Data**, `simulated`, draws four assets with 10,000 asynchronous ticks, microstructure noise and a known true covariance, which makes accuracy measurable. Any Tables.jl source with one row per tick can replace it, holding the time in seconds, the asset as a Symbol and the log-price.

## Actions that follow an estimate

**Correlation Heatmap** and **Trading Activity** show the matrix and how many ticks each asset contributed. **Matrix Validity** and **Microstructure Noise** test whether the estimate can be used and how much noise the data carry. **Portfolio Volatility** and **Return Scenarios** turn the matrix into equal-weight risk figures. **All Five Estimators** and **Raw Against Regularised** set estimates side by side, and **Strongest Pairs** and **Annualised Volatilities** give the readings most reports need.

## References

<a id="ref-BS2004c"></a>Barndorff-Nielsen, O. E., & Shephard, N. (2004). Econometric Analysis of Realized Covariation: High Frequency Based Covariance, Regression, and Correlation in Financial Economics. *Econometrica* 72(3), 885-925. [doi:10.1111/j.1468-0262.2004.00515.x](https://doi.org/10.1111/j.1468-0262.2004.00515.x)

<a id="ref-Epp1979a"></a>Epps, T. W. (1979). Comovements in Stock Prices in the Very Short Run. *Journal of the American Statistical Association* 74(366a), 291-298. [doi:10.1080/01621459.1979.10482508](https://doi.org/10.1080/01621459.1979.10482508)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
