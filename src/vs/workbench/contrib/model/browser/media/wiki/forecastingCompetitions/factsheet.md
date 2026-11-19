# Score Models: Factsheet

The competitions of the page Score Models, the files of a run, and what the page needs, at a glance.

## Which Series and Horizons Do the Competitions Have?

| Competition | Series | Frequencies (horizon) | Measures | Entries on the page |
|---|---|---|---|---|
| M1 (1982) | 1,001 | Yearly (6), Quarterly (8), Monthly (18) | sMAPE, MASE, OWA | None: scored beside Naive2 |
| M3 (2000) | 3,003 | Yearly (6), Quarterly (8), Monthly (18), Other (8) | sMAPE, MASE, OWA | None: scored beside Naive2 |
| M4 (2018) | 100,000 | Yearly (6), Quarterly (8), Monthly (18), Weekly (13), Daily (14), Hourly (48) | sMAPE, MASE, OWA | 61 entries |
| M5 Accuracy (2020) | 30,490 | Daily (28) | WRMSSE | 74 entries: 24 benchmarks and the top 50 |
| M6 (2022) | 100 assets | 12 rounds of 4 weeks | RPS, IR, OR | 251 teams, M6 Dummy the benchmark |

The horizon is the number of steps a forecast of a series of that frequency gives. M5's 30,490 series add up into 42,840 series over 12 levels, on which the WRMSSE is computed. M6 has assets in place of series: at each round, a method gives the probabilities and the weight of each of its 100 assets.

## What Files Does a Run of Score Models Write?

| File | Written by | Holds |
|---|---|---|
| `run.toml` | The page | The competition, the frequency, the sample, the seed and the time the run started; for a dataset you added, its folder; for a run of several datasets, the datasets, each run in the subfolder named by its id |
| `method.jl` | The page | The function `forecast`, or `decide` for M6, of the step Your Method |
| `run.jl` | The page | The Julia script that the Julia REPL runs |
| `progress.json` | `run.jl` | The series done, or the rounds for M6, the number in all, the seconds and the series that failed |
| `forecasts.csv` | `run.jl` | The forecasts: series, h (the step ahead, from 1) and value; for M6, the submissions: evaluation (the round), symbol, decision and rank1 to rank5 |
| `results.json` | `run.jl` | The scores, the benchmarks, the place among the entries and the series plotted, or the error that stopped the run |

Each run has its own folder in `~/.pollis/competitions/runs`.

## When Is a Run of Score Models Ranked?

| Competition | Series run | Benchmarks beside the method | Place among the entries |
|---|---|---|---|
| M4 | All, or all of one frequency | Published scores of the benchmark entries | Yes, by OWA |
| M4 | A sample | The eight benchmarks of M4, computed on the same series by PollisCompetitions.jl | No |
| M5 Accuracy | All (always) | Published scores of the 24 benchmarks | Yes, by WRMSSE |
| M1, M3 | All, one frequency or a sample | Naive2, computed on the same series | No |
| M6 | All 12 rounds (always) | Published scores of M6 Dummy | Yes, by OR, recomputed with the method among the teams |
| A dataset you added | All or a sample | Naive2, computed on the same series | No |

## What Does Score Models Need?

| Need | What |
|---|---|
| Julia | A Julia REPL in Pollis |
| Packages | PollisCompetitions.jl, from the Pollis registry, which the page's code installs when it is not |
| Data | The competition, downloaded with **Download** in the step Datasets, in `~/.pollis/competitions`; a dataset you added, in `data/forecasting/` of the Pollis Workspace |
| Threads | Optional: the series are forecast over the threads of the Julia session |

Any package that the function `forecast` loads must be installed in the environment of the Julia REPL, as the page installs only PollisCompetitions.jl.

## See Also

- [Overview](overview.md) · [The M Competitions](m-competitions.md) · [The Error Measures](error-measures.md) · [Scoring a Method](scoring-method.md) · [Licences and Downloads](licences-downloads.md)
