# Diagnostics

## Fold Sizes
**Fold Sizes** shows the training and test sizes of every fold. K-fold folds should be nearly equal; group-aware folds vary with the group sizes; time-series folds grow (expanding window) or stay fixed (rolling window); purged folds lose the purged and embargoed rows. A very small test fold gives a noisy score.

## Feature Coverage
**Feature Coverage** plots training and test samples on the first two features. Random splits mix them evenly; distance-based splits put the training samples at the edges and spread through the space, leaving test samples inside it. Test samples outside the region covered by training mean the score measures extrapolation.

## Class Balance
**Class Balance** shows the share of rows with the response above its median in each training and test fold. Shares that vary a lot across folds mean the folds see different parts of the response distribution; a stratified strategy fixes it.

## Leakage Check
The **Leakage Check** tests the leaks that disjoint indices do not catch:
- **Entities shared** across training and test folds, when the observations come in groups. With repeated measurements per entity, a shuffled split lets the model recognise the entity, and the score is optimistic for new entities.
- **Training on the future**: the share of test rows older than the newest training row, data a forecasting model will never have.
- **Preprocessing fitted on all rows**: on 200 pure-noise features, it selects the five most correlated with the response once on all rows and once inside each fold. Selection on all rows gives a CV error below the standard deviation of the response, an apparent signal in noise; selection inside the folds does not.

## CV Score
The **CV Score** reports the mean and spread of the test RMSE across folds. A large spread means the score depends on which observations are held out; repeated k-fold reduces the dependence on one random assignment.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Fold sizes | As the strategy intends | A tiny test fold |
| Feature coverage | Test inside the training cloud | Test outside it |
| Class balance | Similar shares in every fold | Shares far apart |
| Shared entities | None, when new entities are the target | Entities on both sides |
| Training on the future | Never, for forecasting | Later training rows |
| Fold score spread | Small relative to the mean | Large |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
