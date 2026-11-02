# Cophenetic Correlation

The cophenetic correlation measures how faithfully a hierarchical tree preserves the original pairwise distances. The **Cophenetic Correlation** action of the Hierarchical Clustering panel computes it for the current tab.

## What Cophenetic Correlation Computes

The cophenetic distance C(i, j) between two observations is the height of the merge at which they first join the same group. The cophenetic correlation is the Pearson correlation between D(i, j) and C(i, j) over all pairs i < j, where D is the original dissimilarity. [Sokal and Rohlf (1962)](#ref-SR1962a) introduced the comparison to judge dendrograms objectively. A value of 1 would mean that the tree heights are an exact linear function of the distances. The panel's own function `cophenetic` fills the matrix from `hc.merges` and `hc.heights`, and then the action takes `cor` over the upper triangles of `D` and C.

## How to Read a Cophenetic Correlation Value

A high value says the tree is a fair summary of the distances. A low value says the tree distorts them, so reading structure from its heights is unsafe. The measure has no accepted threshold, and values depend on the dimension, the metric and the sample size. The action is best used to compare trees built from one `D`. The statistic applies to the whole tree. It does not depend on **k**, it does not assess the clusters of a particular cut, and it does not test whether groups exist.

## Why Cophenetic Correlation Differs Between Linkages

Linkage rules build heights differently, and the correlation inherits those differences. **Average** builds each height as a mean of distances, and [Farris (1969)](#ref-Far1969a) argued that UPGMA, the method behind this tab, tends to maximise the coefficient. **Ward** heights grow with group size, so they are not distances between observations and usually correlate less with `D`. **Single** and **Complete** report one extreme pair, so they squeeze or stretch the scale. In a simulation on multivariate normal data, [Saraçli, Doğan and Doğan (2013)](#ref-SDD2013a) recommended **Average** with small samples and the centroid method, which the panel lacks, with larger ones.

## Where Cophenetic Correlation Misleads

A high cophenetic correlation does not mean good clusters. One remote group creates many large distances that the tree reproduces easily, which raises the correlation even when the structure inside the main mass is lost. A method that favours the measure, such as **Average**, will score well on it by design, so choosing a linkage by this number alone biases the choice. Pairs are not independent, so the usual significance test for a Pearson correlation does not apply. Any p-value from standard formulas would be misleading.

## What to Use With Cophenetic Correlation

Pair **Cophenetic Correlation** with an action that assesses the flat clusters. **Silhouette Analysis** and **Choosing k** score a cut, while **Merge Heights** shows where the tree has a gap. When tabs disagree, trust a reasoned choice of linkage over the larger coefficient. To compare two trees with each other, instead of each with `D`, compute `cor` between the two cophenetic matrices, which is what the original dendrogram comparison was for. The panel has no action for that step, so adapt the code of **Cophenetic Correlation**.

## References

<a id="ref-Far1969a"></a>Farris, J. S. (1969). On the cophenetic correlation coefficient. *Systematic Zoology* 18(3), 279. [doi:10.2307/2412324](https://doi.org/10.2307/2412324)

<a id="ref-SDD2013a"></a>Saraçli, S., Doğan, N. and Doğan, İ. (2013). Comparison of hierarchical cluster analysis methods by cophenetic correlation. *Journal of Inequalities and Applications* 2013(1), 203. [doi:10.1186/1029-242X-2013-203](https://doi.org/10.1186/1029-242X-2013-203)

<a id="ref-SR1962a"></a>Sokal, R. R. and Rohlf, F. J. (1962). The comparison of dendrograms by objective methods. *Taxon* 11(2), 33–40. [doi:10.2307/1217208](https://doi.org/10.2307/1217208)

## See Also

- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Average Linkage](average.md) · [Ward Linkage](ward.md)
