# k-Nearest Neighbours: Factsheet

A quick reference for **k-Nearest Neighbours**: the three tabs, their inputs and defaults, and what each action reports. The panel uses `NearestNeighbors` and `Distances` for the search tabs and `DynamicAxisWarping` for series.

## Tabs and their calls

| Tab | Main call | Output |
|---|---|---|
| **kNN Search** | `knn(tree, q, k, true)` | `idxs`, `dists`, sorted by distance |
| **Range Search** | `inrange(tree, q, r)` | `idxs` of all points within r |
| **DTW Classification** | `dtw_cost(a, b, SqEuclidean(), r)` | `yhat`, window, test error |

On the first two tabs, data and query are standardised before the tree is built, so distances come back in standard deviations.

## Inputs for the two search tabs

| Input | Default | Meaning |
|---|---|---|
| **Data matrix** | `rand(2, 200)` | d × n, one point per column |
| **Query point(s)** | `[0.5, 0.5]` | d-vector or d × m matrix, in original units |
| **Tree type** | KDTree | KDTree, BallTree or BruteTree |
| **Metric** | Euclidean | Euclidean, Manhattan, Chebyshev or Minkowski |
| **p** | 1.5 | Minkowski exponent, p ≥ 1; shown for Minkowski only |
| **k** | 5 | Neighbours; **kNN Search** only |
| **r** | 1.0 | Radius in standard deviations; **Range Search** only |
| **leaf_size** | 10 | Leaf size of the tree; not used by BruteTree |

## Inputs for series

| Input | Default | Meaning |
|---|---|---|
| **Dataset** | ECG200 | ECG200, TwoLeadECG or Earthquakes |
| **Warping window** | Learned | Learned, Fixed or Unconstrained |
| **Largest window (%)** | 10 | Top of the search 0, 1, ..., this value; Learned only |
| **Window (%)** | 5 | Chosen width; Fixed only |

A window of w per cent is ceil(L × w / 100) points. For L = 96, a 5% window is 5 points and 10% is 10. For L = 512, those are 26 and 52. The datasets come from the archive of [Dau, Bagnall, Kamgar, Yeh, Zhu, Gharghabi, Ratanamahatana and Keogh (2019)](#ref-DBKYZ...2019a).

## Actions for the search tabs

| Group | Action | Output |
|---|---|---|
| Visualise | **Query and Neighbours** | First two features, query and neighbours marked |
| Diagnose | **k-Distance Curve** | Sorted distance of each point to its k-th neighbour |
| Diagnose | **Exactness Check** | `true` when the tree matches a brute-force search |
| Predict | **kNN Classification** | Leave-one-out accuracy for k = 1, 3, ..., 27, then `y_hat` |
| Predict | **kNN Regression** | Leave-one-out RMSE for k = 1 to 30, then `y_hat` |
| Compare | **Tree Types** | Query time of each tree type |
| Interpret | **Nearest Examples** | Each neighbour, its label and its distance |

## Actions for DTW Classification

| Group | Action | Output |
|---|---|---|
| Visualise | **Series by Class** | First three training series of each class |
| Visualise | **Warping Path** | Test series, nearest training series and matched values |
| Diagnose | **Window Curve** | Leave-one-out and test error against the window |
| Predict | **Classify New Series** | Class of new series at the chosen window |
| Compare | **Euclidean vs DTW** | Test error at window 0, the chosen window and unconstrained, with the default rate |
| Interpret | **Nearest Training Series** | Closest series, classes and DTW distances |

The code for series comes from [Bagge Carlson (2024)](#ref-Car2024a).

## References

<a id="ref-Car2024a"></a>Bagge Carlson, F. (2024). DynamicAxisWarping.jl: Dynamic Time Warping and Related Algorithms in Julia. [GitHub](https://github.com/baggepinnen/DynamicAxisWarping.jl)

<a id="ref-DBKYZ...2019a"></a>Dau, H. A., Bagnall, A., Kamgar, K., Yeh, C.-C. M., Zhu, Y., Gharghabi, S., Ratanamahatana, C. A., & Keogh, E. (2019). The UCR Time Series Archive. *IEEE/CAA Journal of Automatica Sinica* 6(6), 1293-1305. [doi:10.1109/jas.2019.1911747](https://doi.org/10.1109/jas.2019.1911747)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
