# Overview

A historical record says little about losses larger than any it contains. Extreme value models extrapolate past the record with a parametric tail whose form comes from limit theory, as in the reference by [Embrechts, Klüppelberg and Mikosch (1997)](#ref-EKM1997a). The Extreme Value Risk Measures panel computes the common summaries of such a tail through [Extremes.jl (Jalbert, Farmer, Gobeil and Roy, 2024)](#ref-JFGR2024a). The extrapolation is an assumption, and no data can confirm it far beyond the record.

## How the Return Levels Tab Estimates a T-Period Loss

The **Return Levels** tab fits a generalised extreme value (GEV) distribution to the **Data series**, which must hold block maxima such as the largest loss of each year. The return level for period T is the quantile with probability 1 − 1/T of that fit. For xi not equal to 0:

z(T) = mu − (sigma / xi) × (1 − (−log(1 − 1/T))^(−xi))

T is counted in blocks. With annual maxima, T = 100 gives the 1-in-100-year loss. The block choice decides the meaning of each figure, so the same T applied to monthly maxima means 100 months. The tab reads no block length, and has only the maxima themselves to go on.

## How the Peaks-Over-Threshold Tab Models Losses Above a Threshold

The peaks-over-threshold approach uses every loss above a high level, following [Pickands (1975)](#ref-Pic1975a) and the modelling framework of [Davison and Smith (1990)](#ref-DS1990a). The **Peaks-Over-Threshold** tab takes the excesses x − u over **Threshold u** and fits a generalised Pareto (GP) distribution, with **sigma_hat** the scale and **xi_hat** the shape.

The tab also prints the **Exceedance rate**, the share of losses above u, and the 0.99 quantile of a GP located at u. That quantile, printed as **99th pct above u**, is conditional: 1 percent of the losses that exceed u lie above it. Unconditionally the level is exceeded with probability 0.01 times the exceedance rate.

## How the Tail Risk Tab Computes Value at Risk and Expected Shortfall

The **Tail Risk** tab uses the same GP fit and the tail probability **alpha (level)**. With n observations and Nu excesses, the code computes:

VaR = u + (sigma / xi) × ((alpha × n / Nu)^(−xi) − 1)

ES = (VaR + sigma − xi × u) / (1 − xi)

[McNeil and Frey (2000)](#ref-MF2000a) use these tail formulas on the residuals of a volatility model, to obtain conditional risk measures. The tab applies them to the raw series, so its figures are unconditional. ES is the average loss beyond VaR, and belongs to the coherent risk measures that [Artzner, Delbaen, Eber and Heath (1999)](#ref-ADEH1999a) defined, as [Acerbi and Tasche (2002)](#ref-AT2002a) showed in general. VaR does not always belong, since it can fail subadditivity.

## How the Extreme Value Risk Measures Panel Relates to the Diagnostics Panel

The Extreme Value Risk Measures panel takes the tail definition as given. A threshold or block choice comes from the Extreme Value Diagnostics panel, with its **Mean Excess**, **Hill Plot** and **QQ Plot** tabs and its **Threshold Stability** step. The tooltip of **Threshold u** points to those plots, but they are not among the Next Steps of the risk panel. Running the two panels in that order keeps the risk figures tied to a checked threshold.

## A Common Workflow in the Extreme Value Risk Measures Panel

1. Define the losses as positive numbers, and decide between block maxima and a threshold.
2. Check the threshold or the GEV fit in the Extreme Value Diagnostics panel.
3. For block maxima, run **Return Levels** with periods that suit the question.
4. For a threshold, run **Peaks-Over-Threshold** and read the shape, then **Tail Risk** with a chosen **alpha (level)**.
5. Use **Empirical vs Extreme Value Risk** to compare the tail figures with the historical ones.
6. Repeat with a nearby threshold and report how much the figures move.

## References

<a id="ref-AT2002a"></a>Acerbi, C. and Tasche, D. (2002). Expected shortfall: a natural coherent alternative to value at risk. *Economic Notes* 31(2), 379–388. [doi:10.1111/1468-0300.00091](https://doi.org/10.1111/1468-0300.00091)

<a id="ref-ADEH1999a"></a>Artzner, P., Delbaen, F., Eber, J.-M. and Heath, D. (1999). Coherent measures of risk. *Mathematical Finance* 9(3), 203–228. [doi:10.1111/1467-9965.00068](https://doi.org/10.1111/1467-9965.00068)

<a id="ref-DS1990a"></a>Davison, A. C. and Smith, R. L. (1990). Models for exceedances over high thresholds. *Journal of the Royal Statistical Society Series B: Statistical Methodology* 52(3), 393–425. [doi:10.1111/j.2517-6161.1990.tb01796.x](https://doi.org/10.1111/j.2517-6161.1990.tb01796.x)

<a id="ref-EKM1997a"></a>Embrechts, P., Klüppelberg, C. and Mikosch, T. (1997). *Modelling extremal events for insurance and finance*. Springer Berlin Heidelberg. [doi:10.1007/978-3-642-33483-2](https://doi.org/10.1007/978-3-642-33483-2)

<a id="ref-JFGR2024a"></a>Jalbert, J., Farmer, M., Gobeil, G. and Roy, P. (2024). Extremes.jl: extreme value analysis in Julia. *Journal of Statistical Software* 109(6). [doi:10.18637/jss.v109.i06](https://doi.org/10.18637/jss.v109.i06)

<a id="ref-MF2000a"></a>McNeil, A. J. and Frey, R. (2000). Estimation of tail-related risk measures for heteroscedastic financial time series. *Journal of Empirical Finance* 7(3–4), 271–300. [doi:10.1016/S0927-5398(00)00012-8](https://doi.org/10.1016/S0927-5398(00)00012-8)

<a id="ref-Pic1975a"></a>Pickands, J. (1975). Statistical inference using extreme order statistics. *The Annals of Statistics* 3(1), 119–131. [doi:10.1214/aos/1176343003](https://doi.org/10.1214/aos/1176343003)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
