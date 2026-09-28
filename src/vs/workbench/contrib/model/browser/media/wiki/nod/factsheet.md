# Proximity-Based Outlier Detection — Factsheet

**Proximity-based outlier detection** flags observations that are far from, or less densely surrounded than, their nearest neighbours. It needs no labels and no model of the data distribution: only a distance between observations.

| | |
|---|---|
| **Purpose** | Find unusual observations in unlabelled numeric data |
| **Input** | A numeric matrix, observations in rows (transposed for the detectors) |
| **Core packages** | [OutlierDetection.jl](https://github.com/OutlierDetectionJL/OutlierDetection.jl), [OutlierDetectionNeighbors.jl](https://github.com/OutlierDetectionJL/OutlierDetectionNeighbors.jl) |
| **Detectors** | KNN, LOF, COF, ABOD |
| **Output** | One outlier score per observation; higher means more unusual |
| **Key parameter** | `k`, the number of neighbours |

## When to Use

- You have **no labelled anomalies** and want a ranked list of suspects.
- The data set is **small to medium** (thousands to tens of thousands of rows).
- Features are **numeric and comparably scaled**, so a Euclidean distance is meaningful.

## What It Is Not

These detectors score points; they do not decide what counts as an outlier. The cut-off comes from an assumed **contamination** rate or from inspecting the scores. For very large or high-dimensional data with nonlinear structure, see the Learning-Based Anomaly Detection webview; to check new data against a clean reference sample, see Novelty Detection.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [KNN](knn.md)
