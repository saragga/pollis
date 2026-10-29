# Interpretation

## Reading the Tree
**Tree Structure** prints each split ("feature 3 < 2.45") with its two branches, down to the leaves. A path from the root to a leaf is a **rule**: the conjunction of its conditions predicts the leaf's class or value. The first splits separate the data most; deeper ones refine smaller groups. For a modal tree, the rules speak of intervals of a series ("there is an interval where the mean of the signal exceeds t").

## Leaf Predictions and Probabilities
A classification leaf predicts its majority class; **Class Probabilities** gives the share of each class among its training samples. A leaf with a narrow majority is an uncertain prediction, and its probabilities, based on a few samples, are rough. A regression leaf predicts the mean of its samples, so the predictions are a step function.

## Feature Importance
**Feature Importance** shows two measures. **Impurity importance** sums the reduction in impurity from every split on a feature, on the training data; it favours continuous features and those with many distinct values, which offer more split points. **Permutation importance** measures how much the test accuracy (or R-squared) drops when the feature's values are shuffled; it is the more honest measure of what the model relies on. Correlated features share importance, so a low value does not mean a feature is irrelevant.

## Counterfactual Explanations
**Counterfactual Explanations** finds the smallest change in a sample's features that would change its prediction, with the Feature Tweak generator for trees: "this application would have been accepted with a higher income". It explains the model's decision boundary for one case; whether that change is feasible or causal is a separate question.

## Tree vs Random Forest
**Tree vs Random Forest** compares the single tree with a bagged ensemble on the test set. The forest is usually more accurate and stable, at the cost of the single readable set of rules.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
