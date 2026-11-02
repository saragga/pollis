# Overview

A single run of a stochastic agent-based model is one draw from many possible histories, and a study needs more than that draw. The panel repeats runs across seeds and across parameter values, and then ranks the parameters by how much they matter.

## Why an Agent-Based Model Needs More Than One Run

Random starting states and random choices make every run of a stochastic model different. A parameter's effect can then be hidden by chance, or a chance result can pass for an effect. A study has to separate the two by measuring the spread that chance alone produces, and comparing any change against it. Agent-based results are outcomes of a simulation, so no formula gives a standard error, and repetition is how one is obtained. [Wilensky and Rand (2015)](#ref-WR2015a) treat this repetition as a normal part of working with such models.

## What the Ensemble Runs Tab Does

**Ensemble Runs** builds **Replications (R)** copies of one model with seeds 1 to R and passes them to `ensemblerun!`, which runs each for **Steps (T)** and collects the same quantity from all. The result has one row per run and step. The tab prints the mean and the standard deviation of the outcome across runs at the last step. All replications share every parameter, so their differences come from chance alone. [Datseris, Vahdati and DuBois (2022)](#ref-DVD2022a) describe `Agents.jl`, the package that supplies `ensemblerun!` and `paramscan`.

## What the Parameter Scanning Tab Does

**Parameter Scanning** lists values for each parameter in a `Dict` and passes it to `paramscan`, which runs the model at every combination. The result has one row per combination and step, with a column for each scanned parameter. The tab prints the number of combinations and the range of the outcome at the last step. Each parameter name must match a keyword of the function named in **Model initializer**. A `:seed` list in the same `Dict` crosses seeds with the other parameters and gives replication at each point.

## How Sensitivity Analysis Fits with Ensembles and Scans

Ensembles measure chance, scans map the response, and sensitivity analysis ranks the inputs. **Sobol Sensitivity** draws parameter values across given bounds, averages several seeds at each draw, and splits the variance of the output between the inputs and their interactions. [Sobol (2001)](#ref-Sob2001a) gives the indices. **OAT vs Factorial** is a simpler check of whether parameters interact at all. A ranking is the answer to a narrow question, namely which input moves the output most within those bounds, and it does not say that the model is right.

## A Common Workflow for Replicated Agent-Based Experiments

1. Run **Ensemble Runs**, and read the mean and the spread.
2. Use **Burn-in Detection** and **Ensemble Trajectories** to set **Steps (T)**.
3. Use **Variance Across Runs** and **Larger Ensemble** to set **Replications (R)**.
4. Run **Parameter Scanning**, then **Parameter Heatmap** and **Equilibrium Summary**.
5. Check for interaction with **OAT vs Factorial**.
6. Rank the inputs with **Sobol Sensitivity**, as the most expensive step.

## References

<a id="ref-DVD2022a"></a>Datseris, G., Vahdati, A. R. and DuBois, T. C. (2022). Agents.jl: a performant and feature-full agent based modelling software of minimal code complexity. *SIMULATION* 100(10), 1019–1031. [doi:10.1177/00375497211068820](https://doi.org/10.1177/00375497211068820)

<a id="ref-Sob2001a"></a>Sobol, I. M. (2001). Global sensitivity indices for nonlinear mathematical models and their Monte Carlo estimates. *Mathematics and Computers in Simulation* 55(1–3), 271–280. [doi:10.1016/s0378-4754(00)00270-6](https://doi.org/10.1016/s0378-4754(00)00270-6)

<a id="ref-WR2015a"></a>Wilensky, U. and Rand, W. (2015). *An Introduction to Agent-Based Modeling*. MIT Press.

## See Also

- [Factsheet](factsheet.md) · [Ensemble Runs](ensemble.md) · [Parameter Scanning](parameter-scanning.md) · [Sensitivity Analysis](sensitivity.md)
