# Gaussian Novelty

**Gaussian novelty detection** fits a multivariate normal distribution to the training data and flags new points that are too far from its centre, measured by the **Mahalanobis distance**.

## Construction
```julia
using Statistics, LinearAlgebra, Distributions

mu     = vec(mean(X_train, dims = 1))
SigInv = inv(cov(X_train))
scores = [dot(x .- mu, SigInv * (x .- mu)) for x in eachrow(X_test)]

threshold = quantile(Chisq(size(X_train, 2)), 1 - 0.01)
is_novel  = scores .> threshold
```

## How It Works
The squared Mahalanobis distance measures how far a point is from the mean in units of the training covariance. It shrinks distances along directions where the data varies a lot and stretches them where it varies little, so it respects correlations between features.

## Calibrated Threshold
If the data is multivariate normal with p features, the squared distance follows a **chi-square distribution with p degrees of freedom**. Its 1 - alpha quantile flags a share alpha of normal points: the false-alarm rate is set directly.

## Limits
- Heavy tails, skew or several clusters break the calibration; check the false-alarm rate on training data.
- Needs more observations than features for the covariance to be invertible; with many features, use a shrinkage estimator.
- Anomalies in the training data inflate the covariance and hide novelties.

## See Also
- [One-Class SVM](one-class-svm.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
