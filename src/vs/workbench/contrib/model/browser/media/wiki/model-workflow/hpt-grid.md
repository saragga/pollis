# Grid Search

Grid search lays out a list of values for each hyperparameter and evaluates every combination. The budget is not set directly, as it follows from the length of the lists.

## What Grid Search Computes

For each combination, `TunedModel` runs cross-validation with **CV Folds** folds and records the mean of **Performance Measure**. It then refits on all the data with the winner. The panel calls `Grid(resolution=...)` from MLJ.jl. Rows are not shuffled by `CV(nfolds=...)` unless asked, so data sorted by class or by time gives folds that are unlike one another. Use `CV(nfolds=5, rng=42)` to shuffle, or `StratifiedCV` to keep class shares in each fold, and keep time-ordered data in time order with `TimeSeriesCV`.

## How Grid Search Reads the Panel Inputs

**Resolution** sets the number of values taken from each numeric range with bounds, and the default is 5. A range given as `values=[...]` keeps all its values, and **Resolution** does not change it. The generated code has one of each kind: with **DecisionTreeClassifier**, `max_depth` has 5 listed values and `min_purity_increase` has 5 values spaced on a log scale, which makes 25 combinations and 125 fits at the default of 5 folds. To give one range its own resolution, pass a pair such as `(r2, 10)` within `range`.

## How the Cost of Grid Search Grows

The number of combinations is the product of the list lengths, so it multiplies with every hyperparameter added.

| Hyperparameters | Values each | Combinations | Fits with 5 folds |
|---|---|---|---|
| 2 | 5 | 25 | 125 |
| 3 | 5 | 125 | 625 |
| 4 | 5 | 625 | 3125 |
| 6 | 5 | 15625 | 78125 |

Beyond two or three hyperparameters, the grid has to become coarse to stay affordable. **Random Search** avoids that growth.

## What Grid Search Does Well

Coverage is even and the result is easy to reproduce and to explain. Every combination is present, so scores over two hyperparameters can be drawn as a heat map, which shows interactions directly. No distribution or seed choice affects which configurations appear. For one or two hyperparameters that all matter, or for categorical choices that are few in number, a grid is a sound and honest default. It is also easily run in parallel, as no result depends on any other.

## Where Grid Search Misleads

Grid points only test the listed values, and the optimum may lie between them. A winner at the edge of a list says the range was too small and not that the edge is best. Budget is also wasted when one hyperparameter hardly matters: 25 combinations give only 5 distinct values of the one that counts, as [Bergstra and Bengio (2012)](#ref-BB2012a) pointed out. A value such as a learning rate needs `scale=:log` for its steps to be useful, since linear steps crowd the top of a wide range. Trying many combinations also raises the chance that one looks good by luck, and the winning score carries that selection bias.

## What to Compare Grid Search With

**Best Parameters Summary** shows how close the runners-up are. A flat top means that the choice hardly matters, and the simpler configuration is a reasonable pick. **Random Search** with the same number of configurations is the natural comparison, on the same ranges and scale. The ranges of the generated code differ in one respect, since **Random Search** draws `min_purity_increase` uniformly from 0 to 0.3 while **Grid Search** uses a log scale from 0.001 to 0.3. Align them before reading any gap as a difference between strategies.

## References

<a id="ref-BB2012a"></a>Bergstra, J. and Bengio, Y. (2012). Random search for hyper-parameter optimization. *Journal of Machine Learning Research* 13(10), 281–305.

## See Also

- [Overview](hpt-overview.md) · [Random Search](hpt-random.md) · [Bayesian Optimisation](hpt-bayesian.md) · [Choosing a Strategy](hpt-strategy.md)
