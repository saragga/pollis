# k-Nearest Neighbours Assumptions

No fitted model means no coefficients to check, though nearest-neighbour methods still make assumptions. Those concern distance, scale, density and how the stored data relate to future queries.

## Closeness must mean similarity

The whole method rests on points that are near in the chosen distance having similar labels or values. Nothing in the code can test that claim in advance. If a label depends on a feature absent from the matrix, or on some interaction the distance cannot see, neighbours are simply unrelated cases.

Every feature also counts equally after standardising. An irrelevant feature adds noise to all distances, and it pushes genuinely similar points apart. Unlike a regression, a nearest-neighbour rule cannot assign it a coefficient near zero, so removing or down-weighting useless features matters a great deal.

## Features on a sensible common scale

The code divides each feature by its standard deviation, computed on the same matrix. A feature with zero variance gives a division by zero and fills the standardised matrix with invalid values, so constant columns have to be dropped first.

Standardising treats a one-sd move as equal across features, which is a choice and not a fact. Long-tailed features have a standard deviation inflated by a few extreme values, which shrinks everyone else's differences on that feature. A log transform may suit them better. Binary and categorical codes also sit awkwardly in a Minkowski distance, and a suitable metric or an encoding should be considered. Missing values must be handled before the search, since any distance to them is undefined.

## Dense data in few dimensions

Neighbours are local only when they are actually near. In a unit cube, a neighbourhood holding 1% of uniform points needs edge length 0.01^(1/d): 0.1 in 2 dimensions, 0.63 in 10 and 0.95 in 100. In high dimensions, a neighbourhood stops being local at all.

Under broad conditions, the distance to the nearest point and to the farthest point become almost equal as dimensions grow ([Beyer, Goldstein, Ramakrishnan and Shaft (1999)](#ref-BGRS1999a)). That removes the meaning of near. Real data often live on a lower-dimensional surface and so behave better than their column count suggests, but the risk should be checked and not assumed away.

## Queries that resemble the stored data

A prediction is a local average, so a query outside the range of the data receives the values of the nearest edge points, however far away those are. No warning appears, and the distances are the only sign of trouble.

The stored data also act as the population. If class shares in the training set differ from future data, then majority votes inherit that imbalance. Stored points that have gone stale stay just as influential as fresh ones. **kNN Classification** and **kNN Regression** both assume each point is its own first neighbour, so exact duplicates in the data can break that leave-one-out step.

## Series aligned by warping

**DTW Classification** assumes classes differ in shape, and that timing differences within the window carry no class information. If when something happens is exactly what defines a class, warping removes the signal, and a narrow window or plain Euclidean distance is the right tool.

Z-normalising each series removes level and scale, so classes that differ only in level become indistinguishable. All series must also have the same length L, since `Xtrain` is a matrix. The tuning method assumes that the training set is large enough to rank windows, a point [Dau, Bagnall, Kamgar, Yeh, Zhu, Gharghabi, Ratanamahatana and Keogh (2019)](#ref-DBKYZ...2019a) illustrate with small training sets.

## References

<a id="ref-BGRS1999a"></a>Beyer, K., Goldstein, J., Ramakrishnan, R., & Shaft, U. (1999). When Is "Nearest Neighbor" Meaningful? In *Database Theory: ICDT 99*, 217-235. Springer. [doi:10.1007/3-540-49257-7_15](https://doi.org/10.1007/3-540-49257-7_15)

<a id="ref-DBKYZ...2019a"></a>Dau, H. A., Bagnall, A., Kamgar, K., Yeh, C.-C. M., Zhu, Y., Gharghabi, S., Ratanamahatana, C. A., & Keogh, E. (2019). The UCR Time Series Archive. *IEEE/CAA Journal of Automatica Sinica* 6(6), 1293-1305. [doi:10.1109/jas.2019.1911747](https://doi.org/10.1109/jas.2019.1911747)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
