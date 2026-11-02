# Assumptions

Hierarchical clustering needs no probability model, but its result rests on several choices about distance and structure. When one of them fails the panel still returns a tree and labels, so the failure has to be looked for.

## What Hierarchical Clustering Assumes About Distances Between Observations

Every result in the panel derives from the dissimilarity matrix `D`, so a small value in `D` must mean that two observations are alike for the purpose at hand. **Euclidean** and **Chebyshev** read magnitudes, **Manhattan** sums absolute differences, and **Cosine** reads direction and ignores length. Two metrics can yield different trees from one matrix, and no output in the panel says which metric suits the subject. That judgement comes from knowledge of the features. To see how much the choice matters, rerun **Complete** or **Average** with another **Distance** and compare the labels with `randindex`.

## How Feature Scale Affects Hierarchical Clustering

A feature with a large numerical range dominates **Euclidean**, **Manhattan** and **Chebyshev** distances, whatever its importance. The panel standardises the columns of its default `X_train`, using training means and standard deviations, but it does not touch a matrix you supply. Standardising is itself a choice: it gives each column equal variance, which can dilute a feature whose large variance reflects a real separation. Noise columns weigh as much as informative ones after standardising. Comparing the clusters with and without a suspect column shows whether that column drives the result.

## Whether Nested Groups Exist in Data Used for Hierarchical Clustering

A tree imposes nesting: each cluster at one level must be a union of clusters from the next. Overlapping groups, or groupings that cut across each other, cannot be represented. Data with no groups at all also receives a dendrogram with an apparent structure. The panel has no formal test for this. One check you can run yourself is to shuffle each column of `X` independently, which destroys the joint structure, then repeat the fit and compare the mean silhouette and the merge heights with those of the real matrix. Clusters are doubtful when the two look alike.

## What Outliers and Noise Do to Hierarchical Clustering

Linkages do not respond alike to disturbance. [Milligan (1980)](#ref-Mil1980a) perturbed simulated data in six ways and found hierarchical methods differentially sensitive to the type of perturbation. A single outlier can lengthen a **Complete** merge, and a bridge of noise points can join two groups under **Single**. Outliers often show up as very small clusters, which **Linkage Comparison** reports as the smallest cluster size, and as isolated leaves joining late in **Dendrogram**. Removing them changes the tree, so report both versions when you do so.

## Which Distance Ward Linkage Requires in the Panel

The **Ward** criterion is defined on squared Euclidean distances, because it measures growth in a sum of squares around a centroid. The **Ward** tab therefore has no **Distance** input and always uses **Euclidean**. [Murtagh and Legendre (2014)](#ref-ML2014a) show how implementations differ in what they feed to the criterion. Applying the criterion to a general dissimilarity is outside what the panel does. When only a non-Euclidean dissimilarity makes sense for the subject, use **Complete** or **Average** instead.

## Why the Number of Clusters in a Hierarchical Tree Is Not Estimated

The panel treats **k** as an input. **Merge Heights** and **Choosing k** are heuristics and no estimator lies behind them. The review by [Milligan and Cooper (1985)](#ref-MC1985a) tested 30 procedures for determining the number of clusters, found a wide range of ability among them, and warned that performance may depend on the data. A value of **k** is thus best supported by several indications together, and by whether the resulting clusters mean something in the subject.

## References

<a id="ref-Mil1980a"></a>Milligan, G. W. (1980). An examination of the effect of six types of error perturbation on fifteen clustering algorithms. *Psychometrika* 45(3), 325–342. [doi:10.1007/BF02293907](https://doi.org/10.1007/BF02293907)

<a id="ref-MC1985a"></a>Milligan, G. W. and Cooper, M. C. (1985). An examination of procedures for determining the number of clusters in a data set. *Psychometrika* 50(2), 159–179. [doi:10.1007/BF02294245](https://doi.org/10.1007/BF02294245)

<a id="ref-ML2014a"></a>Murtagh, F. and Legendre, P. (2014). Ward's hierarchical agglomerative clustering method: which algorithms implement Ward's criterion? *Journal of Classification* 31(3), 274–295. [doi:10.1007/s00357-014-9161-z](https://doi.org/10.1007/s00357-014-9161-z)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Ward Linkage](ward.md) · [Single Linkage](single.md)
