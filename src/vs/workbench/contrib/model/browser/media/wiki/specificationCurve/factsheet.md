# Specification Curve: Factsheet

The steps, inputs, agents, files, figures and requirements of Specification Curve at a glance.

## Steps of Specification Curve

| Step | What it sets or does | Button |
|---|---|---|
| **Question and Data** | The study's name, the data, the question and the estimate; **Open a Study** reopens an earlier one, **New Study** starts another | — |
| **The Choices** | Where the choices come from, how many agents propose them and the agent and model of each; then the decisions and options, each with a tick box and the links of **Change** | **Ask the Agents**, or **Take the Study's Choices** |
| **The Code** | The agent and model that write `specification.jl`; its status, and the result of its check | **Write the Code** |
| **The Curve** | Runs every specification in Julia and draws the figures, the curve with its grid of choices, and Which Choices Matter | **Run Every Specification** |
| **Inference Under the Null** | The number of resamples and the seed; runs the joint test and shows its table | **Run the Test** |

The blue button is always the next one to press.

## Inputs of Specification Curve

| Input | Step | Default | Meaning |
|---|---|---|---|
| **Study** | Question and Data | `nsw-training`, then `nsw-training-2`... | The name of the study's folder: letters, digits, hyphens and underscores |
| **Data** | Question and Data | LaLonde's Job Training | The datasets `nsw`, `cps1` to `cps3` and `psid1` to `psid3` of PollisDatasets, or **A File of Your Own** |
| **Question** and **Estimate to Report** | Question and Data | The example's | What every specification answers, and the unit of its estimate |
| **Choices From** | The Choices | Coding Agents | **Coding Agents**, or **A Many Analysts Study** and the study to take them from |
| **How Many** | The Choices | 3 | The number of agents that propose, from 2 to 4 |
| **Agent 1** to **Agent N** | The Choices | The cells in turn | The agent and model of each proposer |
| **Keep** | The Choices | Ticked | Whether an option enters the specifications; at most 2,000 specifications |
| **Same As...**, **Rename**, **Drop** | The Choices | No change | Merge an option or a decision into another, change a label, or leave a decision out; **Undo Last Change** takes back the latest |
| **Agent and Model** | The Code | A strong model, when there is one | The coder's agent and model |
| **Resamples** | Inference Under the Null | 500 | 200, 500 or 1,000 resamples of the data |
| **Seed** | Inference Under the Null | 1 | The seed of the resamples: the same seed gives the same test |

## Files of a Specification Curve Study

| File | Written by | What it holds |
|---|---|---|
| `study.toml` | Ask the Agents or Take the Study's Choices; Write the Code | The question, the estimate, the data, where the choices come from, and each agent's agent and model |
| `data/` | The same, for a file of your own | The file and `README.md`, its description |
| `proposer-1/` to `proposer-N/` | Ask the Agents, then each proposer | `SKILL.md`, `TASK.md` and the proposer's `decisions.toml` |
| `proposals.toml` | Take the Study's Choices | The decisions taken from a Many Analysts study, each option with the analysts that chose it |
| `coder/` | Write the Code, then the coder | `SKILL.md`, `TASK.md`, `choices.toml` (the options kept), `curve.jl` (written by Pollis), `specification.jl` and `check.json` |
| `curve.json` | Run Every Specification | Each specification's options, estimate, standard error and number of rows, or its error |
| `inference.json` | Run the Test | The three statistics, observed and under the null, their p-values, and the resamples used |

The study's folder is `orchestration/specification-curve/<study>` of the open Pollis Workspace, else `~/.pollis/orchestration/specification-curve/<study>`.

## Functions of specification.jl

| Function | Returns | Rules |
|---|---|---|
| `specification_data(spec)` | A NamedTuple of columns of equal length, with `y` the outcome and `d` the variable whose effect is estimated | `spec` is a `Dict{String,String}` from each decision's id to the option's id |
| `estimate(rows, spec)` | `(estimate, std_error)` | `rows` has the columns `specification_data` returned, or a resample of them; the standard error is finite and positive |

Both functions are called from several threads at once, so neither may change a global variable.

## Figures of the Specification Curve

| Figure | Meaning |
|---|---|
| **Specifications** | The number that ran |
| **Median Estimate** | The middle of the estimates |
| **Interquartile Range (Q1 to Q3)** | From the first to the third quartile of the estimates |
| **Range** | From the smallest estimate to the largest |
| **Same Sign as the Median** | The share of estimates with the sign of the median |
| **Significant, Same Sign** | The share whose 95% confidence interval leaves out zero, on the side of the median |
| **Significant, Opposite Sign** | The share whose 95% confidence interval leaves out zero, on the other side |

## Requirements of Specification Curve

| Need | For | Where to get it |
|---|---|---|
| Claude Code, Codex or OpenCode | The Choices from agents, and The Code | Compose > Coding Agents |
| The propose-specifications and write-specification-code skills | The same | The Pollis Agents plugin, downloaded at each start |
| The Julia REPL | The Curve and Inference Under the Null | Started by Pollis when the code is sent |
| The packages `specification.jl` uses | The same | Installed in your Julia environment when the coder installs them |

## See Also

- [Overview](overview.md) · [Choosing the Specifications](choosing-specifications.md) · [Reading the Curve](reading-curve.md) · [Inference Under the Null](inference-null.md)
