# Score Models: Factsheet

What a dataset of Score Models gives, the files of a run, and what the page needs, at a glance.

## What Does a Dataset of Score Models Give?

| File | Field | What |
|---|---|---|
| `info.toml` | `name` | The dataset's name, which the step Datasets shows |
| `info.toml` | `format` | `monash`: series and observations, the last values of each series held out from the forecasters |
| `info.toml` | `[[frequencies]]` | For each frequency: `name` (none for series that have none), `series`, `shortest_horizon` and `longest_horizon` |
| `series.parquet` | `series`, `name`, `frequency`, `period`, `horizon`, `domain`, `start` | A row for each series: its number, its name, its frequency, its seasonal period (1 for none), its horizon, its domain and its start |
| `observations.parquet` | `series`, `t`, `value`, `split` | A row for each value: its series, its place in the series from 1, the value, and `train` (seen by the forecasters) or `test` (held out) |

The horizon of a series is the number of its last values held out, and so the number of steps its forecast gives.

## What Files Does a Run of Score Models Write?

| File | Written by | Holds |
|---|---|---|
| `run.toml` | The page | The dataset, the frequency, the sample, the seed and the time the run started; for a dataset you added, its folder; for a run of several datasets, the datasets, each run in the subfolder named by its id |
| `method.jl` | The page | The function `forecast` of the step Your Method |
| `run.jl` | The page | The Julia script that the Julia REPL runs |
| `progress.json` | `run.jl` | The series done, the number in all, the seconds and the series that failed |
| `forecasts.csv` | `run.jl` | The forecasts: series, h (the step ahead, from 1) and value |
| `results.json` | `run.jl` | The scores of the method and of the benchmarks, and the series plotted, or the error that stopped the run |

Each run has its own folder in `~/.pollis/competitions/runs`.

## What Is a Method Scored Beside?

| Series run | Benchmarks beside the method | Measures |
|---|---|---|
| All, all of one frequency, or a sample | The eight benchmarks of PollisCompetitions.Benchmarks (Naive, sNaive, Naive2, SES, Holt, Damped, Theta, Com), computed on the same series; a benchmark is left out when a series is too short for it | sMAPE, MASE and OWA, over the series run, or over those of the frequency chosen |

## What Does Score Models Need?

| Need | What |
|---|---|
| Julia | A Julia REPL in Pollis |
| Packages | PollisCompetitions.jl, from the Pollis registry, which the page's code installs when it is not |
| Data | A dataset built in with PollisCompetitions.jl, in `data/builtin` of the package, or downloaded, in `~/.pollis/competitions`; a dataset you added, in `data/forecasting/` of the Pollis Workspace |
| Threads | Optional: the series are forecast over the threads of the Julia session |

Any package that the function `forecast` loads must be installed in the environment of the Julia REPL, as the page installs only PollisCompetitions.jl.

## See Also

- [Overview](overview.md) · [The Error Measures](error-measures.md) · [Scoring a Method](scoring-method.md) · [Licences and Downloads](licences-downloads.md)
