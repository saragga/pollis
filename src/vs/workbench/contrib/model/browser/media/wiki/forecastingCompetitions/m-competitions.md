# The M Competitions

The M competitions are a series of forecasting competitions, named after Spyros Makridakis, in which many forecasters forecast the same series without seeing their future values, and the organisers then compare the forecasts with what happened. The page Forecasting Challenges and Competitions holds M1, M3, M4, the Accuracy competition of M5, and M6.

## What Was the M1 Competition?

The M1 competition [(Makridakis and 8 coauthors, 1982)](#ref-MACFH...1982a) compared extrapolation methods on 1,001 yearly, quarterly and monthly series of economic, industrial and demographic data. Each method was run by an expert in it, and the most costly methods were run on a subsample of 111 series. The organisers reported the accuracy of each method by several measures and over forecast horizons from one step to eighteen. Among their conclusions, statistically sophisticated or complex methods did not give more accurate forecasts than simpler ones, and combining the forecasts of several methods did better, on average, than the methods combined.

## What Was the M3 Competition?

The M3 competition [(Makridakis and Hibon, 2000)](#ref-MH2000a) had 3,003 series of yearly, quarterly, monthly and other data, from micro, industry, macro, finance, demographic and other domains, forecast by 24 methods. The organisers found that its results confirmed the conclusions of M1. The Theta method [(Assimakopoulos and Nikolopoulos, 2000)](#ref-AN2000a), which forecasts from a series' long-run trend and a simple exponential smoothing of a curve that doubles its local changes, was among the most accurate methods of M3, and its classical form became one of the benchmarks of M4.

## What Was the M4 Competition?

The M4 competition [(Makridakis, Spiliotis and Assimakopoulos, 2020)](#ref-MSA2020a) had 100,000 series of yearly, quarterly, monthly, weekly, daily and hourly data, and 61 forecasting methods, among them benchmarks set by the organisers. Each entry gave point forecasts, and some also gave prediction intervals. The organisers ranked the point forecasts by the Overall Weighted Average (OWA) of sMAPE and MASE, relative to the benchmark Naive2. They reported that the most accurate methods combined statistical methods, or combined statistical methods with machine learning, and that the pure machine learning methods entered did worse than the benchmarks. The organisers published the forecasts of every entry, with the code of many of them.

## What Was the M5 Accuracy Competition?

The M5 competition [(Makridakis, Spiliotis and Assimakopoulos, 2022a)](#ref-MSA2022a) asked for forecasts of the daily unit sales of 3,049 products in ten Walmart stores in three states of the United States, over 28 days. The 30,490 series of a product in a store add up into 42,840 series over 12 levels, from the total of all sales to each product in each store. M5 had two competitions, held on Kaggle: Accuracy, of point forecasts, and Uncertainty, of quantiles. In Accuracy [(Makridakis, Spiliotis and Assimakopoulos, 2022b)](#ref-MSA2022b), the most accurate entries were mostly machine learning methods, many of them gradient boosted trees trained on many series at once, and they did better than the statistical benchmarks.

## What Was the M6 Competition?

The M6 competition [(Makridakis, Spiliotis, Hollyman, Petropoulos, Swanson and Gaba, 2025)](#ref-MSHPS...2025a) ran from 2022 to 2023 on 100 assets traded in the United States, 50 stocks of the S&P 500 and 50 exchange-traded funds. It had twelve rounds of four weeks, after a trial round. At each round, a team submitted forecasts, the probabilities that each asset's return over the next four weeks would rank in each fifth of the 100 assets, and investment decisions, the weight of each asset in a portfolio, negative for a short sale. The forecasts were scored by the Ranked Probability Score (RPS) and the decisions by the Information Ratio (IR), and the teams were ranked overall by the mean of their two ranks. The organisers found little relation between how well a team forecast and how well it invested.

## Which Benchmarks Do the M Competitions Use?

A benchmark is a simple method that the organisers forecast every series with, so that the entries can be measured against it. The eight statistical benchmarks of M4 are Naive (the last value), Seasonal Naive (the last period of values, repeated), Naive2 (Naive on the seasonally adjusted series), Simple Exponential Smoothing (SES), Holt's linear trend method, Holt's method with a damped trend, Theta, and Com, the mean of SES, Holt and Damped. The organisers computed them with the R package forecast [(Hyndman and Khandakar, 2008)](#ref-HK2008a), and PollisCompetitions.jl computes them as they did. M5 had 24 benchmarks of its own, from naive methods to exponential smoothing and machine learning. The benchmark of M6, M6 Dummy, gave every asset the same five probabilities, 0.2 each, and the same weight.

## References

<a id="ref-AN2000a"></a>Assimakopoulos, V. and Nikolopoulos, K. (2000). The Theta Model: A Decomposition Approach to Forecasting. *International Journal of Forecasting* 16(4), 521–530. [doi:10.1016/s0169-2070(00)00066-2](https://doi.org/10.1016/s0169-2070(00)00066-2)

<a id="ref-HK2008a"></a>Hyndman, R. J. and Khandakar, Y. (2008). Automatic Time Series Forecasting: The forecast Package for R. *Journal of Statistical Software* 27(3), 1–22. [doi:10.18637/jss.v027.i03](https://doi.org/10.18637/jss.v027.i03)

<a id="ref-MACFH...1982a"></a>Makridakis, S., Andersen, A. P., Carbone, R., Fildes, R. A., Hibon, M., Lewandowski, R., Newton, J., Parzen, E. and Winkler, R. L. (1982). The Accuracy of Extrapolation (Time Series) Methods: Results of a Forecasting Competition. *Journal of Forecasting* 1(2), 111–153. [doi:10.1002/for.3980010202](https://doi.org/10.1002/for.3980010202)

<a id="ref-MH2000a"></a>Makridakis, S. and Hibon, M. (2000). The M3-Competition: Results, Conclusions and Implications. *International Journal of Forecasting* 16(4), 451–476. [doi:10.1016/s0169-2070(00)00057-1](https://doi.org/10.1016/s0169-2070(00)00057-1)

<a id="ref-MSA2020a"></a>Makridakis, S., Spiliotis, E. and Assimakopoulos, V. (2020). The M4 Competition: 100,000 Time Series and 61 Forecasting Methods. *International Journal of Forecasting* 36(1), 54–74. [doi:10.1016/j.ijforecast.2019.04.014](https://doi.org/10.1016/j.ijforecast.2019.04.014)

<a id="ref-MSA2022a"></a>Makridakis, S., Spiliotis, E. and Assimakopoulos, V. (2022a). The M5 Competition: Background, Organization, and Implementation. *International Journal of Forecasting* 38(4), 1325–1336. [doi:10.1016/j.ijforecast.2021.07.007](https://doi.org/10.1016/j.ijforecast.2021.07.007)

<a id="ref-MSA2022b"></a>Makridakis, S., Spiliotis, E. and Assimakopoulos, V. (2022b). M5 Accuracy Competition: Results, Findings, and Conclusions. *International Journal of Forecasting* 38(4), 1346–1364. [doi:10.1016/j.ijforecast.2021.11.013](https://doi.org/10.1016/j.ijforecast.2021.11.013)

<a id="ref-MSHPS...2025a"></a>Makridakis, S., Spiliotis, E., Hollyman, R., Petropoulos, F., Swanson, N. and Gaba, A. (2025). The M6 Forecasting Competition: Bridging the Gap Between Forecasting and Investment Decisions. *International Journal of Forecasting* 41(4), 1315–1354. [doi:10.1016/j.ijforecast.2024.11.002](https://doi.org/10.1016/j.ijforecast.2024.11.002)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [The Error Measures](error-measures.md) · [Scoring a Method](scoring-method.md) · [Licences and Downloads](licences-downloads.md)
