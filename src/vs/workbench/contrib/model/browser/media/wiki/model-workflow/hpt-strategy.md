# Choosing a Strategy

The best search strategy depends on how long one fit takes, how many hyperparameters there are and how much is known about their ranges. The checks in the panel then show whether the search was long enough and whether its result can be trusted.

## Which Tuning Strategy Suits Which Situation

| Situation | Tab | Why |
|---|---|---|
| One or two hyperparameters, or a few categorical options | **Grid Search** | Covers everything, and the budget stays small |
| Three or more hyperparameters, with ranges unknown | **Random Search** | Cost does not grow with the number of hyperparameters |
| A first look at any new model | **Random Search** | Shows quickly which settings matter |
| Slow fits, with a budget of tens of evaluations | **Bayesian** | Uses earlier scores to spend each fit better |
| A narrow region is already known | **Grid Search** | Refines it with an even, readable layout |
| Fits can run in parallel on many machines | **Random Search** or **Grid Search** | Evaluations do not depend on one another |

For a fast model, these differences shrink, because a large random search then costs little. [Bergstra and Bengio (2012)](#ref-BB2012a) make the case for random search as the baseline.

## How to Set the Tuning Budget and the Number of Folds

**Resolution**, **Iterations** and **Calls** set the number of configurations, and **CV Folds** sets the cost of each. Five folds is the panel's default, and 10 gives a less noisy score at twice the cost. On a small data set, each fold is small and each score is noisy, so a large search mostly picks out noise. A search is long enough when further draws stop improving the best score by more than the differences between its folds, which `best_entry.per_fold` in `report(mach)` shows.

## How to Read the Tuning Curve

**Tuning Curve** runs `learning_curve` over one hyperparameter, `max_depth` from 1 to 10 for the default **Model**, and plots cross-validated score against it. The other hyperparameters stay at their defaults in `model`, and not at the values found by the search, so the curve can disagree with the tuned result where hyperparameters interact. A curve with a clear peak shows a value worth tuning, and a flat one shows that the value hardly matters. Noise between neighbouring points indicates how much of a small gain is real. No error bars are drawn.

## How to Read the Learning Curve

**Learning Curve** evaluates the tuned model on growing subsets of a shuffled data set, from 10% to 100% of the rows, with cross-validation inside each subset. If the score is still improving at the right end, more data would probably help. A flat curve suggests that more data alone will add little, and that a richer model or better features may be needed. The chart shows validation scores only, so the gap between training and validation scores, the usual sign of overfitting, is not visible. `best` was chosen using all the rows, so the left end of the curve is somewhat flattered.

## How to Read the Best Parameters Summary

**Best Parameters Summary** prints the best score and configuration, then the top five. Scores that lie close together mean that several settings are about equal, so prefer the simplest, such as the shallowest tree. A best value at the edge of a range means the range should be wider. `higher_is_better` is worked out by checking whether the best score equals the highest, so it does not depend on naming the measure as a score or a loss.

## Why the Best Cross-Validated Score Is Optimistic

The winning score is the highest of many noisy estimates, so it tends to be too good, and the more configurations tried the larger the bias. [Varma and Simon (2006)](#ref-VS2006a) showed how far this can go, and recommended nested cross-validation for an honest estimate. Scoring on data kept away from the whole search is the simple alternative, and it should happen once, after all choices are made. MLJ.jl allows nesting too, because `TunedModel` is itself a model and can be passed to `evaluate` with an outer resampling strategy. The panel does neither of these by itself, so its printed score should not be reported as expected performance.

## References

<a id="ref-BB2012a"></a>Bergstra, J. and Bengio, Y. (2012). Random search for hyper-parameter optimization. *Journal of Machine Learning Research* 13(10), 281–305.

<a id="ref-VS2006a"></a>Varma, S. and Simon, R. (2006). Bias in error estimation when using cross-validation for model selection. *BMC Bioinformatics* 7(1), 91. [doi:10.1186/1471-2105-7-91](https://doi.org/10.1186/1471-2105-7-91)

## See Also

- [Overview](hpt-overview.md) · [Grid Search](hpt-grid.md) · [Random Search](hpt-random.md) · [Bayesian Optimisation](hpt-bayesian.md)
