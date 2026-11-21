# Score Models: Factsheet

What a dataset of Score Models gives, the files of a run, and what the page needs, at a glance.

## What Does a Forecasting Dataset Give?

| File | Field | What |
|---|---|---|
| `info.toml` | `name` | The dataset's name, which the step Datasets shows |
| `info.toml` | `format` | `monash`: series and observations, the last values of each series held out from the forecasters |
| `info.toml` | `[[frequencies]]` | For each frequency: `name` (none for series that have none), `series`, `shortest_horizon` and `longest_horizon` |
| `series.parquet` | `series`, `name`, `frequency`, `period`, `horizon`, `domain`, `start` | A row for each series: its number, its name, its frequency, its seasonal period (1 for none), its horizon, its domain and its start |
| `observations.parquet` | `series`, `t`, `value`, `split` | A row for each value: its series, its place in the series from 1, the value, and `train` (seen by the forecasters) or `test` (held out) |

The horizon of a series is the number of its last values held out, and so the number of steps its forecast gives.

## What Does a Tabular or Survival Dataset Give?

| File | Field | What |
|---|---|---|
| `info.toml` | `name` | The dataset's name, which the step Datasets shows |
| `info.toml` | `format` | `tabular`: a table of rows, and the published splits of its rows into training and test rows |
| `info.toml` | `target` | The column the method predicts; for survival data, the column of times |
| `info.toml` | `event` | For survival data only: the column of the event indicator, 1 for an event and 0 for a censored time |
| `info.toml` | `repeats`, `folds` | The repeats of the cross-validation and the folds of each, so that the splits are their product |
| `info.toml` | `[tables]` | The number of rows of `data` and of `splits` |
| `info.toml` | `[factors]` | For survival data: the columns that are factors, with their levels in order |
| `data.parquet` | Every column | A row for each row of the dataset, numbered from 1 in the order of the file |
| `splits.parquet` | `row`, `repeat`, `fold` | A row for each test row of each split: the row's number, the repeat and the fold; the training rows of a split are the other rows |

The Response Type of a tabular dataset comes from the Dataset Catalog, and decides its measure (see [Tabular and Survival Measures](tabular-survival-measures.md)).

## What Files Does a Run of Score Models Write?

| File | Written by | Holds |
|---|---|---|
| `run.toml` | The page | The dataset, the kind of dataset, the frequency, the sample and the seed for series, the splits to run for tabular and survival datasets, and the time the run started; for a dataset you added, its folder; for a run of several datasets, the datasets, each run in the subfolder named by its id |
| `method.jl` | The page | The function `forecast` or `predict` of the step Your Method |
| `run.jl` | The page | The Julia script that the Julia REPL runs |
| `progress.json` | `run.jl` | The series or splits done, the number in all, the seconds and the series that failed |
| `forecasts.csv` | `run.jl` | For series: the forecasts, with series, h (the step ahead, from 1) and value |
| `scores.csv` | `run.jl` | For tabular and survival datasets: a row for each split, with its repeat, its fold, the method's score on each measure and the seconds it took |
| `published.tsv` | `run.jl` | For tabular and survival datasets: the published runs on the dataset, a line for each model and measure, with the model's id, its name, the measure and the score |
| `results.json` | `run.jl` | The scores of the method and of the benchmarks, and the series plotted; for tabular and survival datasets, the method's means, its scores by split, the published runs and its ranks among them; or the error that stopped the run |

Each run has its own folder in `~/.pollis/competitions/runs`. A run of tabular or survival datasets keeps the scores of each split, not the predictions.

## What Is a Method Scored Beside?

| Kind of dataset | Run | Beside the method | Measures |
|---|---|---|---|
| Series | All, all of one frequency, or a sample | The eight benchmarks of PollisCompetitions.Benchmarks (Naive, sNaive, Naive2, SES, Holt, Damped, Theta, Com), computed on the same series; a benchmark is left out when a series is too short for it | sMAPE, MASE and OWA, over the series run, or over those of the frequency chosen |
| Tabular | All the published splits, or the first repeat | The published runs of the dataset's benchmark, means over all its splits | rmse (Continuous, Count), roc_auc (Binary) or log_loss (Multiclass), a mean over the splits run |
| Survival | All the published splits, or the first repeat | The published runs of the dataset's benchmark, means over all its splits | harrell_c, uno_c, isbs, isbs_erv, isll, isll_erv, dcalib and alpha_calib, means over the splits run |

## What Does Score Models Need?

| Need | What |
|---|---|
| Julia | A Julia REPL in Pollis |
| Packages | PollisCompetitions.jl, from the Pollis registry, which the page's code installs when it is not |
| Data | A dataset built in with PollisCompetitions.jl, in `data/builtin` of the package, or downloaded, in `~/.pollis/competitions`; a dataset you added, in `data/forecasting/` of the Pollis Workspace |
| Threads | Optional: the series are forecast over the threads of the Julia session; the splits are run one at a time |

Any package that the function `forecast` or `predict` loads must be installed in the environment of the Julia REPL, as the page installs only PollisCompetitions.jl.

## See Also

- [Overview](overview.md) · [The Error Measures](error-measures.md) · [Tabular and Survival Measures](tabular-survival-measures.md) · [Scoring a Method](scoring-method.md) · [Licences and Downloads](licences-downloads.md)
