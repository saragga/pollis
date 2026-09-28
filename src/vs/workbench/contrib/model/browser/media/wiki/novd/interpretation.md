# Interpretation

## Scores
- **One-Class SVM**: the negated decision value. Positive means outside the boundary; the larger, the further out.
- **Gaussian**: the squared Mahalanobis distance from the training mean. It counts distance in units of the training spread, allowing for correlation between features.
- **CUSUM**: S(t), the accumulated evidence of a shift. It is not a per-point score; it grows while the shift persists.

## The Threshold Is a Choice
nu, alpha and h trade missed novelties against false alarms. A lower false-alarm rate means fewer, more certain flags, and some real novelties missed.

## Which Features Make a Point Novel?
For the non-temporal methods, standardise the novel point with the training mean and standard deviation (**Explain Novelty**). Features with large absolute z-scores explain most of the distance. A point can also be novel because of an unusual **combination** of ordinary values; the Gaussian model detects this through the covariance even when every z-score is moderate.

## CUSUM Alarm Time
The alarm comes **after** the change: the statistic needs several shifted observations to cross h. Estimate the change time as the last step where the relevant statistic was zero before the alarm.

## Caveat
"Novel" means "unlike the training data". A flagged point can be a genuine new normal condition that the training set did not cover.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
