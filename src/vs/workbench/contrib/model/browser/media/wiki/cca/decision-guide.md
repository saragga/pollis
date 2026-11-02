# Decision Guide

The choice among the tabs depends mainly on the shape of the data. Whether to use a two-block method at all depends on the question.

## Which Canonical Correlation Tab Fits the Data

| Situation | Tab | Why |
|---|---|---|
| n well above p + q, low collinearity | **CCA** | Exact, and scale invariant |
| Moderate n, or collinear columns | **Regularised CCA** | Ridge stabilises the directions |
| p or q near or above n | **PLS** or **Regularised CCA** | No inverse, or a shrunk one |
| The goal is prediction, and large variance matters | **PLS** | Maximises covariance |
| The goal is a link, regardless of variance | **CCA** or **Regularised CCA** | Maximises correlation |

## When to Use a Two-Block Method at All

Use one when two sets each form a conceptual block, and when the link between blocks is the question. If one block is a true response and the other a set of predictors, multivariate regression may answer more directly. If the goal is to summarise one block, principal components are the right tool, since canonical variates are not built to explain variance inside a block. For more than two blocks, generalised forms exist. [Hardoon, Szedmak and Shawe-Taylor (2004)](#ref-HSS2004a) review some extensions, and also cover kernel forms.

## How to Choose the Ridge Penalty

Use **Held-Out Correlations** with a range of values, on a log scale, such as 0.001, 0.01, 0.1, 1 and 10, and repeat over several random splits. Choose the value where the held-out correlation is highest and stable. With standardised data, a value near 1 is already large compared with the variances. A large lambda moves the result towards **PLS**, and a value of 0 recovers **CCA**. Separate penalties for the two sets are possible with a small change in the code. A penalty chosen on held-out rows gives a slightly optimistic score on those rows.

## When to Standardise

Standardise when variables have different units, which is the usual case. Keep raw scale only when units are shared and variance is meaningful, such as with spectra measured on the same instrument. The choice has no effect on the correlations in **CCA**, but it can change **Regularised CCA** and **PLS** results substantially. Report which was used, and standardise new rows with training means and standard deviations, as the code's `px` and `py` functions do. Rescaling test rows on their own values is a common and avoidable error.

## How to Handle Sparse or High-Dimensional Data

Ridge forms keep all variables in the weights, which can be hard to interpret with many columns. When a short list of variables is wanted, a sparse method shrinks small weights to zero, and [Witten, Tibshirani and Hastie (2009)](#ref-WTH2009a) give such a form through a penalised matrix decomposition. Alternatively, reduce each block to a few principal components before a classical fit, at the risk of dropping a small signal that matters for the link. Any screening must be repeated inside a held-out check, or the check will be flattered.

## What to Report from a Canonical Correlation Study

Report n, p and q, the scaling, and the tab with its penalty. Give correlations with a chance level or a test, held-out values, and redundancy in both directions. Show structure correlations with weights, and name dimensions cautiously. **Compare Dimensions** gives the numbers for a table. Mention any grouping that may have created the link. A statement based on the first correlation alone can mislead, which is the concern behind the index of [Stewart and Love (1968)](#ref-SL1968a).

## References

<a id="ref-HSS2004a"></a>Hardoon, D. R., Szedmak, S. and Shawe-Taylor, J. (2004). Canonical correlation analysis: an overview with application to learning methods. *Neural Computation* 16(12), 2639–2664. [doi:10.1162/0899766042321814](https://doi.org/10.1162/0899766042321814)

<a id="ref-SL1968a"></a>Stewart, D. and Love, W. (1968). A general canonical correlation index. *Psychological Bulletin* 70(3), 160–163. [doi:10.1037/h0026143](https://doi.org/10.1037/h0026143)

<a id="ref-WTH2009a"></a>Witten, D. M., Tibshirani, R. and Hastie, T. (2009). A penalized matrix decomposition, with applications to sparse principal components and canonical correlation analysis. *Biostatistics* 10(3), 515–534. [doi:10.1093/biostatistics/kxp008](https://doi.org/10.1093/biostatistics/kxp008)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [CCA](cca.md)
