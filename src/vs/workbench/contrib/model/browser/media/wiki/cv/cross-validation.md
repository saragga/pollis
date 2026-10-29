# Cross-Validation

The cross-validation strategies of DataSplits.jl divide the observations so that each is evaluated on a model that did not see it. They suit **exchangeable** observations: independent draws with no grouping or order that links them.

## KFold
**KFold** divides the observations into k nearly equal folds; each is held out once while the model is fitted on the other k - 1. The panel shuffles before folding, which matters when the rows are sorted (by class, by date). With 5 or 10 folds the training sets are 80% or 90% of the data.

## StratifiedKFold
**StratifiedKFold** spreads each class evenly across the folds, so rare classes appear in every test fold. For a continuous response, DataSplits bins it into quantiles first. Stratification keeps the distribution of the dataset in every fold; it does not balance an imbalanced dataset.

## RepeatedKFold
**RepeatedKFold** runs k-fold several times with different shuffles (the panel uses 3 repeats), giving k times the repeats folds. The average depends less on one random assignment; the fold scores remain correlated.

## LeaveOneOut and LeavePOut
**LeaveOneOut** holds out one observation at a time, n folds in all, each training on n - 1 observations: almost no bias from a smaller training set, but expensive and with a high-variance estimate. **LeavePOut** holds out every set of p observations, binomial(n, p) folds; the panel uses p = 2. Use them only for small n.

## NestedCV
**NestedCV** combines an outer cross-validation, which estimates performance, with an inner one, applied to each outer training set, which chooses the hyperparameters. The outer scores then estimate the error of the whole procedure, tuning included. The inner strategy must be a k-fold-type strategy, not a resampling one.

## Resampling: ShuffleSplit, StratifiedShuffleSplit, BootstrapSplit
**Resampling** strategies draw independent train/test splits, each with explicit sizes (80% and 20% in the panel): an observation may be tested several times or never. **ShuffleSplit** draws without replacement; **StratifiedShuffleSplit** keeps the response distribution in each draw; **BootstrapSplit** draws a training set of n observations with replacement and tests on the out-of-bag observations, about 37% of them.

## RandomSplit
**RandomSplit** makes a single random train/test split: a reproducible baseline, and the simplest hold-out when the data are plentiful.

## See Also
- [Overview](overview.md) · [Group-Aware](group-aware.md) · [Time-Series](time-series.md)
