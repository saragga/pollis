# The Error Measures

The page Score Models scores forecasts by three measures, the sMAPE, the MASE and the OWA, for every dataset. PollisCompetitions.jl computes them over the series of a run, by frequency and in total.

## What Is the sMAPE?

The symmetric Mean Absolute Percentage Error (sMAPE) of a series is the mean, over the steps of the horizon, of the absolute error of the forecast divided by the mean of the absolute actual value and the absolute forecast, times 100: `sMAPE = mean(200 * |y - f| / (|y| + |f|))`. The sMAPE of a frequency, or in total, is the mean of the sMAPE of its series. Being a percentage, the sMAPE has no unit, so series of different scales can be averaged; it is unstable for values near zero, which is one reason for a scaled measure [(Hyndman and Koehler, 2006)](#ref-HK2006a).

## What Is the MASE?

The Mean Absolute Scaled Error (MASE) of a series, proposed by [Hyndman and Koehler (2006)](#ref-HK2006a), is the mean absolute error of the forecast over the horizon, divided by the mean absolute error that Seasonal Naive makes one period ahead on the values the forecasters saw: `MASE = mean(|y - f|) / mean(|y[t] - y[t - m]|)`, where `m` is the seasonal period of the series. A MASE below one means that the forecast erred less, on average, than Seasonal Naive did in the past values of the series. The MASE of a frequency, or in total, is the mean of the MASE of its series.

## What Is the OWA?

The Overall Weighted Average (OWA), defined by [Makridakis, Spiliotis and Assimakopoulos (2020)](#ref-MSA2020a), weighs a method's sMAPE and MASE against those of the benchmark Naive2 on the same series: `OWA = (sMAPE / sMAPE of Naive2 + MASE / MASE of Naive2) / 2`. The two ratios are taken of the means over the series, for a frequency or in total, and not series by series. An OWA below one means that the method is more accurate than Naive2, which has an OWA of one. PollisCompetitions.jl computes the forecasts of Naive2 on the same series, from the values the forecasters saw.

## Why Are the Measures Scaled?

The series of a dataset can be of very different sizes, from a few units to millions, so an error in the series' own units cannot be averaged across them. The sMAPE divides each error by the size of the values, the MASE by the error a naive forecast made in the past of the same series, and the OWA then combines the two against a benchmark. A measure scaled by the past errors of a naive forecast stays defined when the values are zero [(Hyndman and Koehler, 2006)](#ref-HK2006a).

## References

<a id="ref-HK2006a"></a>Hyndman, R. J. and Koehler, A. B. (2006). Another Look at Measures of Forecast Accuracy. *International Journal of Forecasting* 22(4), 679–688. [doi:10.1016/j.ijforecast.2006.03.001](https://doi.org/10.1016/j.ijforecast.2006.03.001)

<a id="ref-MSA2020a"></a>Makridakis, S., Spiliotis, E. and Assimakopoulos, V. (2020). The M4 Competition: 100,000 Time Series and 61 Forecasting Methods. *International Journal of Forecasting* 36(1), 54–74. [doi:10.1016/j.ijforecast.2019.04.014](https://doi.org/10.1016/j.ijforecast.2019.04.014)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Scoring a Method](scoring-method.md) · [Licences and Downloads](licences-downloads.md)
