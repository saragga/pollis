# Volatility Measurement — Overview

Volatility cannot be observed directly: only prices are. Each estimator in this panel turns the prices at hand into a measure of how much a price varies over a period, with no fitted model and no parameters to estimate apart from a weight or a subsample count.

## Why Close-to-Close Returns Waste Information

The classical estimate is the standard deviation of daily close-to-close returns, which uses a single price from each day. A day when the price ranged widely and ended where it began looks calm to that estimate. Daily highs and lows, opening prices and intraday trades all carry extra information about the same variance, and each estimator here uses some of it. With a given number of days, more information means less sampling error, or equally good precision from a shorter window that can follow changes faster.

## What the Range Estimators Use

Four tabs read daily bars. **Parkinson**, after [Parkinson (1980)](#ref-Par1980a), uses **High** and **Low**. **Garman-Klass**, after [Garman and Klass (1980)](#ref-GK1980a), adds **Open** and **Close**. **Rogers-Satchell**, after [Rogers and Satchell (1991)](#ref-RS1991a), uses the same four prices in a form unaffected by drift. **Yang-Zhang**, after [Yang and Zhang (2000)](#ref-YZ2000a), also takes account of the gap between one close and the next open. All four return one daily volatility for the sample, and each is the square root of an average variance per bar.

## What the Intraday Estimators Use

Three tabs read a **Price** series observed within the day. **Realized Volatility**, in the tradition of [Andersen and Bollerslev (1998)](#ref-AB1998a), adds up squared intraday log returns. **Two Scales Volatility**, after [Zhang, Mykland and Aït-Sahalia (2005)](#ref-ZMA2005a), removes the upward bias that bid-ask bounce and similar market noise give to that sum at high frequency. **Bipower**, after [Barndorff-Nielsen and Shephard (2004)](#ref-BS2004a), multiplies adjacent absolute returns, which limits the effect of a jump. Each covers the whole series it is given, so the input should normally be a single day.

## How Bipower Variation Separates Jumps

**Bipower** computes (pi/2) times the sum of |r_t| |r_{t−1}|, where r_t are the intraday log returns. The factor pi/2 makes it consistent for integrated variance when there are no jumps. A single large return enters realized variance squared, while here it is multiplied by a neighbouring ordinary return, so its effect fades as sampling becomes finer. The tab prints a variance, whereas the others print a volatility, and **Annualise** takes the square root first. A realized variance well above bipower variation points to jumps, which the **Barndorff-Nielsen and Shephard Test** puts on a formal scale.

## Which Volatility Estimator Fits the Data

| Data and concern | Tab | Why |
|---|---|---|
| Only daily high and low prices | **Parkinson** | About 5 times more efficient than close-to-close |
| Full OHLC bars with negligible drift | **Garman-Klass** | Adds open and close to the range |
| OHLC bars with a trending price | **Rogers-Satchell** | Unaffected by drift |
| OHLC bars with overnight gaps | **Yang-Zhang** | Combines overnight, open-to-close and range variances |
| Intraday prices with little market noise | **Realized Volatility** | Direct sum of squared returns |
| Tick data contaminated by market noise | **Two Scales Volatility** | Corrects the noise bias |
| Intraday prices with possible jumps | **Bipower** | Robust to jumps, and supports jump testing |

## What the Next Steps Add

**Price Plot** and **Log Returns** show the inputs. **Rolling Volatility** and **Volatility Regimes** apply a window of 21 observations, and regimes split the rolling values into terciles labelled low, normal and high. **EWMA Volatility Forecast** runs an exponentially weighted average with a decay of 0.94. **Compare Estimators** sets a range estimator beside close-to-close volatility, or realized against bipower volatility. **Annualise** multiplies by the square root of 252, which is valid when the figure is daily. The **Barndorff-Nielsen and Shephard Test** needs returns, so it stops with an error on **Parkinson**, and it warns that on daily returns its result is only indicative.

## References

<a id="ref-AB1998a"></a>Andersen, T. G. and Bollerslev, T. (1998). Answering the skeptics: yes, standard volatility models do provide accurate forecasts. *International Economic Review* 39(4), 885–905. [doi:10.2307/2527343](https://doi.org/10.2307/2527343)

<a id="ref-BS2004a"></a>Barndorff-Nielsen, O. E. and Shephard, N. (2004). Power and bipower variation with stochastic volatility and jumps. *Journal of Financial Econometrics* 2(1), 1–37. [doi:10.1093/jjfinec/nbh001](https://doi.org/10.1093/jjfinec/nbh001)

<a id="ref-GK1980a"></a>Garman, M. B. and Klass, M. J. (1980). On the estimation of security price volatilities from historical data. *Journal of Business* 53(1), 67. [doi:10.1086/296072](https://doi.org/10.1086/296072)

<a id="ref-Par1980a"></a>Parkinson, M. (1980). The extreme value method for estimating the variance of the rate of return. *Journal of Business* 53(1), 61. [doi:10.1086/296071](https://doi.org/10.1086/296071)

<a id="ref-RS1991a"></a>Rogers, L. C. G. and Satchell, S. E. (1991). Estimating variance from high, low and closing prices. *Annals of Applied Probability* 1(4), 504–512. [doi:10.1214/aoap/1177005835](https://doi.org/10.1214/aoap/1177005835)

<a id="ref-YZ2000a"></a>Yang, D. and Zhang, Q. (2000). Drift-independent volatility estimation based on high, low, open, and close prices. *Journal of Business* 73(3), 477–492. [doi:10.1086/209650](https://doi.org/10.1086/209650)

<a id="ref-ZMA2005a"></a>Zhang, L., Mykland, P. A. and Aït-Sahalia, Y. (2005). A tale of two time scales: determining integrated volatility with noisy high-frequency data. *Journal of the American Statistical Association* 100(472), 1394–1411. [doi:10.1198/016214505000000169](https://doi.org/10.1198/016214505000000169)

## See Also

- [Introduction to HF Volatility](intro-hf-finance.md) · [Parkinson](parkinson.md) · [Yang-Zhang](yang-zhang.md) · [Realized Volatility](realized-volatility.md) · [Two Scales Volatility](two-scales-volatility.md)
