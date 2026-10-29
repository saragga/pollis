# Interpretation

## The CV Score
The mean test RMSE across folds estimates the prediction error of the **procedure**: a model of this kind, fitted to about (k - 1)/k of the data, predicting observations like those held out. With 5 or 10 folds it is slightly pessimistic for the model fitted to all the data, which has more observations to learn from.

## Its Uncertainty
The standard deviation of the fold scores shows how much the score depends on the partition, but the naive standard error (that standard deviation over the square root of k) is **optimistic**: the folds share most of their training data, so their scores are correlated. Repeating the cross-validation with other seeds shows the sensitivity to the partition; it does not make the folds independent.

## Compare Strategies
**Compare Strategies** scores the same model with k-fold and with ShuffleSplit (k resamples of 80% train and 20% test). For exchangeable data the two should give similar means; the resamples can evaluate some observations several times and others never. Large differences between strategies mean the data have structure (groups, time) that one of them ignores.

## Optimism Bias
**Optimism Bias** is the out-of-sample RMSE minus the in-sample RMSE: how much the training error understates the error on new data. A small optimism means the model is not overfitting; a large one, that it learns noise, and a simpler or regularised model may predict better.

## Comparing Models
When comparing models, use **the same folds** for each, and compare their scores fold by fold: the differences are much less noisy than the scores themselves.

## Nested CV
In **nested CV**, the outer folds estimate the error of the whole procedure **including the tuning**: each outer training set is split again by the inner folds to choose the hyperparameters. The inner scores choose; only the outer scores estimate.

## Distance-Based Splits
The test score of a Kennard-Stone or SPXY split describes prediction on the samples left inside the covered region. It is not an estimate of prospective performance, and studies have found it can be either pessimistic (with small training sets) or optimistic (with large ones).

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
