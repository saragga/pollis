# Assumptions

## What the Held-Out Data Represent
Every strategy assumes that the relation between training and test sets in the folds mirrors the relation between the data you have and the data the model will be used on.
- **Random k-fold and shuffle splits** assume the observations are **exchangeable**: independent draws from the same population, with no order, grouping or other structure that links them.
- **Group-aware** strategies assume groups are independent of each other, and that the model will be applied to **new groups**.
- **Time-series** strategies assume the process is stable enough over time that the past says something about the future, and that dependence fades with distance in time.
- **Distance-based** strategies assume the distance (Euclidean by default) measures similarity meaningfully, which requires **standardised features**.

## No Leakage
- **Everything learned from data happens inside the fold**: scaling, imputation, feature selection, dimensionality reduction and tuning must be fitted on the training indices only. Fitting them on all rows first leaks information from the test folds, and the score becomes optimistic.
- **No shared entities** across train and test when the target is new entities, and **no training on the future** when the target is forecasting. The Leakage Check tests all three.

## Size
- **Each training fold should be close to the full sample** in size, or the score is pessimistic for a model fitted to all the data; 5 or 10 folds is the usual compromise.
- **Each test fold should be large enough** for its score to mean something; with very few observations, leave-one-out or repeated k-fold.
- **Stratification** of a continuous response bins it into quantiles; it preserves the distribution, it does not balance an imbalanced dataset.

## Independence of the Scores
The fold scores are correlated, because their training sets overlap: their standard deviation divided by the square root of k understates the uncertainty of the mean.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
