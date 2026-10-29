# Time-Series

Observations ordered in time are dependent, and the information available for prediction changes over time. A random split lets the model learn from the future and from the neighbours of each test observation, and the score is optimistic. The time-series strategies of DataSplits.jl respect the order. All keep observations with the same time stamp together, so a boundary never splits a date.

## TimeSplit
**TimeSplit** makes one chronological split: the oldest observations train, the newest test. It reproduces a single forecasting origin.

## TimeSeriesSplit
**TimeSeriesSplit** makes k folds in time order: fold i trains on everything before block i + 1 and tests on block i + 1. By default the training window grows (**expanding window**); a maximum training size gives a **rolling window**, useful when old data are less relevant. A **gap** between training and test removes the observations right at the boundary, when features or targets span several periods. This is the strategy for **forecasting**: every fold predicts forward.

## BlockedCV
**BlockedCV** divides the series into k contiguous blocks; each block is tested in turn, with all the others, before and after it, for training. A symmetric gap around the test block buffers against autocorrelation. It estimates performance across a dependent series, using all the data, but trains on the future, so it does not simulate forecasting.

## PurgedKFold
**PurgedKFold** is blocked cross-validation for data whose labels or features **overlap in time**, common in financial machine learning, where a label may depend on returns over the following days. It **purges** training observations just before the test block, whose labels overlap it, and places an **embargo** on those just after it, which may carry information from it. The panel purges and embargoes two time steps. Choose the sizes from the length of the overlapping windows, never to improve the score.

## Choosing
- **Forecasting**: TimeSeriesSplit, or TimeSplit for a single origin.
- **Error over the whole series, not forecasting**: BlockedCV, with a gap if the series is autocorrelated.
- **Overlapping labels or horizons**: PurgedKFold.

## See Also
- [Overview](overview.md) · [Cross-Validation](cross-validation.md) · [Group-Aware](group-aware.md)
