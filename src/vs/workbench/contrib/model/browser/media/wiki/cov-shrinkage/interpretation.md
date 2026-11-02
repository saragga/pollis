# Interpretation

A regularised covariance is a deliberately biased estimate, chosen because it has lower error overall. Single entries differ from sample values by design, so the matrix is best read through how it will be used.

## How to Read the Regularised Estimate Itself

`S` is a p x p symmetric matrix on the scale of **X (n × p)**. Its entries should not be read as unbiased estimates of individual covariances, since each has been moved towards a structure or away from extreme values. A correlation that looks weaker than in `S_sample` may reflect shrinkage and not the data, and standard tests for correlation no longer apply. The panel gives no standard errors for entries. If they are needed, bootstrap whole rows and estimate again each time, as the Bootstrap Resampling panel does for other statistics.

## How to Read the Eigenvalue Shrinkage Map

**Eigenvalue Shrinkage Map** plots each sample eigenvalue against the eigenvalue of the estimate at the same rank, with a dashed line for no shrinkage.

| Pattern | Reading |
|---|---|
| A straight line, flatter than the diagonal | Linear shrinkage towards a common level |
| A curve, with some points close to the diagonal | **Nonlinear**, shrinking by different amounts |
| A few points close to the diagonal, others flat | **Woodbury**, keeping spikes and flattening the rest |
| Points close to the diagonal throughout | Little regularisation, possibly because n far exceeds p |

Under **Linear** with a non-scalar target, or under **Biweight**, eigenvectors change as well, so the map is only a partial account.

## What Correlation Changes Show

**Correlation Changes** plots estimated minus sample correlations. A uniform pattern, with strong pairs reduced and weak ones raised, is the mark of shrinkage to a constant correlation. Under a diagonal target, all correlations fall towards zero in proportion to their size. Large changes under **Biweight** show pairs whose sample correlation depended on extreme values, which may be the most informative part of the map. Under the shrinkage tabs, large changes in only a few pairs are less expected and deserve a look at the data.

## How to Read Precision and Partial Correlations

**Precision and Partial Correlations** inverts `S` and shows the partial correlation of each pair given all other variables. This is the step that benefits most from regularisation, since inversion magnifies noise from small eigenvalues. Even so, shrinkage does not set entries to zero, so small values do not prove conditional independence, and the panel attaches no test to them. A sparse estimator would be needed to pick out a network of links.

## How to Read Mahalanobis Outlier Scores

**Mahalanobis Outlier Scores** measures how far each row in `X_new` lies from the mean of **X (n × p)**, and it flags p-values under 0.01 by a chi-square with p degrees of freedom. That reference distribution assumes Gaussian data and a known covariance, so flags are a screening device and not a formal test. Heavy tails produce more flags than expected. Scores change across tabs, because each estimate gives different weight to directions of small variance.

## How to Read Minimum-Variance Weights

**Minimum-Variance Weights** gives the portfolio with the lowest variance under `S`, with weights summing to 1, and it needs columns that are asset returns. Negative weights are short positions. The reported `variance` is computed under the same `S`, and so it is likely to be too low compared with what later returns show. Judge the choice of estimator by the variance on returns after the estimation period, not by this figure.

## See Also

- [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
