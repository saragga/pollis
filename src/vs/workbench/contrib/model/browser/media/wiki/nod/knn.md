# KNN

The **k-nearest-neighbour (KNN) detector** scores each point by how far it is from its neighbours. An isolated point has distant neighbours and a large score.

## Construction
```julia
using OutlierDetection, OutlierDetectionNeighbors, Statistics
detector = KNNDetector(k = 10, reduction = :maximum)
model, scores = OutlierDetection.fit(detector, permutedims(X); verbosity = 0)
outliers = findall(scores .> quantile(scores, 0.95))
```
The detectors expect observations in **columns**, hence `permutedims(X)`.

## Reduction
The `reduction` argument combines the k neighbour distances into one score:
- **`:maximum`**: distance to the k-th neighbour, the classic KNN score.
- **`:mean`**: average distance to all k neighbours; smoother and less sensitive to one distant neighbour.
- **`:median`**: robust to a few unusual neighbours.

## Strengths and Limits
- Simple, fast and a strong **baseline**.
- A single global distance scale: a point at the edge of a sparse cluster can outscore a real outlier near a dense one. When clusters differ in density, use [LOF](lof.md).

## See Also
- [LOF](lof.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
