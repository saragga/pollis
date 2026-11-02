# Factsheet

**Ensemble & Parameter Scanning** repeats an agent-based model across seeds and across parameter values, using `Agents.jl`. Its example is a Schelling segregation model, and any model of your own works if its initializer has the right keywords.

## What the Ensemble and Parameter Scanning Panel Does

| Item | Detail |
|---|---|
| Purpose | Measure run-to-run variation, map outcomes over parameter values, and rank parameters by importance |
| Julia stack | `Agents.jl` for runs and scans, `GlobalSensitivity.jl` for Sobol indices, `Tables.jl` for plain columns, `GLMakie.jl` for figures |
| Tabs | **Ensemble Runs** and **Parameter Scanning** |
| Input shape | No data: the code defines the model, and the inputs set how it is repeated |
| Example outcome | `mean_mood`, the share of residents happy at their last check |

## How the Tabs of the Ensemble and Parameter Scanning Panel Differ

| Feature | **Ensemble Runs** | **Parameter Scanning** |
|---|---|---|
| Function | `ensemblerun!(models, T; adata)` | `paramscan(params, init; n = T, adata)` |
| What varies | The seed, from 1 to **Replications (R)** | Every combination of the listed values |
| Extra result column | `ensemble` | `threshold`, `density`, one per scanned parameter |
| Printed result | Mean and standard deviation at the last step | Number of combinations and range at the last step |
| Source of the spread | Chance | Parameters, with one seed per combination unless `:seed` is listed |

## What the Inputs of the Ensemble and Parameter Scanning Panel Default To

| Input | Default | Role |
|---|---|---|
| **Model initializer** | `initialize_model` | Name of the function that returns a fresh model |
| **Replications (R)** | 20 | Number of seeds in an ensemble, and in **Equilibrium Summary** per combination |
| **Steps (T)** | 50 | Model steps per run |

`initialize_model` has the keywords `threshold`, `density`, `seed` and `side`, with defaults 0.4, 0.7, 1 and 20. The values scanned are written in the code, and `bounds` in **Sobol Sensitivity** too.

## What an Own Model Needs in the Ensemble and Parameter Scanning Panel

**Model initializer** must name a function that accepts `seed` and returns a new model each time it is called. Scans need a keyword for each scanned parameter. Every Next Step reads `mood` from the agents through `adata = [(:mood, mean)]`, so an own model needs that field, or the line has to change. **Sobol Sensitivity** and **OAT vs Factorial** call the keywords `threshold` and `density` by name, and so need editing for other parameters.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
