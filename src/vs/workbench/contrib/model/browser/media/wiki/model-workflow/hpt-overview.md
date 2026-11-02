# Overview

Hyperparameters are the settings a model does not learn from the data, such as the depth of a tree. Tuning tries different settings, scores each by cross-validation and keeps the best.

## What the Hyperparameter Tuning Panel Does

| Item | Description |
|---|---|
| **Purpose** | Find good hyperparameters for an MLJ.jl model, and refit it on all the data with them |
| **Julia stack** | MLJ.jl for the tuning, resampling and measures, TreeParzen.jl for **Bayesian**, Plots.jl for the curves |
| **Tabs** | **Grid Search**, **Random Search**, **Bayesian** |
| **Inputs** | **Model**, **Package**, **Performance Measure**, **Feature Matrix**, **Target Vector**, **CV Folds** |
| **Budget** | **Resolution** in **Grid Search**, **Iterations** in **Random Search**, **Calls** in **Bayesian** |
| **Output** | `mach`, the tuned machine, with its best settings in `fitted_params(mach).best_model` |
| **Key choice** | How to spend a limited number of model fits |

An MLJ.jl framework paper by [Blaom, Kiraly, Lienart, Simillides, Arenas and Vollmer (2020)](#ref-BKLSA...2020a) describes the design behind `TunedModel`, which all three tabs use.

## How Each Search Strategy Picks Configurations

| Tab | How the next configuration is chosen | Number of configurations |
|---|---|---|
| **Grid Search** | Every combination of a fixed list per hyperparameter | The product of the list lengths |
| **Random Search** | An independent draw from the ranges | **Iterations** |
| **Bayesian** | First 10 random draws, then a model of which settings scored well | **Calls** |

[Bergstra and Bengio (2012)](#ref-BB2012a) showed why random draws often beat a grid when only a few hyperparameters matter. [Bergstra, Bardenet, Bengio and Kégl (2011)](#ref-BBBK2011a) proposed the Tree-structured Parzen Estimator used by **Bayesian**.

## How to Set Up a Tuning Problem in the Panel

**Model** names an MLJ.jl model type and **Package** names the package that provides it. **Performance Measure** scores each configuration and must suit the task, for example `accuracy` for classes and `rmse` for numbers. **Feature Matrix** should be a table or matrix with the types the model accepts, and **Target Vector** needs a matching scientific type, such as `Multiclass` for classes. With another **Model**, replace `:param1` and `:param2` in the generated ranges with its hyperparameters, and `v1`, `v_lo` and similar placeholders with their values. `model` shows the available fields when printed.

## What Each Configuration Costs in a Tuning Run

Each configuration is fitted once per fold, so a run needs about configurations × **CV Folds** fits, plus one final refit on all the data. As a consequence, doubling **CV Folds** costs as much as doubling the configurations, though each buys something different: more folds make each score less noisy, while more configurations cover more of the space. With a slow model, an inner holdout through `resampling=Holdout()` is a cheaper trade.

## A Common Workflow for Hyperparameter Tuning

First put some data aside, away from the panel entirely. Run a short search with wide ranges, on a log scale for values that span orders of magnitude. **Best Parameters Summary** shows the top configurations, and if the best one sits at the edge of a range, widen that range. **Tuning Curve** shows how much a hyperparameter matters, and **Learning Curve** shows whether more data would help. Narrow the ranges, repeat, and finally score the chosen machine with `predict` on the data set aside. The cross-validated score of the winner is an optimistic guide, as [Varma and Simon (2006)](#ref-VS2006a) showed. The panel has no held-out step of its own, so that final score is up to the user.

## References

<a id="ref-BBBK2011a"></a>Bergstra, J., Bardenet, R., Bengio, Y. and Kégl, B. (2011). Algorithms for hyper-parameter optimization. *Advances in Neural Information Processing Systems* 24.

<a id="ref-BB2012a"></a>Bergstra, J. and Bengio, Y. (2012). Random search for hyper-parameter optimization. *Journal of Machine Learning Research* 13(10), 281–305.

<a id="ref-BKLSA...2020a"></a>Blaom, A. D., Kiraly, F., Lienart, T., Simillides, Y., Arenas, D. and Vollmer, S. (2020). MLJ: A Julia package for composable machine learning. *Journal of Open Source Software* 5(55), 2704. [doi:10.21105/joss.02704](https://doi.org/10.21105/joss.02704)

<a id="ref-VS2006a"></a>Varma, S. and Simon, R. (2006). Bias in error estimation when using cross-validation for model selection. *BMC Bioinformatics* 7(1), 91. [doi:10.1186/1471-2105-7-91](https://doi.org/10.1186/1471-2105-7-91)

## See Also

- [Grid Search](hpt-grid.md) · [Random Search](hpt-random.md) · [Bayesian Optimisation](hpt-bayesian.md) · [Choosing a Strategy](hpt-strategy.md)
