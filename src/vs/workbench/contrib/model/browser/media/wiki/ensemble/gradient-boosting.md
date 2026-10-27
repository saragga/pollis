# Gradient Boosting

**Gradient boosting** (Friedman, 2001) builds a model one tree at a time. It starts from a constant; at each round it computes the gradient of the loss for every observation (for squared error, simply the residuals), fits a shallow tree to those gradients, and adds the tree to the model, multiplied by the **learning rate**. Each tree corrects what the trees before it got wrong.

Where a random forest averages independent trees to lower variance, boosting adds dependent trees to lower bias. It is usually the most accurate method on tabular data, but it can overfit, so its settings matter more.

## In the Panel
- `EvoTreeClassifier` or `EvoTreeRegressor` from EvoTrees.jl, a pure-Julia implementation with histogram-based splits, so it is fast on large data.
- **n_trees** is the number of boosting rounds, **max_depth** the depth of each tree, **eta** the learning rate (shrinkage).
- Classification minimises the multiclass log-loss, regression the squared error.
- **Built-in Feature Importance** uses `EvoTrees.importance`: the total gain of the splits on each feature, as a share of the total.

## Settings
- **eta**, the learning rate: smaller values (0.01 to 0.1) generalise better but need more rounds.
- **n_trees**: increase until the validation metric stops improving; past that, the model overfits.
- **max_depth**: 3 to 8. Depth sets how many features one tree can combine: depth 2 captures pairwise interactions.

## Strengths and Limits
- The best accuracy on most tabular problems once tuned.
- Sensitive to the number of rounds: always compare the training and test metrics.
- Probabilities are often over-confident: check the calibration plot.

## See Also
- [XGBoost](xgboost.md) · [Random Forests](random-forests.md) · [Diagnostics](diagnostics.md)
