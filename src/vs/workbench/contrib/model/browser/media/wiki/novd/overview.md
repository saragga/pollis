# Overview

Novelty detection has two steps: **fit** a description of normal data on a clean sample, then **test** new data against it. The three methods differ in what they describe.

## Non-Temporal

For observations that arrive as independent rows with several features.

- **One-Class SVM** learns a flexible **boundary** around the training data with a kernel. It makes no distributional assumption and can wrap curved or clustered shapes. See [One-Class SVM](one-class-svm.md).
- **Gaussian novelty** fits a **multivariate normal** to the training data and flags points with a large Mahalanobis distance. The threshold comes from the chi-square distribution, so the false-alarm rate is set exactly when the data is normal. See [Gaussian Novelty](gaussian-novelty.md).

## Temporal

For a single series observed over time.

- **CUSUM** (cumulative sum) accumulates small deviations from the baseline mean and raises an alarm when the running sum crosses a threshold. It detects **sustained shifts** that are too small to flag point by point. See [CUSUM](cusum.md).

## Common Workflow

1. Collect a clean training set or baseline period.
2. Fit the method and choose its false-alarm rate (nu, alpha, or k and h).
3. Score new data; flag novel points or find the first alarm.
4. Check the false-alarm rate on known-normal data.

## See Also
- [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
