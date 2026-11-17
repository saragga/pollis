# The Error Measures

The page Forecasting Challenges and Competitions scores forecasts by the measures of M4 for M1, M3 and M4, by the measure of M5 Accuracy for M5, and by the RPS, the IR and the OR for M6. Each is computed by PollisCompetitions.jl as the organisers of the competition computed it.

## What Is the sMAPE?

The symmetric Mean Absolute Percentage Error (sMAPE) of a series is the mean, over the steps of the horizon, of the absolute error of the forecast divided by the mean of the absolute actual value and the absolute forecast, times 100: `sMAPE = mean(200 * |y - f| / (|y| + |f|))`. The sMAPE of M4 for a frequency, or in total, is the mean of the sMAPE of its series. Being a percentage, the sMAPE has no unit, so series of different scales can be averaged; it is unstable for values near zero, which is one reason M4 added a scaled measure [(Hyndman and Koehler, 2006)](#ref-HK2006a).

## What Is the MASE?

The Mean Absolute Scaled Error (MASE) of a series, proposed by [Hyndman and Koehler (2006)](#ref-HK2006a), is the mean absolute error of the forecast over the horizon, divided by the mean absolute error that Seasonal Naive makes one period ahead on the values the forecasters saw: `MASE = mean(|y - f|) / mean(|y[t] - y[t - m]|)`, where `m` is the seasonal period of the series. A MASE below one means that the forecast erred less, on average, than Seasonal Naive did in the past values of the series. The MASE of M4 for a frequency, or in total, is the mean of the MASE of its series.

## What Is the OWA?

The Overall Weighted Average (OWA) of M4 [(Makridakis, Spiliotis and Assimakopoulos, 2020)](#ref-MSA2020a) weighs a method's sMAPE and MASE against those of the benchmark Naive2 on the same series: `OWA = (sMAPE / sMAPE of Naive2 + MASE / MASE of Naive2) / 2`. The two ratios are taken of the means over the series, for a frequency or in total, and not series by series. An OWA below one means that the method is more accurate than Naive2, which has an OWA of one. The page ranks M4 by OWA, as the organisers ranked its point forecasts.

## What Is the WRMSSE?

The Weighted Root Mean Squared Scaled Error (WRMSSE) of M5 [(Makridakis, Spiliotis and Assimakopoulos, 2022a)](#ref-MSA2022a) is computed on the 42,840 series of its 12 levels, which the forecasts of the 30,490 series of a product in a store add up into. The Root Mean Squared Scaled Error (RMSSE) of a series is the root of its mean squared error over the 28 days, divided by the mean squared change from one day to the next of its past values, counted from its first day with a sale. The WRMSSE of a level is the sum of the RMSSE of its series, each weighted by its share of the sales in dollars over the last 28 days of the past values, and the WRMSSE in total is the mean of the 12 levels.

## What Is the RPS of M6?

The Ranked Probability Score (RPS) of M6 [(Makridakis, Spiliotis, Hollyman, Petropoulos, Swanson and Gaba, 2025)](#ref-MSHPS...2025a) scores the forecasts of a round. The 100 assets are ranked by their return over the four weeks of the round, and each is placed in one of five groups of 20, from the lowest returns to the highest; assets with the same return share the groups they span. For one asset, with `p` the five probabilities forecast and `o` its outcome, 1 for its group and 0 for the others, `RPS = mean((cumsum(p) - cumsum(o)) .^ 2)` over the five groups. The RPS of the round is the mean over the 100 assets, and that of a quarter or of the year the mean of its rounds. A lower RPS is better; probabilities of 0.2 for every group, as M6 Dummy gives, score 0.16.

## What Are the IR and the OR of M6?

The Information Ratio (IR) of M6 scores the decisions, the weights of a portfolio of the 100 assets. Each day of a round, the portfolio's return is `r = log(1 + sum(w .* returns))`, with `w` the weights and `returns` the assets' returns of that day. The IR is `sum(r) / std(r)` over the days of a round, or over all the days of a quarter or of the year, so it rewards returns that are high for the risk taken. A higher IR is better. The Overall Rank (OR) of a team is the mean of its rank by RPS and its rank by IR among the teams, teams with the same score sharing the mean of their places, and a lower OR is better.

## Why Are the Measures Scaled?

The series of a competition are of very different sizes, from a few units to millions, so an error in the series' own units cannot be averaged across them. The sMAPE divides each error by the size of the values, the MASE and the RMSSE by the error a naive forecast made in the past of the same series, and OWA and the WRMSSE then combine these over the series. A measure scaled by the past errors of a naive forecast stays defined when the values are zero, as many of the daily sales of M5 are [(Hyndman and Koehler, 2006)](#ref-HK2006a).

## References

<a id="ref-HK2006a"></a>Hyndman, R. J. and Koehler, A. B. (2006). Another Look at Measures of Forecast Accuracy. *International Journal of Forecasting* 22(4), 679–688. [doi:10.1016/j.ijforecast.2006.03.001](https://doi.org/10.1016/j.ijforecast.2006.03.001)

<a id="ref-MSA2020a"></a>Makridakis, S., Spiliotis, E. and Assimakopoulos, V. (2020). The M4 Competition: 100,000 Time Series and 61 Forecasting Methods. *International Journal of Forecasting* 36(1), 54–74. [doi:10.1016/j.ijforecast.2019.04.014](https://doi.org/10.1016/j.ijforecast.2019.04.014)

<a id="ref-MSA2022a"></a>Makridakis, S., Spiliotis, E. and Assimakopoulos, V. (2022a). The M5 Competition: Background, Organization, and Implementation. *International Journal of Forecasting* 38(4), 1325–1336. [doi:10.1016/j.ijforecast.2021.07.007](https://doi.org/10.1016/j.ijforecast.2021.07.007)

<a id="ref-MSHPS...2025a"></a>Makridakis, S., Spiliotis, E., Hollyman, R., Petropoulos, F., Swanson, N. and Gaba, A. (2025). The M6 Forecasting Competition: Bridging the Gap Between Forecasting and Investment Decisions. *International Journal of Forecasting* 41(4), 1315–1354. [doi:10.1016/j.ijforecast.2024.11.002](https://doi.org/10.1016/j.ijforecast.2024.11.002)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [The M Competitions](m-competitions.md) · [Scoring a Method](scoring-method.md) · [Licences and Downloads](licences-downloads.md)
