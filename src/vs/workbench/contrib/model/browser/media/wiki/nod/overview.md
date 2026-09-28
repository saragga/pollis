# Overview

All four detectors in this webview start from the same idea: **an outlier is a point whose neighbourhood looks different from everyone else's**. They differ in what they measure about that neighbourhood.

## KNN
The distance to the k-th nearest neighbour (or the mean or median of the k distances). Large distance, isolated point. Simple and hard to beat on data with a single dense cloud. See [KNN](knn.md).

## LOF
The Local Outlier Factor compares a point's local density with the density of its neighbours. A value near 1 means "as dense as its neighbours"; well above 1 means "sparser than its neighbours". It handles **clusters of different densities**. See [LOF](lof.md).

## COF
The Connectivity-based Outlier Factor replaces density with the average **chaining distance** along a path through the neighbours. It suits elongated, line-like clusters where LOF's spherical view of density misleads. See [COF](cof.md).

## ABOD
Angle-Based Outlier Detection looks at the **variance of angles** between a point and pairs of its neighbours. Points inside a cluster see neighbours in all directions (high variance); outliers see them all in one direction (low variance). Angles are more stable than distances in higher dimensions. See [ABOD](abod.md).

## Common Workflow

1. Scale the features.
2. Fit a detector and get one score per point.
3. Flag the top fraction (the contamination rate) or inspect the score distribution.
4. Check that the flags are stable across `k` and across detectors.

## See Also
- [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
