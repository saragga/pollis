# Interpretation

A cluster number has no meaning of its own, and only the features can give a group a meaning. Interpretation means describing each group, judging how firmly points belong to it, and saying what can and cannot be claimed.

## What Cluster Numbers Mean

Numbers in `labels` are arbitrary. Cluster 1 in one run may be cluster 3 in another, so comparing labels across runs needs the adjusted Rand index and not a direct match. Cluster 0 means noise only in **DBSCAN**. Sizes come from the method as well as the data: **K-Means** often produces groups of similar size, and **DBSCAN** can produce one large cluster with several small ones. A group with few members may be real or may be a set of outliers, and its profile helps to decide.

## How to Read Cluster Profiles

**Cluster Profiles** returns the mean and standard deviation of each feature in each cluster. Means show the typical member, and standard deviations show how tight the group is on that feature. A large standard deviation means the mean describes the group poorly on that feature. With standardised input, means are in units of overall standard deviations, so a value of 1 is one standard deviation over the data's mean. To describe a group in original units, compute the profile on the unscaled columns using the same `labels`.

## How to Read Distinguishing Features

**Distinguishing Features** draws a heat map of (cluster mean - overall mean) / overall standard deviation for each cluster and feature. Dark cells name what sets a cluster apart, and pale cells mean no difference from the whole. Clustering chose the groups to differ on these features, so testing the differences on the same data is circular, and p-values from such tests are not valid. The chart describes the groups that were found and does not show that they exist in a wider population.

## How to Read Surrogate Tree Rules

**Surrogate Tree Rules** fits a decision tree of depth 3 that predicts `labels` from **Feature Matrix**, prints its splits, and reports fidelity, the share of observations the tree places as the clustering did. High fidelity means that a few thresholds describe the partition well, so those rules can stand in for it in explanations. Low fidelity means the clusters are not simple in terms of single features, as often happens with **Spectral**. Fidelity is measured on the same rows that fit the tree, and it measures agreement with the clusters and not correctness.

## How to Read Soft Memberships

**Membership Uncertainty** draws a histogram of each point's largest membership. In **Fuzzy C-Means** these are degrees, set partly by **fuzziness (m)**, and in **GMM** they are posterior probabilities under the fitted mixture. Values near 1 show confident points, and low values sit between clusters. Fuzzy memberships are not probabilities, and they depend on the distance to all centres. With k = 3, a point can have a top value of 0.34 at the least, so read the histogram against 1/k. For the hard tabs, the chart is a formality, with all values at 1 and **DBSCAN** noise at 0.

## How to Assign New Observations to Clusters

**Assign New Data** labels the rows of `X_new`, which must be on the same scale as **Feature Matrix**. Centre-based tabs use the nearest centre or medoid, and **GMM** uses posterior probabilities. **DBSCAN** and **Spectral** have no such rule, so the step gives the label of the nearest training point. For **DBSCAN** this differs from the method's definition, since a far-away point would be noise there but still receives a label here, so check its distance to that neighbour. New labels do not update the clusters, and a shift in new data will not show up in them.

## How to Report a Clustering Result

State the features and scaling used, the tab and its settings, how **k** or **epsilon** was chosen, and the stability obtained. Say that the groups are one useful division and describe them through their features. Avoid naming them as natural types unless evidence from outside the clustering supports that, such as a relation to an outcome not used in the fit, or a repeat on independent data.

## See Also

- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Cluster Evaluation](cluster-evaluation.md)
