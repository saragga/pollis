# COF

The **Connectivity-based Outlier Factor** (Tang et al., 2002) replaces LOF's density with **connectivity**: how easily a point can be reached by chaining through its neighbours.

## Construction
```julia
using OutlierDetection, OutlierDetectionNeighbors
detector = COFDetector(k = 10)
model, scores = OutlierDetection.fit(detector, permutedims(X); verbosity = 0)
```

## How It Works
Starting from the point, COF builds a **set-based nearest path**: at each step it adds the neighbour closest to any point already in the path. The **average chaining distance** weights the steps of that path. COF is the point's average chaining distance divided by the average over its neighbours.

## Why Chaining?
On a cluster stretched along a line, a point on the line has neighbours only in two directions, so its density looks low to LOF even though it belongs to the cluster. Chaining along the line keeps its distances short, so COF scores it as normal, while a point off the line still breaks the chain.

## Reading the Score
Like LOF, values near 1 are normal and values clearly above 1 are outliers.

## Strengths and Limits
- Best for **elongated, curved or line-like** clusters.
- More expensive than LOF and just as sensitive to `k`.

## See Also
- [LOF](lof.md) · [ABOD](abod.md) · [Decision Guide](decision-guide.md)
