# Decision Guide

| Situation | Method | Why |
|---|---|---|
| Rows of features, irregular normal shape | **One-Class SVM** ([one-class-svm](one-class-svm.md)) | Flexible kernel boundary |
| Rows of features, roughly normal data | **Gaussian** ([gaussian-novelty](gaussian-novelty.md)) | Exact false-alarm rate from chi-square |
| One series over time, sustained shifts | **CUSUM** ([cusum](cusum.md)) | Accumulates small, persistent changes |
| Training data may contain anomalies | Outlier detection first | Clean the training set before fitting |

## Decision Flow

1. **Is the data a time series?** Yes: CUSUM on the series (or on model residuals if it is autocorrelated).
2. **Is the training data roughly multivariate normal?** Check histograms or a Q-Q plot of the Mahalanobis distances. Yes: Gaussian, for a calibrated threshold.
3. **Otherwise** (skewed, clustered or curved shape): One-Class SVM.
4. **Unsure?** Fit both non-temporal methods and compare their flags.

## Rules of Thumb
- **nu, alpha**: 0.01 to 0.05, the false-alarm rate you can accept.
- **CUSUM k**: half the shift you want to detect, in standard deviations (k = 0.5 for a one-sigma shift).
- **CUSUM h**: 4 to 5 for a false alarm every few hundred steps.
- **Refit** when normal behaviour legitimately changes.

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md)
