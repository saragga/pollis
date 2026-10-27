# Diagnostics

## Training Against Test
Every model prints its metric on the training data and on the test data: **accuracy** for classification, **RMSE** for regression. A forest or a deep boosted model often fits the training data almost perfectly, so the training number alone means little. A large gap between the two is **overfitting**: reduce the depth, the number of rounds or the learning rate.

## Residuals or Calibration
- **Regression**: residuals against predictions should scatter evenly around zero. A funnel means the error grows with the prediction; a curve means a pattern the trees missed, often because the target needs a transformation.
- **Classification**: the calibration plot bins the predicted probability of the last class into tenths and plots the observed frequency in each bin. Points on the diagonal mean the probabilities can be read as probabilities. Random forests tend to push them towards the middle, boosting towards 0 and 1.

## Test Metric Uncertainty
The test set is a sample too. The action resamples it 1000 times with replacement and reports a **95% interval** for the test metric. With a small test set the interval is wide: two models whose intervals overlap a lot are not shown to differ.

## Baselines
- **vs Simple Baseline**: the majority class (classification) or least squares on all features (regression). An ensemble that does not beat it has found nothing the simple model misses.
- **vs Single Decision Tree**: one tree of the same depth. The gap is what averaging or boosting adds.

## Quick Checklist

| Check | Action | Good sign | Warning sign |
|---|---|---|---|
| Overfitting | Model fit (train and test) | Test close to train | Train far better than test |
| Residual pattern | Residuals or Calibration | Even band around zero | Funnel or curve |
| Calibration | Residuals or Calibration | Points near the diagonal | S-shape or a systematic shift |
| Precision of the test metric | Test Metric Uncertainty | Narrow interval | Interval covers the baseline |
| Added value | vs Simple Baseline, vs Single Decision Tree | Clear gain | No gain |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
