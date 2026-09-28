# Assumptions

## Clean Training Data
All three methods treat the training data (or baseline) as the definition of normal. Anomalies in it widen the boundary, inflate the covariance or shift the baseline mean, and hide later novelties of the same kind.

## Representative Training Data
The training set must cover **all normal behaviour** you expect later, for example every shift, season or product type. Normal conditions missing from training will be flagged as novel.

## Consistent Scaling
New data must be transformed exactly as the training data was. The One-Class SVM template standardises with the **training** mean and standard deviation; re-computing them on the test data would move the boundary.

## Method-Specific Assumptions

| Method | Assumes |
|---|---|
| One-Class SVM | Features on comparable scales; a sensible kernel width |
| Gaussian | Approximately multivariate normal data; more observations than features |
| CUSUM | Independent observations with a stable baseline mean and standard deviation |

CUSUM is sensitive to **autocorrelation**: a positively correlated series drifts naturally and triggers false alarms. Model the dependence first (for example with an ARIMA model) and monitor the residuals.

## See Also
- [Diagnostics](diagnostics.md) · [Overview](overview.md)
