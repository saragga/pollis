# ABOD

**Angle-Based Outlier Detection** (Kriegel et al., 2008) looks at the angles between a point and pairs of its neighbours, not at distances.

## Construction
```julia
using OutlierDetection, OutlierDetectionNeighbors
detector = ABODDetector(k = 10, enhanced = false)   # k must be at least 3
model, scores = OutlierDetection.fit(detector, permutedims(X); verbosity = 0)
```

## How It Works
For a point p and each pair of neighbours (a, b), take the vectors from p to a and from p to b and compute their angle, weighted by the distances. The **angle-based outlier factor** is the variance of these weighted angles.
- A point **inside** a cluster sees neighbours in every direction: the angles vary widely, **high** variance.
- A point **outside** sees all neighbours in roughly one direction: **low** variance.

OutlierDetectionNeighbors.jl negates the variance so that, as with the other detectors, higher means more unusual. Outlier scores are therefore close to zero and normal points strongly negative.

## Variants
- **`enhanced = false`**: FastABOD, which uses only the k nearest neighbours instead of all pairs in the data.
- **`enhanced = true`**: the enhanced ABOD of Li, Lv and Cheng (2015), which reweights the angles for more stable scores.

## Strengths and Limits
- Angles stay informative in **higher dimensions**, where distances concentrate.
- Cost grows with k squared (all neighbour pairs), so keep k moderate.

## See Also
- [KNN](knn.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
