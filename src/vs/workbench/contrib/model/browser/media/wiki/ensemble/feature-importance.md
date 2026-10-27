# Feature Importance

Feature importance ranks the features by how much the model relies on them. The panel offers two kinds.

## Built-in Importance
Each library measures importance in its own way, so the numbers cannot be compared across methods:

| Method | Measure |
|---|---|
| Random Forests | Mean decrease in impurity (Gini or variance) at the splits on the feature |
| Gradient Boosting | Total gain of the splits on the feature, as a share of the total |
| XGBoost | Average gain of the splits that use the feature |
| Differentiable DT | Mean absolute gradient of the outputs with respect to the feature, times its standard deviation, as a share of the total |

Split-based measures are computed on the training data and favour features with many distinct values. The Differentiable DT measure, added in the Pollis fork of NeuroTreeModels.jl, is computed with the network in evaluation mode, and is scaled by the standard deviation so that a feature's unit does not change its rank.

## Permutation Importance
For each feature, the values in the **test set** are shuffled and the test metric recomputed: the lost accuracy, or the added RMSE, is the importance. It is model-agnostic, so it compares features across methods, and it is computed on held-out data, so it measures what helps prediction, not what helps fit the training data.

Two caveats:
- **Correlated features share their importance**: when two features carry the same information, shuffling one costs little because the other remains. Both look unimportant.
- **The shuffle is random**: repeat it, or average several shuffles, before reading small differences.

## What Importance Does Not Say
Importance has no sign: it does not say whether a feature raises or lowers the prediction (use partial dependence or Shapley values). And it describes the model, not the world: an important feature is useful for prediction, not necessarily a cause.

## See Also
- [SHAP Values](shap.md) · [Interpretation](interpretation.md) · [Random Forests](random-forests.md)
