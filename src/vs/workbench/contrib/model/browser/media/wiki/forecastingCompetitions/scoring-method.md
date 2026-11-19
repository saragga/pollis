# Scoring a Method

How to write the forecasting method of the page Score Models, which benchmarks it is scored beside, and when it is ranked among the entries of a competition.

## How Do I Write the Forecast Function?

The step Your Method holds Julia code that defines a function `forecast(y, h, period)`. Its arguments are `y`, the values of one series that the forecasters saw, in order, as a vector of `Float64`; `h`, the number of steps to forecast; and `period`, the seasonal period of the series, 1 for none. The function must return `h` finite numbers, the forecasts of steps 1 to `h`. The code may load any Julia package installed in the session with `using`, and define other functions beside `forecast`. The function is called on each series on its own, so a method cannot learn from other series of the competition; the page's example is the benchmark Theta of M4, written out from the functions of `PollisCompetitions.M4Benchmarks`.

## How Do I Write the Decide Function for M6?

For M6, the step Your Method holds Julia code that defines a function `decide(prices, date)`. It is called once at each of the 12 rounds, with `date`, the first day of the round, and `prices`, the prices of the 100 assets up to that day, a table of the columns `symbol`, `date` and `price`. It must return a table, such as a NamedTuple of vectors, with a row for each asset: `symbol`; `rank1` to `rank5`, the probabilities that the asset's return over the four weeks of the round ranks in each fifth of the 100 assets, from the lowest to the highest; and `decision`, the weight invested in the asset, negative for a short sale. The page's example is M6 Dummy, the benchmark of M6 [(Makridakis, Spiliotis, Hollyman, Petropoulos, Swanson and Gaba, 2025)](#ref-MSHPS...2025a): 0.2 for every probability and the same weight for every asset.

## How Is a Run of M6 Checked and Ranked?

A run of M6 checks the answer of `decide` at each round: every asset must have a row, each probability must be from 0 to 1, the five of an asset must add up to 1, and the absolute weights must add up to 0.25 to 1. A round that breaks a rule stops the run, with the round and the asset named. The submissions are scored by the RPS and the IR of each round, each quarter and the year, beside the published scores of M6 Dummy. The place is by Overall Rank (OR) over the year, among the teams the organisers ranked for the year and the method. Their RPS and IR are computed from their submissions by PollisCompetitions.jl, ranked to six decimals with ties sharing the mean of their places, and the OR is the mean of the two ranks, as the organisers ranked them.

## What Happens When the Forecast Function Fails?

When `forecast` throws an error on a series, or returns the wrong number of values, or a value that is not finite, the series is counted as failed in the progress of the step Run, and the run goes on with the other series. Once every series has been tried, a run with failed series stops before scoring, since the measures of a competition need a forecast of every series chosen, and the step Score and Rank shows the number of failed series, the name of the first one, and its error. The function can then be fixed in `method.jl`, or in the step Your Method of a new run.

## Which Benchmarks Is a Method Scored Beside?

For a run of all the series of M4, or of all the series of one frequency, the method is scored beside the published scores of the benchmark entries of M4. For a sample of M4, the eight benchmarks of M4 are computed on the same series by PollisCompetitions.jl, which follows the code with which the organisers computed them, and scored as the method is. For M5 Accuracy, the method is scored beside the published scores of its 24 benchmarks. For M1 and M3, the method is scored beside Naive2, computed on the same series, which is also the method against which their OWA is weighed. For M6, the method is scored beside the published scores of M6 Dummy, the benchmark of M6.

## When Is a Method Ranked Among the Entries?

The organisers of M4 published the scores of every entry in total and for each frequency, and those of M5 the WRMSSE of every entry on all its series. A method is therefore ranked only on the same series: all the series of M4, all the series of one frequency of M4, or all the series of M5. The place is the method's rank by OWA for M4, or by WRMSSE for M5, among the published scores of the entries that gave point forecasts, the method included. M1 and M3 have no entries in PollisCompetitions.jl, so their runs are scored but not ranked. A run of M6 is always of all its rounds, and is ranked by OR among its teams.

## Why Run a Sample of Series?

A run of all 100,000 series of M4 calls the forecast function 100,000 times, which for a slow method can take hours. **A Sample of** with a number of series runs the method on that many series of M1, M3 or M4, drawn at random among those of the frequency chosen, or among all of them; the same **Seed** draws the same series again, so two methods can be compared on the same sample. A sample is scored beside benchmarks computed on the same series, not ranked. M5 is always run on all 30,490 series, since its WRMSSE adds the forecasts of every series up into the series of its 12 levels, and M6 on all its 12 rounds of 100 assets.

## How Fast Does a Run Go?

The series are forecast over the threads of the Julia session, so a session started with more threads, such as `julia --threads=auto`, forecasts more series at a time. The forecast function must then be safe to call on several series at once: it must not change a global variable or a value it shares with other calls. The step Run shows how many series are done and the seconds since the run started, from `progress.json`, which the run updates after each hundredth of its series.

## What Does Errors by Horizon Show?

**Errors by Horizon**, in the Next Steps of Score Models, gives the sMAPE and the MASE of a run's method at each step ahead, from 1 to the horizon, beside those of Naive2 on the same series. Each value is the mean over the series of one frequency, as the series of different frequencies have different horizons; a run of several frequencies has a choice of frequency. Errors usually grow with the step ahead, and a method that does well in total may do so on the first steps only. The organisers of M1 [(Makridakis and 8 coauthors, 1982)](#ref-MACFH...1982a) and of M3 [(Makridakis and Hibon, 2000)](#ref-MH2000a) reported the accuracy of each method at each forecast horizon in the same way. The step uses `step_errors` of PollisCompetitions.jl, whose means over the horizon of a series are the sMAPE and the MASE [(Hyndman and Koehler, 2006)](#ref-HK2006a) that the scores average. It is for M1, M3 and M4.

## What Does Browse the Series Show?

**Browse the Series**, in the Next Steps of Score Models, plots one series of a run at a time: the values the forecasters saw, the values the series was scored on, the method's forecast and, when the forecasts of the competition's winner are on this computer, the winner's. For M1, M3 and M4, a **Benchmark** of M4 computed on the series by PollisCompetitions.jl can be drawn beside them, Naive2 by default; a series too short for Holt's method and its damped form has Naive2 alone. **Show** finds a series by the name its source gives it, such as `Y1` in M4, and **Previous** and **Next** go through the series of the run in order. The plot shows the last three horizons of past values, or **All the Past Values**, and a table below it gives each forecast step by step.

## What Does Where It Fails Show?

**Where It Fails**, in the Next Steps of Score Models, compares a run's method with Naive2 series by series, for M1, M3 and M4. Its first table counts, for each frequency and in total, the series the method forecasts better than Naive2 and those it forecasts worse, by sMAPE and by MASE. Its second table holds the series where the method does worst: the 100 worst by each of four measures, the method's sMAPE and MASE and each relative to that of Naive2 on the same series. A relative measure above 1 means the method erred more than Naive2 on that series, and a click on a heading sorts the table by that column. The name of a series opens it in Browse the Series, to see where its forecast went wrong.

## What Does Compare With an Entry Show?

**Compare With an Entry**, in the Next Steps of Score Models, sets a run's method beside one entry of M4 or M5 Accuracy, a submission or a benchmark, on the same series. **List the Entries** lists the entries that gave point forecasts, submissions by their rank, and **Compare** scores the chosen entry's forecasts of the run's series beside the method's, so that a sample of M4 is compared on the sample alone. For M4, the step also counts the series each forecasts better, by sMAPE and by MASE, and lists the 50 series where the entry does better than the method, and the 50 where the method does better, by MASE relative to the entry's. For M5, it gives the WRMSSE of both at each of the 12 levels and in total.

## What Does Compare Two Runs Show?

**Compare Two Runs**, in the Next Steps of Score Models, sets the run shown in steps 3 and 4 beside another of the user's runs, chosen in **The Other Run**. Two runs are compared only when they are on the same series: the same competition, frequency and number of series, and for a sample the same seed, so that two methods, or two versions of one, can be tried on the same sample and set side by side. The table gives the scores of both, their places among the entries when the runs are ranked, and the seconds each took. **Compare method.jl** opens the two methods in a diff editor, the other run's on the left. The step reads the files the two runs wrote, and runs no Julia.

## References

<a id="ref-HK2006a"></a>Hyndman, R. J. and Koehler, A. B. (2006). Another Look at Measures of Forecast Accuracy. *International Journal of Forecasting* 22(4), 679–688. [doi:10.1016/j.ijforecast.2006.03.001](https://doi.org/10.1016/j.ijforecast.2006.03.001)

<a id="ref-MACFH...1982a"></a>Makridakis, S., Andersen, A. P., Carbone, R., Fildes, R. A., Hibon, M., Lewandowski, R., Newton, J., Parzen, E. and Winkler, R. L. (1982). The Accuracy of Extrapolation (Time Series) Methods: Results of a Forecasting Competition. *Journal of Forecasting* 1(2), 111–153. [doi:10.1002/for.3980010202](https://doi.org/10.1002/for.3980010202)

<a id="ref-MH2000a"></a>Makridakis, S. and Hibon, M. (2000). The M3-Competition: Results, Conclusions and Implications. *International Journal of Forecasting* 16(4), 451–476. [doi:10.1016/s0169-2070(00)00057-1](https://doi.org/10.1016/s0169-2070(00)00057-1)

<a id="ref-MSHPS...2025a"></a>Makridakis, S., Spiliotis, E., Hollyman, R., Petropoulos, F., Swanson, N. and Gaba, A. (2025). The M6 Forecasting Competition: Bridging the Gap Between Forecasting and Investment Decisions. *International Journal of Forecasting* 41(4), 1315–1354. [doi:10.1016/j.ijforecast.2024.11.002](https://doi.org/10.1016/j.ijforecast.2024.11.002)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [The M Competitions](m-competitions.md) · [The Error Measures](error-measures.md) · [Licences and Downloads](licences-downloads.md)
