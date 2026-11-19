# Agents' Forecasting Competition: Overview

Agents' Forecasting Competition gives the same series of an M competition to several coding agents, and each writes, on its own, the forecasting method it believes will forecast them best. Pollis runs every method, scores its forecasts on the values held back, as the competition's organisers scored the entries, and scores beside them the mean and the median of the agents' forecasts and the competition's benchmarks. The page is in Compose > Prediction Competitions, beside Score Models.

## What Is a Forecasting Competition?

A forecasting competition gives many series to many forecasters, keeps back the last values of each, and compares the forecasters' methods on those values once every forecast is in. In the first M competition, [Makridakis and 8 coauthors (1982)](#ref-MACFH...1982a) had experts in each of 24 methods forecast up to 1,001 series over horizons of six to eighteen. [Makridakis and Hibon (2000)](#ref-MH2000a) report the third, and [Makridakis, Spiliotis and Assimakopoulos (2020)](#ref-MSA2020a) the fourth, with 100,000 series and 61 methods. Agents' Forecasting Competition runs a small competition of this kind on their series, with coding agents as the forecasters.

## What Are the Four Steps of Agents' Forecasting Competition?

**Competition** names the study, which is the name of its folder, and chooses M1, M3 or M4, a frequency, and all its series or a sample drawn with a seed; **Prepare the Series** writes the values the forecasters saw into the study's data, after downloading the competition when it is not on this computer. **Agents** sets how many agents compete, from 2 to 8, and the agent and model of each. **Runs** starts every agent at once with **Start the Agents** and follows each one's status and time. **Scores** runs every method with **Score the Methods** and shows the table of scores. **Open a Study** reopens an earlier study.

## What Does Each Agent of Agents' Forecasting Competition Do?

Each agent is a coding agent started in its own terminal and its own folder, `agent-1` to `agent-N` of the study, with the forecast-independently skill of Pollis Agents as `SKILL.md`, its task as `TASK.md`, the series in `data/series.csv`, and `check.jl`, written by Pollis. The agent looks at the series in Julia, chooses a method, and writes it as `method.jl`, a function `forecast(y, h, period)` that returns `h` forecasts of a series. It runs `check.jl` until its method forecasts every series, then writes its reasons in `REPORT.md`. It works to the end with no questions to anyone, and no agent sees another's folder.

## What Does Pollis Compute in Julia for Agents' Forecasting Competition?

**Score the Methods** writes `score.jl` into the study's folder and sends code to the Julia REPL that runs it in a new Julia process, on every thread of the computer. `score.jl` runs each agent's `forecast` on every series, scores the forecasts with PollisCompetitions.jl by sMAPE, MASE and OWA, as the organisers did, then combines the forecasts of the agents whose methods forecast every series, by their mean and their median, and scores the combinations. It computes the benchmarks on the same series: the eight of M4, or Naive2 for M1 and M3. For all the series of a frequency of M4, it also places each method among the published scores of the entries. Everything goes to `results.json`, from which the page draws the table.

## References

<a id="ref-MACFH...1982a"></a>Makridakis, S., Andersen, A. P., Carbone, R., Fildes, R. A., Hibon, M., Lewandowski, R., Newton, J., Parzen, E. and Winkler, R. L. (1982). The Accuracy of Extrapolation (Time Series) Methods: Results of a Forecasting Competition. *Journal of Forecasting* 1(2), 111–153. [doi:10.1002/for.3980010202](https://doi.org/10.1002/for.3980010202)

<a id="ref-MH2000a"></a>Makridakis, S. and Hibon, M. (2000). The M3-Competition: Results, Conclusions and Implications. *International Journal of Forecasting* 16(4), 451–476. [doi:10.1016/s0169-2070(00)00057-1](https://doi.org/10.1016/s0169-2070(00)00057-1)

<a id="ref-MSA2020a"></a>Makridakis, S., Spiliotis, E. and Assimakopoulos, V. (2020). The M4 Competition: 100,000 Time Series and 61 Forecasting Methods. *International Journal of Forecasting* 36(1), 54–74. [doi:10.1016/j.ijforecast.2019.04.014](https://doi.org/10.1016/j.ijforecast.2019.04.014)

## See Also

- [Factsheet](factsheet.md) · [Keeping the Test Unseen](keeping-test-unseen.md) · [Combining the Agents' Forecasts](combining-forecasts.md) · [The Error Measures](../forecastingCompetitions/error-measures.md)
