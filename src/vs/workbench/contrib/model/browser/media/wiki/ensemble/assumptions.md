# Assumptions

Tree ensembles make few assumptions about the shape of the relation between features and target, but they still rest on the data.

## All Methods

- **Independent observations**, from the same population as the data you will predict on. Repeated measurements of one subject, or rows ordered in time, break the random split into training and test sets: the test metric becomes optimistic. Split by subject or by time instead.
- **The test set is untouched.** Every setting chosen by looking at the test metric (the number of trees, the depth, the learning rate) leaks it into the model. Tune on a validation split or by cross-validation, and keep the test set for the final number.
- **Numeric features.** The panel takes a numeric matrix: encode categorical features as integers (trees handle ordinal codes well) or as one column per level.
- **No extrapolation needed.** A tree predicts a constant in each leaf, so beyond the training range the prediction is flat.

## Random Forests

- Enough **independent signal across features**: the random feature subsets decorrelate the trees only if several features carry information.
- Impurity importance is **biased towards continuous features** and features with many distinct values; prefer permutation importance to compare features.

## Gradient Boosting and XGBoost

- The **number of rounds and the learning rate go together**: a smaller learning rate needs more rounds. Too many rounds overfit; watch the gap between training and test metrics.
- **Shallow trees** (depth 3 to 8): each tree only needs to correct the current errors.

## Differentiable DT

- **Scaled inputs and target.** Training is by gradient descent: the panel standardises the regression target and scales the predictions back, and the network starts with batch normalisation of the features.
- **Enough data and epochs** for gradient descent to converge; on small data sets it is often less accurate than boosting.

## See Also
- [Diagnostics](diagnostics.md) · [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md)
