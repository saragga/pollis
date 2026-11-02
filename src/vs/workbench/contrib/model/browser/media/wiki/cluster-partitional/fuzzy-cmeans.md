# Fuzzy C-Means

**Fuzzy C-Means** lets each observation belong to all the clusters at once, in degrees that add up to 1 across clusters. It suits data in which groups shade into each other and a single label would hide the borderline cases.

## What Fuzzy C-Means Computes

The method of [Bezdek, Ehrlich and Full (1984)](#ref-BEF1984a) minimises J = sum over i and j of u_ij^m ||x_i - c_j||^2, where u_ij is the membership of point i in cluster j and m is the fuzziness. Two updates alternate. Each centre c_j becomes the mean of all the points, weighted by u_ij^m. Each membership then becomes u_ij = 1 / sum over l of (d_ij / d_il)^(2 / (m - 1)), with d_ij the distance from point i to centre j. As m falls towards 1 the memberships approach hard labels, and as m grows they approach 1/k for every point.

## How the Fuzzy C-Means Tab Is Set Up

| Input | Default | Role |
|---|---|---|
| **Feature Matrix** | none | n by p data, with observations in rows |
| **k** | 3 | Number of clusters |
| **fuzziness (m)** | 2.0 | Softness of the memberships, greater than 1 |
| **max_iter** | 300 | Limit on update passes |

The code calls `fuzzy_cmeans(Xt, k, m; maxiter = max_iter)`, and the tolerance stays at the package default of 1e-3. `result.weights` is an n by k matrix of `memberships`, with rows that add up to 1. `labels` takes the largest membership in each row, so the hard-label steps work here too. `result.centers` holds the centres.

## Where Fuzzy C-Means Works Well

Soft memberships flag observations that sit between clusters, which **Membership Uncertainty** displays directly. Where a group boundary is a matter of degree, as with mixed customer habits or graded biological types, the degrees can be more honest than hard labels. Centres are weighted by membership, so ambiguous points pull on them less than they would in **K-Means**. Each pass has the same order of cost as **K-Means**, multiplied by a small constant.

## Where Fuzzy C-Means Misleads

Memberships are relative, because they compare distances between centres. A far-off outlier can still get a membership close to 1 in its nearest cluster, or about equal memberships when centres are about equally far, so a high degree does not mean that a point is typical. Fuzzy degrees are not probabilities, and no model stands behind them. **fuzziness (m)** has no value that is correct on its own, and at m = 2 in many dimensions memberships can flatten near 1/k with centres collapsing together. The preference for round groups is the same as in **K-Means**.

## What to Compare Fuzzy C-Means With

| Concern | Compare with | What to look for |
|---|---|---|
| Whether softness changes the partition | **K-Means** | High **Agreement with K-Means** with few borderline points |
| Whether degrees should be probabilities | **GMM** | Memberships that differ for the same points |
| Whether **fuzziness (m)** drives the story | The same tab at other values of m | Whether `labels` stay the same while degrees shift |

Run each comparison at the same **k**, so that only the method differs.

## References

<a id="ref-BEF1984a"></a>Bezdek, J. C., Ehrlich, R. and Full, W. (1984). FCM: The fuzzy c-means clustering algorithm. *Computers & Geosciences* 10(2-3), 191–203. [doi:10.1016/0098-3004(84)90020-7](https://doi.org/10.1016/0098-3004(84)90020-7)

## See Also

- [K-Means](kmeans.md) · [Gaussian Mixture Models](gmm.md) · [Interpretation](interpretation.md)
