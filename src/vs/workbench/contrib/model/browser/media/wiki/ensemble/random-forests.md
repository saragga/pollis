# Random Forests

A **random forest** (Breiman, 2001) grows many deep decision trees and combines them: a majority vote for classification, the mean for regression. Two kinds of randomness make the trees differ:

- **Bootstrap samples**: each tree is grown on a sample of the rows drawn with replacement, about two thirds of the distinct rows.
- **Random feature subsets**: at each split, the tree chooses only among a random subset of the features.

Each deep tree has low bias and high variance. Averaging many trees that make different mistakes keeps the low bias and removes most of the variance; the feature subsets matter because trees that all split on the same strong feature would make the same mistakes.

## In the Panel
- `RandomForestClassifier` or `RandomForestRegressor` from DecisionTree.jl, with **n_trees** as the number of trees and **max_depth** as the depth of each tree.
- `predict` gives the vote or the mean; `predict_proba` gives the share of trees voting for each class.
- **Built-in Feature Importance** uses `impurity_importance`: the decrease in Gini impurity (classification) or in variance (regression) at the splits on each feature, averaged over the trees.

## Settings
- **n_trees**: more is never worse, only slower. A few hundred are usually enough for the predictions to stop changing.
- **max_depth**: forests use deep trees, 5 to 20, or unlimited. Shallow trees make a forest underfit.

## Strengths and Limits
- Strong at the default settings, robust to outliers in the features, and insensitive to monotone transformations of them.
- Probabilities are pulled towards the middle: check the calibration plot.
- Impurity importance favours continuous features and features with many distinct values; use permutation importance to compare features.

## See Also
- [Gradient Boosting](gradient-boosting.md) · [Feature Importance](feature-importance.md) · [Decision Guide](decision-guide.md)
