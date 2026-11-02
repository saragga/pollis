# Random Search

Random search draws each configuration independently from the ranges, for a number of draws set in advance. Adding a hyperparameter does not raise the cost, as the number of draws stays as chosen.

## What Random Search Computes

Each draw picks one value per range, and `TunedModel` scores it by cross-validation with **CV Folds** folds, as in any other strategy. The best score decides which configuration is refitted on all the data. The panel calls `RandomSearch(rng=42)` from MLJ.jl. A fixed seed repeats the same draws, which makes the search reproducible. Changing the seed and rerunning shows how much the result depends on luck.

## How Random Search Reads the Panel Inputs

**Iterations** is the number of configurations, with a default of 50, so the default run takes 250 fits at 5 folds. Numeric ranges with both bounds are drawn from `Distributions.Uniform`, the default of `RandomSearch`, and a list given by `values=[...]` is drawn from with equal chance. With **DecisionTreeClassifier**, the generated code draws `min_purity_increase` from 0 to 0.3 and `max_depth` from 5 listed values, and a listed value will repeat across draws. Other distributions can be set through the `bounded`, `positive_unbounded` and `other` keywords of `RandomSearch`.

## Why Random Search Often Beats a Grid

[Bergstra and Bengio (2012)](#ref-BB2012a) observed that usually only a few hyperparameters matter, and which ones depends on the data. A grid of 25 points on two hyperparameters tries only 5 values of each, while 25 random draws try 25 values of each continuous one. If one of them hardly matters, the search has in effect explored the other far more finely. The chance of a good draw also has a simple form: if a fraction f of the space is good, n draws miss it with probability (1 - f)^n, and 59 draws reach a top 5% region with a probability of about 95%. That figure concerns the true scores, which cross-validation only estimates.

## What Random Search Does Well

Stopping can come at any time, as any prefix of the draws is itself a random search, and more draws can be added later. Draws are independent, so they run in parallel with no loss. Coverage does not depend much on the number of hyperparameters, and irrelevant ones cost nothing. Having no structure, it is also a fair baseline against which a cleverer strategy has to prove its worth. Results are less tidy to display than a grid, though a scatter plot of score against each hyperparameter is usually readable.

## Where Random Search Misleads

Uniform draws suit values that act on a linear scale. A range from 0.001 to 1 drawn uniformly puts about 90% of its draws over 0.1, so small values are rarely tried, which is why a transformation or another distribution matters for such values. Independent draws take no lessons from earlier scores, so a narrow good region can be missed when few draws fall in it. With few draws, two or three hyperparameters may not be covered as evenly as a grid would cover them. Best-of-n selection also favours lucky scores, more so with noisy measures and small data, so the winning score overstates what new data will give.

## What to Compare Random Search With

**Bayesian** with the same budget shows whether learning from earlier scores pays. If it does not gain, the simpler method is preferable. **Grid Search** suits a second, narrower pass over the region that random draws have found. Rerun with a different `rng` to see how stable the best configuration and its score are. **Best Parameters Summary** lists the top five draws, and if these differ widely in their settings while scoring alike, then the score is not sensitive to them.

## References

<a id="ref-BB2012a"></a>Bergstra, J. and Bengio, Y. (2012). Random search for hyper-parameter optimization. *Journal of Machine Learning Research* 13(10), 281–305.

## See Also

- [Overview](hpt-overview.md) · [Grid Search](hpt-grid.md) · [Bayesian Optimisation](hpt-bayesian.md) · [Choosing a Strategy](hpt-strategy.md)
