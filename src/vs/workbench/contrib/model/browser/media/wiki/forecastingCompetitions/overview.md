# Score Models: Overview

Score Models runs a forecasting method of your own on the series of forecasting datasets and scores its forecasts by sMAPE, MASE and OWA, beside eight statistical benchmarks computed on the same series. The page is in Compose > Prediction Challenges > Score Models, and its Julia code comes from the package PollisCompetitions.jl.

## What Are the Four Steps of Score Models?

**Datasets** lists the datasets ticked in the column Active of Manage Challenge Datasets on which Score Models can score models, those whose column Model Scoring says Ready, with their number of series and the horizon of each frequency. With none of them active, the step says so, and **Open Manage Challenge Datasets** opens that page to tick them. The step also sets the **Frequency** to run, when one dataset is listed and it has several, and the **Series to Run**: **All**, or **A Sample of** a number of series drawn with a **Seed**. **Your Method** holds the Julia function that forecasts a series. **Run** starts the method on every series chosen with **Run the Method**, shows its progress, and reopens an earlier run from **Earlier runs...**. **Scores** shows the method's scores beside the benchmarks, and a plot of one series with its forecast.

## Which Datasets Can Score Models Score Models On?

A dataset of PollisCompetitions.jl is Ready when its data are on this computer, built in with the package or downloaded into `~/.pollis/competitions`, and the `info.toml` of its folder gives the format `monash` and its frequencies. The format `monash` is that of the Monash Time Series Forecasting Archive [(Godahewa, Bergmeir, Webb, Hyndman and Montero-Manso, 2021)](#ref-GBWHM2021a): a table of series, with the frequency, seasonal period and horizon of each, and a table of observations, in which the last values of each series, as many as its horizon, are held out from the forecasters. The `[[frequencies]]` of `info.toml` give, for each frequency, its number of series and the shortest and the longest of their horizons, which the step Datasets shows. The same rule holds for every dataset: no dataset is treated apart from the others.

## How Are the Datasets You Added Scored?

A dataset added with Add a Dataset in Manage Challenge Datasets is listed in the step Datasets after those of PollisCompetitions.jl, and is always on this computer, in `data/forecasting/` of the Pollis Workspace. It is scored as every other dataset is: sMAPE, MASE and OWA, beside the benchmarks computed on the same series. PollisCompetitions.jl reads it from its folder, which the run's `run.toml` records as `folder`, in place of an id.

## How Does Score Models Run a Method?

**Run the Method** writes a folder for the run in `~/.pollis/competitions/runs`, named after the dataset, the frequency and the time, and sends one line to the Julia REPL that runs the folder's `run.jl`. That script reads the values the forecasters saw of each series chosen, calls the function `forecast` of `method.jl` on each series on its own, over the threads of the Julia session, and writes `progress.json` as it goes, which the page reads to show how many series are done. When every series is forecast, the script writes the forecasts to `forecasts.csv`, scores them and the benchmarks with PollisCompetitions.jl, and writes `results.json`, from which the page draws the step Scores.

## How Does Score Models Run a Method on Several Datasets?

With several datasets listed in the step Datasets, **Run the Method** runs the method on each dataset in turn, with the same Series to Run and Seed. The run's folder is named `datasets-` and the time; its `run.toml` names the datasets, and each dataset is a run of its own in the subfolder named by its id. **Scores** opens with **Datasets of This Run**, a row for each dataset with its number of series, its scores, and whether it is waiting, running, done or stopped. Selecting a row shows that dataset's scores, plotted series and Next Steps below the table.

## What Does the Step Scores Show?

The table **Scores** gives the method's sMAPE, MASE and OWA over the series of the run, or of the frequency chosen, and below them those of the benchmarks, computed with PollisCompetitions.jl on the same series. A benchmark is left out when a series of the run is too short for it. **A Series** plots the first series of the run: its last values, the values it was scored on, and the method's forecast.

## References

<a id="ref-GBWHM2021a"></a>Godahewa, R., Bergmeir, C., Webb, G. I., Hyndman, R. J. and Montero-Manso, P. (2021). Monash Time Series Forecasting Archive. arXiv. [doi:10.48550/arXiv.2105.06643](https://doi.org/10.48550/arXiv.2105.06643)

## See Also

- [Factsheet](factsheet.md) · [The Error Measures](error-measures.md) · [Scoring a Method](scoring-method.md) · [Licences and Downloads](licences-downloads.md)
