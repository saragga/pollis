# Assumptions

Proximity methods are assumption-light, but they rely on the distance being meaningful.

## Comparable Scales
Distances add up squared differences across features. A feature measured in thousands dominates one measured in fractions. **Standardise** (or min-max scale) the columns first unless the units are already comparable.

```julia
using Statistics
Xs = (X .- mean(X, dims=1)) ./ std(X, dims=1)
```

## Numeric Features
Euclidean distance needs numeric columns. Encode categorical variables first, or use a distance designed for mixed data.

## Outliers Are Rare
The methods assume anomalies are a **small minority**. If they form a large or tight group, they become each other's neighbours and look normal. Choose `k` larger than the size of any suspected anomaly cluster.

## Moderate Dimension
In high dimensions all pairwise distances become similar ("concentration of distances"), and KNN and LOF lose contrast. ABOD degrades more slowly; beyond a few dozen features consider dimension reduction or the learning-based detectors.

## Independent Observations
Each row is scored as an unordered point. For time series, where an anomaly is a break in the pattern over time, use the CUSUM tools in Novelty Detection instead.

## See Also
- [Diagnostics](diagnostics.md) · [Overview](overview.md)
