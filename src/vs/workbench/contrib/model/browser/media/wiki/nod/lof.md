# LOF

The **Local Outlier Factor** (Breunig et al., 2000) compares the density around a point with the density around its neighbours. It measures whether a point is **locally** isolated, relative to its own region of the data.

## Construction
```julia
using OutlierDetection, OutlierDetectionNeighbors
detector = LOFDetector(k = 10)
model, scores = OutlierDetection.fit(detector, permutedims(X); verbosity = 0)
```

## How It Works
1. The **reachability distance** from p to a neighbour o is the larger of their distance and o's own k-distance, which smooths out tiny distances inside dense clusters.
2. The **local reachability density** of p is the inverse of its mean reachability distance to its k neighbours.
3. **LOF** is the average density of p's neighbours divided by p's own density.

## Reading the Score
- **About 1**: as dense as its neighbours; a normal point.
- **Clearly above 1** (say 1.5 or more): sparser than its neighbours; an outlier.
- Below 1: denser than its neighbours, typically the core of a cluster.

## Strengths and Limits
- Handles **clusters of different density**, where [KNN](knn.md) fails.
- Sensitive to `k`: too small gives noisy scores, too large merges nearby clusters. Check a range of values.
- Assumes roughly round neighbourhoods; for stretched clusters see [COF](cof.md).

## See Also
- [KNN](knn.md) · [COF](cof.md) · [Diagnostics](diagnostics.md)
