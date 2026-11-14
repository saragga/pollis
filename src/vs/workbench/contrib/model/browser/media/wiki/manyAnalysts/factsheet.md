# Many Analysts: Factsheet

The steps, inputs, agents, files, figures and requirements of Many Analysts at a glance.

## Steps of Many Analysts

| Step | What it sets or does | Button |
|---|---|---|
| **Question and Data** | The study's name, the data, the question and the estimate to report; **Open a Study** reopens an earlier one, **New Study** starts another | — |
| **Analysts** | How many analysts, and the agent and model of each | — |
| **Runs** | Writes the study's folder and starts every analyst at once, each in a terminal of its own; shows each one's status and time | **Start the Analysts** |
| **Results** | Runs each `analysis.jl` again in the Julia REPL, collects every estimate and choice into `results.json`, and shows the spread, the plot and the choices | **Check and Collect** |

## Inputs of Many Analysts

| Input | Step | Default | Meaning |
|---|---|---|---|
| **Study** | Question and Data | `nsw-training`, then `nsw-training-2`... | The name of the study's folder: letters, digits, hyphens and underscores |
| **Data** | Question and Data | LaLonde's Job Training | The datasets `nsw`, `cps1` to `cps3` and `psid1` to `psid3` of PollisDatasets, or **A File of Your Own** |
| **File** | Question and Data | — | Your data: CSV, TSV, Parquet, Arrow, JSON, Excel or DuckDB; **Choose...** picks it |
| **What the Columns Are** | Question and Data | — | A description of your file's columns, which every analyst reads |
| **Question** | Question and Data | The effect of the job training programme on 1978 earnings | The research question, in plain words |
| **Estimate to Report** | Question and Data | The effect on the treated, in 1978 dollars, with its standard error and 95% interval | What every analyst must report, and its unit |
| **How Many** | Analysts | 5 | The number of analysts, from 3 to 12 |
| **Analyst 1** to **Analyst N** | Analysts | The cells in turn | The agent and model of each analyst |

## Agents That Run Unattended in Many Analysts

| Agent | Command line of an analyst | Its limits |
|---|---|---|
| Claude Code | `claude -p --permission-mode acceptEdits --allowedTools "Bash(julia *)"`, then the model and the first message | Edits files in its folder without asking; runs no command but `julia` |
| Codex | `codex exec -s workspace-write`, then the model and the first message | Writes only in its folder |
| OpenCode | `opencode run`, then the model and the first message | OpenCode's own permissions |

The models are those of Model Tasks and Routing that each agent can run: the cloud models with their arguments, and the local chat models that can call tools. An agent of your own is not offered.

## Files of a Many Analysts Study

| File | Written by | What it holds |
|---|---|---|
| `study.toml` | Start the Analysts | The question, the estimate, the data, the date and each analyst's agent and model |
| `data/` | Start the Analysts, for a file of your own | The file and `README.md`, its description |
| `analyst-1/` to `analyst-N/` | Start the Analysts, then each agent | One folder for each analyst |
| `results.json` | Check and Collect | Each analyst's reported estimate, its rerun and its choices |

The study's folder is `orchestration/many-analysts/<study>` of the open Pollis Workspace, else `~/.pollis/orchestration/many-analysts/<study>`.

## Files of a Many Analysts Analyst

| File | Written by | What it holds |
|---|---|---|
| `SKILL.md` | Start the Analysts | The analyse-independently skill of Pollis Agents |
| `TASK.md` | Start the Analysts | The question, the estimate to report, the data and the Julia command |
| `data/` | Start the Analysts, for a file of your own | A copy of the study's data |
| `analysis.jl` | The agent | The whole analysis, from the data to `estimate.toml` |
| `estimate.toml` | `analysis.jl` | `estimate`, `std_error`, `ci_low`, `ci_high` and `n` |
| `choices.toml` | The agent | `sample`, `outcome`, `controls`, `estimator` and `standard_errors`, each in a few words |
| `REPORT.md` | The agent | The reasons for each choice, in half a page |
| `rerun.log` | Check and Collect | The output of the rerun of `analysis.jl` |

## Statuses of Many Analysts Analysts

| Status | Meaning |
|---|---|
| **Waiting** | Not started yet |
| **Running** | Its agent is at work in its terminal |
| **Done** | `estimate.toml` and `choices.toml` are in its folder |
| **Ended without results** | Its agent ended, or its terminal was closed, before both files were written; the exit code shows when there is one |

## Figures of Many Analysts Results

| Figure | Meaning |
|---|---|
| **Median Estimate** | The middle of the analysts' estimates |
| **Interquartile Range** | From the first to the third quartile of the estimates |
| **Range** | From the smallest estimate to the largest |
| **Nonstandard Error** | The standard deviation of the estimates across the analysts |
| **Median Standard Error** | The middle of the standard errors the analysts reported |
| **Reproduced** | Yes when the rerun of `analysis.jl` gives the reported numbers; No with the rerun's estimate; Failed when the rerun ended with an error; Not checked before Check and Collect |

## Requirements of Many Analysts

| Need | For | Where to get it |
|---|---|---|
| Claude Code, Codex or OpenCode | Runs | Compose > Coding Agents |
| The analyse-independently skill | Runs | The Pollis Agents plugin, downloaded at each start |
| The Julia REPL | Check and Collect | Started by Pollis when the code is sent |
| The packages each analysis uses | Check and Collect | Installed in your Julia environment when the analyst installs them |

## See Also

- [Overview](overview.md) · [Nonstandard Errors](nonstandard-errors.md) · [Choosing the Analysts](choosing-analysts.md) · [Writing the Question](writing-question.md)
