# Factsheet

**Bayesian Optimisation** minimises a user's function over a box with `BayesianOptimization.jl`, using a Gaussian process surrogate and one of four acquisition functions.

## What the Bayesian Optimisation Panel Does

| Item | Detail |
|---|---|
| Purpose | Find a good minimum of an expensive function in few evaluations |
| Julia stack | `BayesianOptimization.jl` for the loop, `GaussianProcesses.jl` for the surrogate, `Optim.jl` for refinement and comparison, `Plots.jl` for figures |
| Tabs | **Expected Improvement**, **Probability of Improvement**, **Upper Confidence Bound**, **Thompson Sampling** |
| Sense | Minimisation; the surrogate models -f internally |
| Printed result | `observed_optimum`, `observed_optimizer` |
| Other results | `model_optimum`, `model_optimizer`, through **Run BO** |

## What the Inputs of the Bayesian Optimisation Panel Default To

| Input | Default | Role |
|---|---|---|
| **Dimension (n)** | 2 | Number of decision variables |
| **Objective Body** | `sum(x .^ 4 .- 16 .* x .^ 2 .+ 5 .* x) / 2` | The function, with `x` a `Vector{Float64}` |
| **Lower Bound** | -5.0 | Applied to every variable |
| **Upper Bound** | 5.0 | Applied to every variable |
| **Evaluations** | 50 | Maximum number of evaluations of the objective |

No seed input exists, so successive runs differ. **Sample Efficiency**, **Acquisition Comparison** and **Budget Sensitivity** set seeds 1 to 10 in their own code.

## Which Surrogate Settings Are Fixed in the Code

| Setting | Value |
|---|---|
| Mean | Constant at 0 |
| Kernel | `SEArd`, one length scale per dimension |
| Starting log length scales | 0, so length scale 1 |
| Bounds on log length scale | -1 to 4 |
| Bounds on log signal sd | 0 to 10 |
| Starting log noise | -2 |
| Bounds on log noise | -4 to 3 |
| Refit | Maximum a posteriori, every 10 evaluations, up to 40 steps |
| UCB beta | 2.0, constant |

## What Each Next Step in the Panel Costs

| Action | Evaluations of the objective |
|---|---|
| Most actions | **Evaluations**, for one run |
| **Run Consistency**, **Sample Efficiency** | 10 runs, plus 10 random searches for the latter |
| **Multi-Start BO** | 5 runs |
| **Acquisition Comparison** | 40 runs |
| **Budget Sensitivity** | 10 runs at each of 10, 20, 50, 100 and 200 |
| **Local Refinement**, **vs Gradient-Based** | One run, plus the other method's calls |

For a slow objective, these costs should decide which actions are worth running.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
