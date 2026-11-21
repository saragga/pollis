# Score Models: Overview

Score Models runs a method of your own on challenge datasets and scores it as each dataset's competition or benchmark scored its models. On forecasting datasets, the method forecasts each series, and its forecasts are scored by sMAPE, MASE and OWA, beside eight statistical benchmarks computed on the same series. On tabular and survival datasets, the method is fitted on the training rows of each published split and predicts its test rows, and its predictions are scored by the measures of the dataset's benchmark, beside the published runs of that benchmark's models. The page is in Compose > Prediction Challenges > Score Models, and its Julia code comes from the package PollisCompetitions.jl.

## What Are the Four Steps of Score Models?

**Datasets** lists the datasets ticked in the column Active of Manage Challenge Datasets on which Score Models can score models, those whose column Model Scoring says Ready. With none of them active, the step says so, and **Open Manage Challenge Datasets** opens that page to tick them. When the active datasets are of more than one kind, **Kind of Dataset** chooses among **Series**, **Tabular** and **Survival**, as a method differs by kind and a run holds datasets of one kind. For series, the step gives each dataset's number of series and the horizon of each frequency, and sets the **Frequency** to run, when one dataset is listed and it has several, and the **Series to Run**: **All**, or **A Sample of** a number of series drawn with a **Seed**. For tabular and survival datasets, it gives each dataset's rows, Response Type, measure and splits, and sets the **Splits to Run**: **All the Published Splits**, or **The First Repeat**. **Your Method** holds the Julia function of the kind chosen. **Run** starts the method on every series or split chosen with **Run the Method**, shows its progress, and reopens an earlier run from **Earlier runs...**. **Scores** shows the method's scores beside the benchmarks or the published runs.

## Which Datasets Can Score Models Score Models On?

A dataset of PollisCompetitions.jl is Ready when its data are on this computer, built in with the package or downloaded into `~/.pollis/competitions`, and the `info.toml` of its folder describes them. The format `monash` is that of the Monash Time Series Forecasting Archive [(Godahewa, Bergmeir, Webb, Hyndman and Montero-Manso, 2021)](#ref-GBWHM2021a): a table of series, with the frequency, seasonal period and horizon of each, and a table of observations, in which the last values of each series, as many as its horizon, are held out from the forecasters. The `[[frequencies]]` of `info.toml` give, for each frequency, its number of series and the shortest and the longest of their horizons, which the step Datasets shows. The format `tabular` is a table of rows, `data.parquet`, and its published splits, `splits.parquet`, which give the test rows of each repeat and fold; `info.toml` names the target, and for survival data the event indicator, and gives the number of repeats and folds. A tabular dataset is Ready when its Response Type, in the Dataset Catalog, has a measure; a survival dataset is Ready when `info.toml` names its event. The same rule holds for every dataset: no dataset is treated apart from the others.

## How Are the Datasets You Added Scored?

A dataset added with Add a Dataset in Manage Challenge Datasets is a forecasting dataset, listed in the step Datasets after those of PollisCompetitions.jl, and is always on this computer, in `data/forecasting/` of the Pollis Workspace. It is scored as every other forecasting dataset is: sMAPE, MASE and OWA, beside the benchmarks computed on the same series. PollisCompetitions.jl reads it from its folder, which the run's `run.toml` records as `folder`, in place of an id.

## How Does Score Models Run a Method?

**Run the Method** writes a folder for the run in `~/.pollis/competitions/runs`, named after the dataset, the frequency and the time, and sends one line to the Julia REPL that runs the folder's `run.jl`. On a forecasting dataset, that script reads the values the forecasters saw of each series chosen, calls the function `forecast` of `method.jl` on each series on its own, over the threads of the Julia session, and writes `progress.json` as it goes, which the page reads to show how many series are done. When every series is forecast, the script writes the forecasts to `forecasts.csv`, scores them and the benchmarks with PollisCompetitions.jl, and writes `results.json`, from which the page draws the step Scores.

On a tabular or survival dataset, the script calls the function `predict` of `method.jl` on each split chosen in turn, with the training rows and the test rows, checks its predictions, scores them with PollisCompetitions.jl, and writes `progress.json` after each split. It then writes the score of each split to `scores.csv`, reads the published runs on the dataset into `published.tsv`, and writes `results.json`, with the method's means over the splits and its rank among the published runs on each measure. A split on which `predict` fails stops the run, and the step Scores shows the split and the error.

## How Does Score Models Run a Method on Several Datasets?

With several datasets listed in the step Datasets, **Run the Method** runs the method on each dataset in turn, with the same choices. The run's folder is named `datasets-` and the time; its `run.toml` names the datasets, and each dataset is a run of its own in the subfolder named by its id. **Scores** opens with **Datasets of This Run**, a row for each dataset with its number of series or splits, its scores, and whether it is waiting, running, done or stopped; for tabular and survival datasets, the row also gives the method's rank among the published runs on the dataset's first measure. Selecting a row shows that dataset's scores and Next Steps below the table.

For tabular and survival datasets, **Across the Datasets** sums up the run on each measure, over the datasets of the run scored by it. It takes the published models with a run on every one of those datasets, ranks the method among them on each dataset, and gives the method's mean rank, its place among those models by mean rank, and the model with the best mean rank.

## What Does the Step Scores Show?

On a forecasting dataset, the table **Scores** gives the method's sMAPE, MASE and OWA over the series of the run, or of the frequency chosen, and below them those of the benchmarks, computed with PollisCompetitions.jl on the same series. A benchmark is left out when a series of the run is too short for it. **A Series** plots the first series of the run: its last values, the values it was scored on, and the method's forecast.

On a tabular or survival dataset, the table **Scores** gives, for each measure, the method's mean over the splits, **Your Rank** among the published runs on the dataset, and the best, the median and the worst of those runs. **Published Runs** lists them with the method among them, sorted by the first measure, best first, and **Scores by Split** gives the method's score on each split and their mean. A run on the first repeat says that its comparison is indicative, as the published scores are means over all the splits.

## References

<a id="ref-GBWHM2021a"></a>Godahewa, R., Bergmeir, C., Webb, G. I., Hyndman, R. J. and Montero-Manso, P. (2021). Monash Time Series Forecasting Archive. arXiv. [doi:10.48550/arXiv.2105.06643](https://doi.org/10.48550/arXiv.2105.06643)

## See Also

- [Factsheet](factsheet.md) · [The Error Measures](error-measures.md) · [Tabular and Survival Measures](tabular-survival-measures.md) · [Scoring a Method](scoring-method.md) · [Licences and Downloads](licences-downloads.md)
