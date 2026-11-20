# Agents' Forecasting Competition: Overview

Agents' Forecasting Competition gives the same series of a forecasting dataset to several coding agents, and each writes, on its own, the forecasting method it believes will forecast them best. Pollis runs every method, scores its forecasts on the values held back by sMAPE, MASE and OWA, and scores beside them the mean and the median of the agents' forecasts and the statistical benchmarks. The page is in Compose > Prediction Challenges, beside Score Models.

## What Is a Forecasting Competition?

A forecasting competition gives many series to many forecasters, keeps back the last values of each, and compares the forecasters' methods on those values once every forecast is in. Competitions of this kind have compared methods on economic and business series [(Makridakis and 8 coauthors, 1982)](#ref-MACFH...1982a), on tourism data [(Athanasopoulos, Hyndman, Song and Wu, 2011)](#ref-AHSW2011a) and on electricity loads [(Hong, Pinson and Fan, 2014)](#ref-HPF2014a). Agents' Forecasting Competition runs a small competition of this kind on the series of a dataset of PollisCompetitions.jl, with coding agents as the forecasters.

## What Are the Four Steps of Agents' Forecasting Competition?

**Dataset** names the study, which is the name of its folder, and chooses a forecasting dataset of PollisCompetitions.jl whose data are on this computer, built in with the package or downloaded, a frequency, and all its series or a sample drawn with a seed; **Prepare the Series** writes the values the forecasters saw into the study's data. **Agents** sets how many agents compete, from 2 to 8, and the agent and model of each. **Runs** starts every agent at once with **Start the Agents** and follows each one's status and time. **Scores** runs every method with **Score the Methods** and shows the table of scores. **Open a Study** reopens an earlier study.

## What Does Each Agent of Agents' Forecasting Competition Do?

Each agent is a coding agent started in its own terminal and its own folder, `agent-1` to `agent-N` of the study, with the forecast-independently skill of Pollis Agents as `SKILL.md`, its task as `TASK.md`, the series in `data/series.csv`, and `check.jl`, written by Pollis. The agent looks at the series in Julia, chooses a method, and writes it as `method.jl`, a function `forecast(y, h, period)` that returns `h` forecasts of a series. It runs `check.jl` until its method forecasts every series, then writes its reasons in `REPORT.md`. It works to the end with no questions to anyone, and no agent sees another's folder.

## What Does Pollis Compute in Julia for Agents' Forecasting Competition?

**Score the Methods** writes `score.jl` into the study's folder and sends code to the Julia REPL that runs it in a new Julia process, on every thread of the computer. `score.jl` runs each agent's `forecast` on every series, scores the forecasts with PollisCompetitions.jl by sMAPE, MASE and OWA, then combines the forecasts of the agents whose methods forecast every series, by their mean and their median, and scores the combinations. It computes the eight statistical benchmarks of `PollisCompetitions.Benchmarks` on the same series, each that every series is long enough for. Everything goes to `results.json`, from which the page draws the table.

## References

<a id="ref-AHSW2011a"></a>Athanasopoulos, G., Hyndman, R. J., Song, H. and Wu, D. C. (2011). The Tourism Forecasting Competition. *International Journal of Forecasting* 27(3), 822–844. [doi:10.1016/j.ijforecast.2010.04.009](https://doi.org/10.1016/j.ijforecast.2010.04.009)

<a id="ref-HPF2014a"></a>Hong, T., Pinson, P. and Fan, S. (2014). Global Energy Forecasting Competition 2012. *International Journal of Forecasting* 30(2), 357–363. [doi:10.1016/j.ijforecast.2013.07.001](https://doi.org/10.1016/j.ijforecast.2013.07.001)

<a id="ref-MACFH...1982a"></a>Makridakis, S., Andersen, A. P., Carbone, R., Fildes, R. A., Hibon, M., Lewandowski, R., Newton, J., Parzen, E. and Winkler, R. L. (1982). The Accuracy of Extrapolation (Time Series) Methods: Results of a Forecasting Competition. *Journal of Forecasting* 1(2), 111–153. [doi:10.1002/for.3980010202](https://doi.org/10.1002/for.3980010202)

## See Also

- [Factsheet](factsheet.md) · [Keeping the Test Unseen](keeping-test-unseen.md) · [Combining the Agents' Forecasts](combining-forecasts.md) · [The Error Measures](../forecastingCompetitions/error-measures.md)
