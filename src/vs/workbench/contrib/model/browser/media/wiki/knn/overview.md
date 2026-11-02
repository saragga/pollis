# k-Nearest Neighbours

Points close together tend to behave alike, and nearest-neighbour methods act on that idea with no fitted model. A prediction or a search is answered by finding which stored examples are closest to a query.

## Learning by remembering

Most methods compress training data into coefficients and throw the data away. Nearest-neighbour methods do the reverse: they keep every example and postpone all the work until a query arrives. A new point takes the label or value of its closest stored neighbours.

The rule is simple, but its theory is strong. With enough data, the error of one-nearest-neighbour classification is at most about twice the lowest error any classifier could reach ([Cover and Hart (1967)](#ref-CH1967a)). With two classes and a best possible error of 5%, that bound is 2 × 0.05 × 0.95 = 9.5%. The price comes at prediction time, since each answer needs a search through the stored data, and in the choice of what close means.

## Three tasks in three tabs

**kNN Search** returns the k closest points to a query. **Range Search** returns every point within radius r of it, so the number of results varies. Both work on a matrix of feature vectors with one point per column.

**DTW Classification** treats each item as a whole time series. A new series receives the class of its nearest training series under dynamic time warping, which allows similar shapes to match even when they are shifted or stretched in time.

## Distance decides everything

A nearest-neighbour result is only as sensible as its distance. **Metric** picks a member of the Minkowski family, and for the difference (3, 4) these give different sizes: Manhattan 7, Euclidean 5, Chebyshev 4.

Scale matters as much as the metric. A feature measured in thousands swamps one measured in tenths, however little it matters for the task. The code therefore standardises each feature to mean 0 and standard deviation 1 and places the query on that same scale, so **r** and the reported distances are in standard deviations. **DTW Classification** z-normalises each series to compare shapes rather than levels.

## Fast search with a spatial index

Checking every point takes time proportional to the size of the data for each query, and **Tree type** offers ways to avoid that. A tree groups points so that whole regions can be ruled out without touching them.

A KDTree splits on one coordinate at a time ([Bentley (1975)](#ref-Ben1975a)), and a BallTree nests points in spheres, so it needs only the triangle inequality and works with any true metric ([Uhlmann (1991)](#ref-Uhl1991a)). A BruteTree simply checks every point. All three return the same neighbours apart from ties, so the choice concerns speed, not quality.

## From neighbours to predictions

The tabs return neighbours, and the actions turn them into answers. **kNN Classification** chooses k by leave-one-out accuracy and takes a majority vote, while **kNN Regression** chooses k by leave-one-out error and takes an inverse-distance weighted mean. **Classify New Series** does the same job for whole series.

**Nearest Examples** and **Nearest Training Series** show which stored items produced a prediction, and that traceability is a real strength. Each answer can be justified by pointing at actual cases.

## References

<a id="ref-Ben1975a"></a>Bentley, J. L. (1975). Multidimensional Binary Search Trees Used for Associative Searching. *Communications of the ACM* 18(9), 509-517. [doi:10.1145/361002.361007](https://doi.org/10.1145/361002.361007)

<a id="ref-CH1967a"></a>Cover, T. M., & Hart, P. E. (1967). Nearest Neighbor Pattern Classification. *IEEE Transactions on Information Theory* 13(1), 21-27. [doi:10.1109/TIT.1967.1053964](https://doi.org/10.1109/TIT.1967.1053964)

<a id="ref-Uhl1991a"></a>Uhlmann, J. K. (1991). Satisfying General Proximity / Similarity Queries with Metric Trees. *Information Processing Letters* 40(4), 175-179. [doi:10.1016/0020-0190(91)90074-R](https://doi.org/10.1016/0020-0190(91)90074-R)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
