# Agents' Forecasting Competition: Factsheet

The steps, inputs, files, scores and requirements of Agents' Forecasting Competition at a glance.

## Steps of Agents' Forecasting Competition

| Step | What it sets or does | Button |
|---|---|---|
| **Dataset** | The study's name, the dataset, the frequency, the number of series and the seed; **Open a Study** reopens an earlier one, **New Study** starts another | **Prepare the Series** |
| **Agents** | How many agents, and the agent and model of each | **Start the Agents** |
| **Runs** | Each agent's status and time, and links to its method, its report and its terminal | — |
| **Scores** | Runs every method and scores it, with the two combinations and the benchmarks | **Score the Methods** |

The blue button is always the next one to press.

## Inputs of Agents' Forecasting Competition

| Input | Step | Default | Meaning |
|---|---|---|---|
| **Study** | Dataset | The first dataset and its first frequency, such as `nn3-monthly`, then `nn3-monthly-2`... | The name of the study's folder: letters, digits, hyphens and underscores |
| **Dataset** | Dataset | The first offered | A forecasting dataset of PollisCompetitions.jl whose data are on this computer, with a frequency that has a name |
| **Frequency** | Dataset | Monthly, else the first | One frequency of the dataset, which sets the horizon |
| **Series** | Dataset | 300 | How many series, drawn at random; 0 for all the series of the frequency |
| **Seed** | Dataset | 1 | The seed of the draw: the same seed gives the same series |
| **How Many** | Agents | 4 | The number of agents, from 2 to 8 |
| **Agent 1** to **Agent N** | Agents | The cells in turn | The agent and model of each |

## Files of a Forecasting Competition Study

| File | Written by | What it holds |
|---|---|---|
| `study.toml` | Prepare the Series; Start the Agents | The dataset, frequency, sample and seed, the date, and each agent's agent and model |
| `prepared.toml` | Prepare the Series | The number of series, the horizon and the series' numbers in the dataset |
| `data/series.csv` | Prepare the Series | The values the forecasters saw: `series`, `period`, `horizon`, `t` and `value` |
| `data/README.md` | Start the Agents | What the columns of `series.csv` are |
| `agent-1/` to `agent-N/` | Start the Agents, then each agent | One folder for each agent |
| `score.jl` | Score the Methods | The Julia that runs and scores every method |
| `results.json` | `score.jl` | Each method's scores, the combinations and the benchmarks |

The study's folder is `orchestration/forecasting-competition/<study>` of the open Pollis Workspace, else `~/.pollis/orchestration/forecasting-competition/<study>`.

## Files of a Forecasting Competition Agent

| File | Written by | What it holds |
|---|---|---|
| `SKILL.md` | Start the Agents | The forecast-independently skill of Pollis Agents |
| `TASK.md` | Start the Agents | The dataset, the frequency, the number of series, the horizon and the Julia command |
| `data/` | Start the Agents | A copy of the study's `series.csv` and `README.md` |
| `check.jl` | Start the Agents | Runs the method on every series, as the scoring does, and prints the series it fails on and the time |
| `method.jl` | The agent | The function `forecast(y, h, period)`, which returns `h` forecasts of the series `y`, whose seasonal period is `period` |
| `REPORT.md` | The agent | The method, the reasons for it, how it was checked, and the time `check.jl` took |

An agent is **Done** once `method.jl` is in its folder, and **Ended without a method** when its run ends before.

## Columns of the Agents' Forecasting Competition Scores

| Column | Meaning |
|---|---|
| **Rank** | The place by OWA among the methods, the combinations and the benchmarks scored |
| **Method** | An agent with its agent and model, **Mean of the Agents**, **Median of the Agents**, or a benchmark |
| **sMAPE**, **MASE**, **OWA** | The error measures, lower better, over the series of the study |
| **Note** | How many agents a combination combines, a benchmark, or why a method was not scored |

## Requirements of Agents' Forecasting Competition

| Need | For | Where to get it |
|---|---|---|
| Claude Code, Codex or OpenCode | Start the Agents | Compose > Coding Agents |
| The forecast-independently skill | Start the Agents | The Pollis Agents plugin, downloaded at each start |
| PollisCompetitions.jl and the dataset's data | Prepare the Series and Score the Methods | PollisCompetitions.jl installed by Prepare the Series; the data built in with it or downloaded, on this computer |
| The packages each method uses | Score the Methods | Installed in your Julia environment when the agent installs them |

## See Also

- [Overview](overview.md) · [Keeping the Test Unseen](keeping-test-unseen.md) · [Combining the Agents' Forecasts](combining-forecasts.md) · [The Error Measures](../forecastingCompetitions/error-measures.md)
