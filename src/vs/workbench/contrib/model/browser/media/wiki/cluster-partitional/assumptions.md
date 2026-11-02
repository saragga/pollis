# Assumptions

Clustering methods make few formal assumptions, yet each builds in an idea of what a group looks like. A method applied to data that does not fit its idea will still return clusters, and those clusters can look convincing.

## Why Clustering Depends on the Scale of Each Feature

All the tabs measure closeness with Euclidean distance on **Feature Matrix**, so a column with a large range dominates the result. Standardising gives each column equal weight, which is a choice and not a neutral step: if one feature truly matters more, equal weight hides that. Irrelevant columns add noise to every distance and can drown out real structure. Strongly correlated columns count the same information twice. Look at the columns before clustering, and rerun with and without doubtful ones to see whether the partition changes.

## What the Centre-Based Clustering Tabs Assume About Shape

**K-Means** and **Fuzzy C-Means** favour compact and roughly spherical clusters of similar spread, since each point goes to the closest centre and the boundary between two clusters is a straight line. Elongated groups get cut across, and a large cluster can be split while two small ones merge. **K-Medoids** has the same preference for compact groups, though it is less affected by extreme values. The check is visual: **Cluster Scatter** and **Silhouette Analysis** can reveal long or curved shapes, and a clear gain from **DBSCAN** or **Spectral** points the same way.

## What DBSCAN Assumes About Density

**DBSCAN** assumes that clusters are regions of similar density separated by sparser regions. One **epsilon** and one **min_pts** apply everywhere, so a sparse cluster can dissolve into noise while dense ones merge. Distances also tend to become similar as the number of columns grows, so a useful density threshold becomes harder to find in many dimensions. If the k-distance plot from **Choosing k or Epsilon** shows no clear knee, the data may not have a single density level, or may need fewer dimensions first.

## What GMM Assumes About the Components

**GMM** treats the data as draws from a mixture of normal distributions, so each cluster is taken to be Gaussian. BetaML.jl documents diagonal Gaussians as its default, in which each component has its own variances but no correlation between features, so a tilted ellipse needs several components or a full covariance through the `mixtures` keyword of `GaussianMixtureClusterer`. A skewed or heavy-tailed cluster may be split into pieces, as extra components can improve the fit without being separate groups.

## What Spectral Clustering Assumes About the Similarity Graph

**Spectral** assumes that clusters are well connected internally and weakly connected to each other, under the similarity chosen. **sigma** decides that: too small leaves points isolated, and too large connects everything, and in both cases the eigenvectors stop reflecting the groups. Connected noise between two clusters can join them. The method also needs an eigendecomposition of an n by n matrix, so its cost and memory limit how many observations can be handled.

## Why Clustering Needs Real Structure in the Data

No tab tests whether clusters exist in the first place. Uniform noise split by **K-Means** gives tidy groups of about equal size. **vs Random Labels** compares against shuffled labels, which only shows that the partition beats a random one on the same points. A stronger check compares against data simulated with no clusters, as in the gap statistic of [Tibshirani, Walther and Hastie (2001)](#ref-TWH2001a), which the panel does not provide. Observations are also treated as exchangeable, so repeated measures on one subject or autocorrelated series can create apparent groups that merely reflect that dependence.

## References

<a id="ref-TWH2001a"></a>Tibshirani, R., Walther, G. and Hastie, T. (2001). Estimating the number of clusters in a data set via the gap statistic. *Journal of the Royal Statistical Society Series B* 63(2), 411–423. [doi:10.1111/1467-9868.00293](https://doi.org/10.1111/1467-9868.00293)

## See Also

- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Cluster Evaluation](cluster-evaluation.md)
