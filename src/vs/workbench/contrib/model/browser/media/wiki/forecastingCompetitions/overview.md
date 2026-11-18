# Score Forecasting Models: Overview

Score Forecasting Models runs a forecasting method of your own on the series of a forecasting competition, scores its forecasts with the measures of that competition, and shows where the method would have finished among the entries. It holds five of the M competitions: M1, M3, M4, M5 Accuracy and M6. The page is in Compose > Forecasting Competitions > Score Forecasting Models, and its Julia code comes from the package PollisCompetitions.jl.

## What Are the Four Steps of Score Forecasting Models?

**Datasets** lists the datasets ticked in the column Active of Manage Competition Datasets that Score Forecasting Models scores, of M1, M3, M4, M5 Accuracy, M6 and the datasets added there, with their series, frequencies, horizons, measures and entries, and whether each is on this computer; **Download** fetches a competition that is not on this computer. With none of them active, the step says so, and **Open Manage Competition Datasets** opens that page to tick them. The step also sets the **Frequency** to run, when one dataset is listed, and the **Series to Run**: **All**, or **A Sample of** a number of series drawn with a **Seed**. **Your Method** holds the Julia function that forecasts a series, or for M6 the function that decides, at each round, the probabilities and the weights of its assets. **Run** starts the method on every series chosen with **Run the Method**, shows its progress, and reopens an earlier run from **Earlier runs...**. **Score and Rank** shows the method's scores beside the benchmarks, its place among the entries, and a plot of one series with its forecast.

## How Does Score Forecasting Models Run a Method on Several Datasets?

With several datasets listed in the step Datasets, **Run the Method** runs the method of Your Method on each dataset in turn, with the same Series to Run and Seed: a sample of that size is drawn from each dataset that can be sampled, and M5 Accuracy is run whole. M6, whose method is `decide` rather than `forecast`, is a run of its own, sent to the Julia REPL after the others and found in Earlier runs; when M6 is listed with other datasets, the method defines both functions, `forecast` and `decide`, and the example holds both. The run's folder in `~/.pollis/competitions/runs` is named `datasets-` and the time; its `run.toml` names the datasets, and each dataset is a run of its own in the subfolder named by its id. **Score and Rank** opens with **Datasets of This Run**, a row for each dataset with its number of series, its scores, its place among the entries when it is ranked, and whether it is waiting, running, done or stopped. Selecting a row shows that dataset's scores, ranking, plotted series and Next Steps below the table.

## How Are the Datasets You Added Scored?

A dataset added with Add a Dataset in Manage Competition Datasets is listed in the step Datasets after the competitions, and is always on this computer, in `data/forecasting/` of the Pollis Workspace. It is scored as M1 and M3 are: sMAPE, MASE and OWA, beside Naive2 computed on the same series, and never ranked, as it has no entries. PollisCompetitions.jl reads it from its folder, which the run's `run.toml` records as `folder`, in place of the id of a competition; this needs a version of the package that reads such folders. Its Next Steps are those of M1 and M3.

## How Does Score Forecasting Models Run a Method?

**Run the Method** writes a folder for the run in `~/.pollis/competitions/runs`, named after the competition, the frequency and the time, and sends one line to the Julia REPL that runs the folder's `run.jl`. That script reads the values the forecasters saw of each series chosen, calls the function `forecast` of `method.jl` on each series on its own, over the threads of the Julia session, and writes `progress.json` as it goes, which the page reads to show how many series are done. When every series is forecast, the script writes the forecasts to `forecasts.csv`, scores them with PollisCompetitions.jl, and writes `results.json`, from which the page draws the step Score and Rank.

## What Does the Step Score and Rank Show?

The table **Scores** gives the method's scores in the measures of the competition: sMAPE, MASE and OWA for M1, M3 and M4, WRMSSE for M5, and RPS, IR and OR for M6. Below the method come the benchmarks, either their published scores or scores computed on the same series. **Place** gives the method's rank among the published scores of the entries, with the table of every entry in order, when the run can be ranked. **A Series** plots the first series of the run: its last values, the values it was scored on, the method's forecast and, when its forecasts are on this computer, the forecast of the competition's winner. For M6, **By Round** gives in place of the plot the method's RPS and IR in each of the 12 rounds, beside those of the benchmark M6 Dummy.

## Which Competitions Does Score Forecasting Models Hold?

The M competitions, organised by Spyros Makridakis and his colleagues, compare forecasting methods on many series whose future values the forecasters did not see. M1 [(Makridakis and 8 coauthors, 1982)](#ref-MACFH...1982a) had 1,001 series, and M3 [(Makridakis and Hibon, 2000)](#ref-MH2000a) had 3,003, of yearly, quarterly, monthly and other data. M4 [(Makridakis, Spiliotis and Assimakopoulos, 2020)](#ref-MSA2020a) had 100,000 series of six frequencies. M5 [(Makridakis, Spiliotis and Assimakopoulos, 2022a)](#ref-MSA2022a) had the daily unit sales of products in Walmart stores. The page holds the point forecasts of M5, its Accuracy competition, and not the quantiles of its Uncertainty competition. M6 [(Makridakis, Spiliotis, Hollyman, Petropoulos, Swanson and Gaba, 2025)](#ref-MSHPS...2025a) asked, over twelve rounds of four weeks, for forecasts of how the returns of 100 assets would rank, and for a portfolio of them.

## References

<a id="ref-MACFH...1982a"></a>Makridakis, S., Andersen, A. P., Carbone, R., Fildes, R. A., Hibon, M., Lewandowski, R., Newton, J., Parzen, E. and Winkler, R. L. (1982). The Accuracy of Extrapolation (Time Series) Methods: Results of a Forecasting Competition. *Journal of Forecasting* 1(2), 111–153. [doi:10.1002/for.3980010202](https://doi.org/10.1002/for.3980010202)

<a id="ref-MH2000a"></a>Makridakis, S. and Hibon, M. (2000). The M3-Competition: Results, Conclusions and Implications. *International Journal of Forecasting* 16(4), 451–476. [doi:10.1016/s0169-2070(00)00057-1](https://doi.org/10.1016/s0169-2070(00)00057-1)

<a id="ref-MSA2020a"></a>Makridakis, S., Spiliotis, E. and Assimakopoulos, V. (2020). The M4 Competition: 100,000 Time Series and 61 Forecasting Methods. *International Journal of Forecasting* 36(1), 54–74. [doi:10.1016/j.ijforecast.2019.04.014](https://doi.org/10.1016/j.ijforecast.2019.04.014)

<a id="ref-MSA2022a"></a>Makridakis, S., Spiliotis, E. and Assimakopoulos, V. (2022a). The M5 Competition: Background, Organization, and Implementation. *International Journal of Forecasting* 38(4), 1325–1336. [doi:10.1016/j.ijforecast.2021.07.007](https://doi.org/10.1016/j.ijforecast.2021.07.007)

<a id="ref-MSHPS...2025a"></a>Makridakis, S., Spiliotis, E., Hollyman, R., Petropoulos, F., Swanson, N. and Gaba, A. (2025). The M6 Forecasting Competition: Bridging the Gap Between Forecasting and Investment Decisions. *International Journal of Forecasting* 41(4), 1315–1354. [doi:10.1016/j.ijforecast.2024.11.002](https://doi.org/10.1016/j.ijforecast.2024.11.002)

## See Also

- [Factsheet](factsheet.md) · [The M Competitions](m-competitions.md) · [The Error Measures](error-measures.md) · [Scoring a Method](scoring-method.md) · [Licences and Downloads](licences-downloads.md)
