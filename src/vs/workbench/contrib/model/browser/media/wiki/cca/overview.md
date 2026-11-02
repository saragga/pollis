# Overview

Canonical correlation analysis looks at two sets of variables measured on the same units, and finds the patterns they share. The panel offers the classical method and two relatives for harder data.

## What Canonical Correlation Analysis Does

Given a matrix X and a matrix Y with the same rows, the method finds a weighted sum of the columns of X and a weighted sum of the columns of Y, with the highest possible correlation between them. It then seeks a second pair, uncorrelated with the first, and so on. [Hotelling (1936)](#ref-Hot1936a) introduced the idea. The result is a short list of correlations, and two sets of weights that say which variables drive each pair. No variable is singled out as a response, as the two sets play equal roles.

## When Two Sets of Variables Call for It

The method fits a question about how two blocks relate, rather than how one variable depends on others. Common examples are attitudes and behaviour, soil and plants, or genes and traits. Plain regression handles only one response at a time, and many separate correlations between the columns are hard to read and pile up tests. Canonical analysis condenses the whole cross-correlation pattern into a few dimensions. [Anderson (2003)](#ref-And2003a) gives its theory within multivariate statistics.

## How the Three Tabs of the Canonical Correlation Panel Differ

| Tab | Maximises | Suits |
|---|---|---|
| **CCA** | Correlation | Many more rows than columns |
| **Regularised CCA** | Correlation, with ridge-shrunk covariances | Many or collinear columns |
| **PLS** | Covariance | Columns near or above the number of rows |

**CCA** calls `MultivariateStats.jl`, and the other two tabs write their steps out with a singular value decomposition, so that each can be read and changed.

## Which Data the Panel Uses by Default

The default uses the Wine data from `PollisDatasets.jl`. **X (n × p)** holds seven phenolic and colour measurements, and **Y (n × q)** six other chemical measurements, on 161 wines. Every tenth wine is held aside as `X_new` and `Y_new`, for **Transform New Data**. To use other data, enter the names of two matrices, with rows as observations and the rows of X and Y referring to the same units. Each tab returns `rho`, the correlation of each pair, `Zx` and `Zy`, the variates, and `m`, which holds weights and projections.

## A Common Workflow for Canonical Correlation

1. Run **CCA**, and read **Canonical Correlations**.
2. Use **vs Permuted Y** and **Bartlett Test** to see how many dimensions stand out from chance.
3. Use **Held-Out Correlations** to check for overfitting.
4. If it overfits, move to **Regularised CCA**, and set **lambda (ridge)**.
5. Use **Redundancy Index** to see how much variance is really shared.
6. Use **Structure Correlations** to name each dimension.

## References

<a id="ref-And2003a"></a>Anderson, T. W. (2003). *An Introduction to Multivariate Statistical Analysis*, 3rd ed. Wiley.

<a id="ref-Hot1936a"></a>Hotelling, H. (1936). Relations between two sets of variates. *Biometrika* 28(3–4), 321–377. [doi:10.1093/biomet/28.3-4.321](https://doi.org/10.1093/biomet/28.3-4.321)

## See Also

- [Factsheet](factsheet.md) · [CCA](cca.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
