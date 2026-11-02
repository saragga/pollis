# k-Nearest Neighbours Diagnostics

A nearest-neighbour search always returns something, and so these checks ask whether the result is meaningful. They look at the index, the radius, the choice of k and, for series, the warping window.

## Is the tree finding the true neighbours?

**Exactness Check** runs the query on `BruteTree` and on the current tree, then returns `true` when both index lists match. All three trees perform exact search, so `false` is unusual and worth inspecting.

The usual cause is a tie. When two points lie at the same distance, the two searches may list them in a different order, or return a different one at the edge of the k. Repeated values in the data make this more likely. Compare the distances if the check fails: identical distances with different indices mean a harmless tie. The check tests only the single query passed in, so it is a spot check and not a proof.

## Reading the k-distance curve

**k-Distance Curve** sorts every point's distance to its k-th neighbour, measured in standard deviations. The left part shows points in dense regions, and the far right shows isolated points. An elbow where the curve lifts sharply is the classic guide for a radius in DBSCAN, an idea from [Ester, Kriegel, Sander and Xu (1996)](#ref-EKSX1996a).

Use the elbow value as a first **r**: most points then have at least k neighbours inside it, and the outliers do not. A smooth curve with no elbow says that the data have no clean density scale, so no single radius will separate clusters from noise. Uniform random data, the default, look like that. A very steep end picks out candidate outliers worth a look on their own.

## Is the query inside the data?

Compare `dists` with the k-distance values. A query whose nearest-neighbour distance sits in the far tail of the curve is further from the data than nearly any stored point is from its own neighbours, so a prediction there is an extrapolation.

**Query and Neighbours** gives a visual check for the first two features: neighbours spread widely around the query suggest sparse territory. With more than two features the plot is a projection, so neighbours may look far apart when they are close on other features. For **Range Search**, an empty result says the same thing more directly, as does a count far from what you expected.

## Choosing k without fooling yourself

**kNN Classification** and **kNN Regression** report a leave-one-out score across k. Look at the whole shape. A smooth curve with a broad good range gives a safe choice, and a single spike is likely luck.

Leave-one-out error tends to be optimistic after the best k has been picked, since the choice was made on the same data. Hold out a separate test set if the figure will be reported. Very small best k suggests little noise or strong locality. A best k at the end of the range suggests that a simple global model may be enough, or that the range should grow. Both actions start with synthetic targets, so replace `labels` or `y` first.

## Is warping helping?

**Window Curve** plots leave-one-out and test error against the window. A window 0 point that is as good as the rest says warping adds nothing here, so plain Euclidean distance is enough and far cheaper.

The two curves often disagree on the best window, especially with small training sets. A training curve that is flat or jagged means the chosen window is partly chance. Avoid selecting the window from the test curve, since that makes the reported test error optimistic. **Euclidean vs DTW** then sets the error at window 0, the chosen window and unconstrained beside the default rate, the error of always predicting the largest class. An error near the default rate means the classifier has found little.

## Is one tree really faster?

**Tree Types** benchmarks query time for the three trees on your data. A small table is worth reading before accepting the default, for trees do not always win. With few points or many dimensions, the pruning rules out little, and BruteTree can be the fastest.

The benchmark covers queries alone, whereas a tree also takes time to build. For a one-off query, building may cost more than a brute search, while for many queries the build pays for itself. **leaf_size** shifts the same balance, and it is rarely worth tuning unless query speed is the bottleneck.

## References

<a id="ref-EKSX1996a"></a>Ester, M., Kriegel, H.-P., Sander, J., & Xu, X. (1996). A Density-Based Algorithm for Discovering Clusters in Large Spatial Databases with Noise. In *Proceedings of the Second International Conference on Knowledge Discovery and Data Mining*, 226-231. [PDF](https://www.dbs.ifi.lmu.de/Publikationen/Papers/KDD-96.final.frame.pdf)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
