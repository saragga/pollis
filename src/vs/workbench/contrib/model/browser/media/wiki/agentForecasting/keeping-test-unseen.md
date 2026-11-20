# Agents' Forecasting Competition: Keeping the Test Unseen

What the agents of Agents' Forecasting Competition get, what stays with Pollis, and what the rules can and cannot prevent.

## What Do the Agents of Agents' Forecasting Competition Get?

**Prepare the Series** writes into the study's `data/series.csv` only the values the forecasters saw, the part PollisCompetitions.jl calls `train`. The values their forecasts were scored on, the part called `test`, are never written into the study, and nor are any published forecasts or scores. **Start the Agents** gives each agent a copy of `data/`, so an agent's folder holds the series it must forecast and nothing it is scored on. **Score the Methods** reads the held-out values from PollisCompetitions.jl itself, after every agent has ended, as the organisers of a forecasting competition score the entries after the deadline.

## What Do the Rules of Agents' Forecasting Competition Forbid?

The forecast-independently skill tells each agent to stay in its folder, to read nothing outside it, and never to call the data functions of PollisCompetitions.jl, which return the held-out values. It may use the forecasting functions of `PollisCompetitions.Benchmarks`, such as `theta` and `holt`, which forecast only from the values given to them. It must not look up published results or forecasts of the series. It may build on any method it knows, and say so in `REPORT.md`. Claude Code runs with Julia as the only command it may run; Codex writes only in its folder.

## What Can the Rules of Agents' Forecasting Competition Not Prevent?

The rules are instructions, not walls: Julia can read any file of the computer, so an agent that broke them could find the held-out values. Reading each agent's `method.jl` and `REPORT.md` is the check: a method that forecasts from `y`, `h` and `period` alone cannot use what it never reads. A second limit is what the models already know. Many forecasting datasets are well known and their series are public, so a model may know which methods did well on them, as a researcher entering a new competition knows the published ones. A model is unlikely to remember the held-out values of single series, but the page cannot rule it out.

## How Does Agents' Forecasting Competition Check a Method?

Each agent gets `check.jl`, written by Pollis, which runs its `forecast` on every series of `data/series.csv` the way the scoring will: in a module of its own, over the threads of Julia, checking that each series gives `h` finite numbers. The agent runs it until every series is forecast, so that the scoring meets no failure. To choose between methods, the skill asks the agent to hold back the last `h` values of each series it has and to compare candidates on them, never using anything but `data/series.csv`. A method that still fails on a series at scoring is left unscored, with the first error in **Note**.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Combining the Agents' Forecasts](combining-forecasts.md)
