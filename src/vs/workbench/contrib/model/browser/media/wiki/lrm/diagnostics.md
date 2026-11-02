# Loss Risk Measure Diagnostics

A risk number can be stated to four digits and still be badly wrong. The checks here look at the shape of the returns, the depth of drawdowns, the accuracy of the forecast and the strength of the evidence.

## Inspect the return distribution first

**Return Distribution** gives a histogram plus mean, standard deviation, skewness and excess kurtosis. For normal data, skewness and excess kurtosis are near 0, and with 1,000 observations their sampling errors are about √(6 / 1,000) ≈ 0.08 and √(24 / 1,000) ≈ 0.15.

Clearly negative skewness signals a heavier left tail, and clearly positive excess kurtosis signals fat tails on one or both sides. Either one means `var_norm` and `es_norm` will understate extreme losses. Look at the extreme bars in the histogram as well. A single crash can account for most of the sample kurtosis, so note whether the estimate depends on one date.

## Backtesting VaR

**VaR Backtest** forecasts each period from the previous 250, counts how often returns breach the forecast and compares the count with what alpha implies. With 1,000 returns, it makes 750 forecasts, so alpha 0.05 expects 37.5 breaches with a standard deviation of √(750 × 0.05 × 0.95) ≈ 6.0.

The p-value comes from an exact binomial test of coverage, the small-sample version of the test of [Kupiec (1995)](#ref-Kup1995a). A low value means the VaR breaches too often or too rarely, and both count as failures. A VaR that breaches too rarely wastes capital. A forecast must be made from data before the tested period, and an in-sample VaR would breach at the rate alpha by construction, which is why the action rolls forward.

## Do breaches cluster?

Correct coverage is only half the job. A VaR breached 5% of the time, with all the breaches in one bad month, has passed the binomial test and still failed to warn when it mattered. Conditional coverage asks whether breaches are independent over time ([Christoffersen (1998)](#ref-Chr1998a)).

The panel reports the unconditional test only, though `hits` holds what you need for more: look at whether a breach today makes one tomorrow more likely. Clusters usually mean the forecast reacts too slowly to volatility, a common failing of a historical window, and a conditional volatility model is the usual remedy.

## Testing ES is harder

**VaR Backtest** tests VaR and not ES. A quantile has a natural scoring function, which allows forecasts to be compared directly. The mean beyond a quantile has no such function on its own, and that property, elicitability, is what makes direct comparison of ES forecasts difficult ([Gneiting (2011)](#ref-Gne2011a)).

Practical checks remain. Compare the average loss on breach days with the forecast ES across a long sample, and run a backtest on the VaR underlying your ES. A very small number of breaches makes any such comparison weak, so a formal test needs more data than a VaR backtest does.

## Reading the drawdown chart

**Drawdown Chart** plots the full series, and it shows more than the single maximum. Look for how long the series stays below 0, since the length of a drawdown matters as much as its depth for anyone living through it.

Maximum drawdown is one observation, the worst event on one path, so it is not an estimate with a usable sampling error. It also tends to grow with sample length: a longer history has had more chances for a deep fall. Comparing strategies across different lengths is unfair for that reason. **Window** on the **Drawdown** tab gives a fairer rolling measure, and it must not exceed the series length.

## Sensitivity to method and level

**VaR Methods** sets historical and normal estimates side by side at 10%, 5% and 1%. Close agreement at 10% with a widening gap at 1% is the usual sign of fat tails, since the historical figure pulls away from the normal one further out.

Treat large gaps as a warning, then ask which side deserves belief. At 1%, the historical figure rests on few observations, while the normal one rests on an assumption that is likely to be wrong. **VaR vs Expected Shortfall** adds another signal: a ratio well above the normal value of about 1.25 at 5% says that the tail beyond VaR is unusually long.

## References

<a id="ref-Chr1998a"></a>Christoffersen, P. F. (1998). Evaluating Interval Forecasts. *International Economic Review* 39(4), 841-862. [doi:10.2307/2527341](https://doi.org/10.2307/2527341)

<a id="ref-Gne2011a"></a>Gneiting, T. (2011). Making and Evaluating Point Forecasts. *Journal of the American Statistical Association* 106(494), 746-762. [doi:10.1198/jasa.2011.r10138](https://doi.org/10.1198/jasa.2011.r10138)

<a id="ref-Kup1995a"></a>Kupiec, P. H. (1995). Techniques for Verifying the Accuracy of Risk Measurement Models. *The Journal of Derivatives* 3(2), 73-84. [doi:10.3905/jod.1995.407942](https://doi.org/10.3905/jod.1995.407942)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
