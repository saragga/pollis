# Decision Guide

| Situation | Strategy |
|---|---|
| Independent observations, general use | **KFold** (5 or 10), shuffled |
| Classes or response ranges must appear in every fold | **StratifiedKFold** |
| Reduce dependence on one random assignment | **RepeatedKFold** |
| Very small dataset | **LeaveOneOut**, or RepeatedKFold |
| Many independent resamples of a large dataset | **ShuffleSplit** or **BootstrapSplit** (out-of-bag test) |
| Tuning and an unbiased error estimate together | **NestedCV** |
| Observations belong to groups; new groups are the target | **GroupKFold**, **GroupShuffleSplit** |
| Forecasting a time series | **TimeSeriesSplit**; **TimeSplit** for one split |
| Autocorrelated series, error over the whole series | **BlockedCV** |
| Overlapping labels or horizons (finance) | **PurgedKFold** |
| Small dataset, training set must cover the feature space | **KennardStoneSplit**, or **SPXYSplit** with the response |
| Large dataset, distance matrix too big for memory | **LazyKennardStoneSplit**, **LazyOptiSimSplit** |

## Decision Flow

1. **How will the model be used?** On new observations from the same units, new units, or the future? The answer chooses the family.
2. **Is there structure?** Groups call for group-aware folds; time order, for time-series folds. Shuffled k-fold is right only for exchangeable data.
3. **Are you tuning?** Then the tuning scores are optimistic; use nested CV or keep an untouched test set.
4. **How many observations?** Few: more folds or repeats. Many: 5 folds, or a single hold-out split.
5. **Run the Leakage Check**, and make sure preprocessing happens inside the folds.

## Rules of Thumb
- **5 or 10 folds** balance the bias of small training sets against the variance of small test sets.
- **Fix the seed** for reproducibility, and use the same folds for every model you compare.
- **Do not report the fold spread as a standard error.**
- **Distance-based splits design training sets**: estimate performance with a split that reflects the deployment population.

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
