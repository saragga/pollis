# Decision Guide

| Situation | Detector | Why |
|---|---|---|
| One dense cloud, few dimensions | **KNN** ([knn](knn.md)) | Simple, fast, strong baseline |
| Clusters of different density | **LOF** ([lof](lof.md)) | Compares each point with its own neighbourhood |
| Elongated or line-shaped clusters | **COF** ([cof](cof.md)) | Chaining distance follows the shape |
| Moderate to high dimension | **ABOD** ([abod](abod.md)) | Angles are more stable than distances |

## Decision Flow

1. **Start with KNN.** It is the baseline every other method must beat.
2. **Are there clusters with different spreads?** A point at the edge of a sparse cluster can look like an outlier to KNN. Switch to LOF.
3. **Are the clusters stretched along lines or curves?** LOF assumes roughly round neighbourhoods; use COF.
4. **More than about ten features?** Try ABOD (the enhanced variant for more stable scores).
5. **Hundreds of features or complex structure?** Move to the Learning-Based Anomaly Detection webview.

## Rules of Thumb
- **Scale the features** before any distance-based method.
- **Choose k** between about 10 and 50, and larger than any suspected anomaly cluster.
- **Trust agreement:** a point flagged by several detectors and many values of k is a strong candidate.

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md)
