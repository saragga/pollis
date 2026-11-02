# Decision Guide

Three designs are available, from cheap to costly: repeat at one setting, scan across settings, and split the variance between inputs. The right one depends on the question and the budget.

## Which Design Fits Which Question

| Question | Design | Where in the panel |
|---|---|---|
| How much of the outcome is chance | Ensemble | **Ensemble Runs**, **Variance Across Runs** |
| How the outcome responds to one or two parameters | Scan | **Parameter Scanning**, **Parameter Heatmap** |
| How the response varies with chance at each point | Scan with seeds | **Equilibrium Summary** |
| Whether parameters interact | Compare designs | **OAT vs Factorial** |
| Which parameter matters most over a range | Variance split | **Sobol Sensitivity** |

## How Many Replications an Ensemble Needs

**Replications (R)** should bring the standard error well under the effect of interest. To estimate a mean within a margin d with about 95% confidence, take R near (1.96 s / d)², with s from **Variance Across Runs**. A first look may need only a few runs, while a claim about a small difference needs many more. Rare events need the most, because few runs show them. **Larger Ensemble** shows the effect of more replications directly, so its output can guide the choice before a long experiment.

## How to Choose the Design of a Parameter Scan

Start coarse, with few values on the parameters that theory says matter most, and refine where the outcome changes. Add `:seed` once the region of interest is known, as replication multiplies the cost. Past three or four parameters a full factorial is rarely affordable. The elementary effects of [Morris (1991)](#ref-Mor1991a) can screen out unimportant inputs first, with a cost that rises in proportion to the number of parameters, and a Sobol analysis then needs fewer inputs.

## When to Use One-at-a-Time or Sobol Analysis

A one-at-a-time design is cheap and easy to explain, and fits a first look or a model with few interactions. Its weakness is that it explores only lines through one base point. Sobol analysis covers the whole range and captures interactions, at a much higher cost per parameter. [Ten Broeke, van Voorn and Ligtenberg (2016)](#ref-BVL2016a) evaluate three well-known methods on agent-based models. For a model where each run is expensive, the budget often decides, and a scan of two key parameters may teach more than noisy indices over many.

## When to Leave the Ensemble and Parameter Scanning Panel

**Agent-Based Models** suits building and understanding one model, with its checks and scenarios. **ABM Visualisation** suits watching what a run does. An outcome with no clear single number, such as a spatial pattern, needs a summary statistic defined first, since all designs here work on one output at a time. Fitting a model to observed data is a different task, which calls for calibration, and no design here does that. [Datseris, Vahdati and DuBois (2022)](#ref-DVD2022a) describe the wider set of tools in `Agents.jl`.

## References

<a id="ref-DVD2022a"></a>Datseris, G., Vahdati, A. R. and DuBois, T. C. (2022). Agents.jl: a performant and feature-full agent based modelling software of minimal code complexity. *SIMULATION* 100(10), 1019–1031. [doi:10.1177/00375497211068820](https://doi.org/10.1177/00375497211068820)

<a id="ref-Mor1991a"></a>Morris, M. D. (1991). Factorial sampling plans for preliminary computational experiments. *Technometrics* 33(2), 161–174. [doi:10.1080/00401706.1991.10484804](https://doi.org/10.1080/00401706.1991.10484804)

<a id="ref-BVL2016a"></a>Ten Broeke, G., van Voorn, G. and Ligtenberg, A. (2016). Which sensitivity analysis method should I use for my agent-based model? *Journal of Artificial Societies and Social Simulation* 19(1). [doi:10.18564/jasss.2857](https://doi.org/10.18564/jasss.2857)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Sensitivity Analysis](sensitivity.md)
