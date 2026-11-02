# Overview

Extreme value theory describes the tail of a distribution from its largest observations alone. The theory gives two limiting families, but each holds only in a limit, so an analyst has to judge whether a given sample has reached it. The Extreme Value Diagnostics panel provides the usual graphical checks for that judgement.

## Where the Generalised Extreme Value and Generalised Pareto Distributions Come From

Two limit results underlie tail modelling. [Fisher and Tippett (1928)](#ref-FT1928a) and [Gnedenko (1943)](#ref-Gne1943a) showed that suitably normalised maxima can converge to only three forms. [Jenkinson (1955)](#ref-Jen1955a) wrote the three as one family, now called the generalised extreme value (GEV) distribution: G(x) = exp(−(1 + xi (x − mu) / sigma)^(−1/xi)).

The second result concerns excesses over a high threshold. [Balkema and de Haan (1974)](#ref-BH1974a) and [Pickands (1975)](#ref-Pic1975a) showed that the excess y = x − u approaches a generalised Pareto (GP) distribution as u rises: H(y) = 1 − (1 + xi y / sigma)^(−1/xi). The shape xi is common to both families. [Davison and Smith (1990)](#ref-DS1990a) set out the statistical modelling of exceedances. Neither limit says how high a threshold or how long a block must be for a finite sample.

## How the Mean Excess Tab Looks for a Threshold

The **Mean Excess** tab computes e(u), the average of x − u over the losses above u, on a grid of thresholds. The grid has **Grid points** values from the minimum of the data to the **Upper pct** quantile, and a threshold with fewer than **Min obs** exceedances is skipped.

If excesses above some threshold follow a GP distribution with xi under 1, then e(u) is a straight line in u from there on, with slope xi / (1 − xi). The tab therefore looks for the point where the plot becomes linear. The tab fits no model and draws no confidence band.

## How the Hill Plot Tab Estimates the Tail Index

The estimator of [Hill (1975)](#ref-Hil1975a) uses the k largest losses: Hill(k) = (1/k) × sum over i of log(x(i) / x(k+1)), with x(1) the largest. The **Hill Plot** tab first drops values that are not positive, then draws Hill(k) from k = 2 up to 200 or to one less than the number of positive losses. Hill(k) estimates xi = 1/alpha, where alpha is the tail index, and only for a Pareto-type tail with xi above 0. The analyst looks for a stretch where the line is flat.

## How the QQ Plot Tab Tests a Fitted Distribution by Eye

The **QQ Plot** tab fits the chosen **Distribution** with the chosen **Estimation method**, through [Extremes.jl (Jalbert, Farmer, Gobeil and Roy, 2024)](#ref-JFGR2024a). **GEV** fits the **Data series** as it stands, so the series must already be block maxima. **GP** subtracts **Threshold u (GP)** and fits the excesses, with location fixed at 0.

The sorted data are then plotted against the fitted quantiles at probabilities (i − 0.5)/n, beside a 45-degree line. The fit and the comparison use the same observations, so the plot flatters the model somewhat.

## A Common Workflow in the Extreme Value Diagnostics Panel

1. Define the losses as positive numbers, for example `losses = -returns`.
2. Run **Mean Excess** and note where the plot starts to look linear.
3. Run **Hill Plot**, if the tail looks heavy, and note the flat stretch.
4. Use **Threshold Stability** to compare the GP fits at five candidate thresholds.
5. Enter the chosen threshold in **Threshold u (GP)**, then run **QQ Plot** with **GP**.
6. Take the threshold to the Extreme Value Risk Measures panel for return levels and tail risk.

No single step settles the choice. A threshold is a compromise that the plots inform, and a second reasonable threshold shows how much the conclusions depend on it.

## References

<a id="ref-BH1974a"></a>Balkema, A. A. and de Haan, L. (1974). Residual life time at great age. *The Annals of Probability* 2(5), 792–804. [doi:10.1214/aop/1176996548](https://doi.org/10.1214/aop/1176996548)

<a id="ref-DS1990a"></a>Davison, A. C. and Smith, R. L. (1990). Models for exceedances over high thresholds. *Journal of the Royal Statistical Society Series B: Statistical Methodology* 52(3), 393–425. [doi:10.1111/j.2517-6161.1990.tb01796.x](https://doi.org/10.1111/j.2517-6161.1990.tb01796.x)

<a id="ref-FT1928a"></a>Fisher, R. A. and Tippett, L. H. C. (1928). Limiting forms of the frequency distribution of the largest or smallest member of a sample. *Mathematical Proceedings of the Cambridge Philosophical Society* 24(2), 180–190. [doi:10.1017/S0305004100015681](https://doi.org/10.1017/S0305004100015681)

<a id="ref-Gne1943a"></a>Gnedenko, B. (1943). Sur la distribution limite du terme maximum d'une serie aleatoire. *The Annals of Mathematics* 44(3), 423. [doi:10.2307/1968974](https://doi.org/10.2307/1968974)

<a id="ref-Hil1975a"></a>Hill, B. M. (1975). A simple general approach to inference about the tail of a distribution. *The Annals of Statistics* 3(5), 1163–1174. [doi:10.1214/aos/1176343247](https://doi.org/10.1214/aos/1176343247)

<a id="ref-JFGR2024a"></a>Jalbert, J., Farmer, M., Gobeil, G. and Roy, P. (2024). Extremes.jl: extreme value analysis in Julia. *Journal of Statistical Software* 109(6). [doi:10.18637/jss.v109.i06](https://doi.org/10.18637/jss.v109.i06)

<a id="ref-Jen1955a"></a>Jenkinson, A. F. (1955). The frequency distribution of the annual maximum (or minimum) values of meteorological elements. *Quarterly Journal of the Royal Meteorological Society* 81(348), 158–171. [doi:10.1002/qj.49708134804](https://doi.org/10.1002/qj.49708134804)

<a id="ref-Pic1975a"></a>Pickands, J. (1975). Statistical inference using extreme order statistics. *The Annals of Statistics* 3(1), 119–131. [doi:10.1214/aos/1176343003](https://doi.org/10.1214/aos/1176343003)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
