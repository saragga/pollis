# Overview

This webview fits **decision trees**: models that predict by asking a sequence of yes-or-no questions about the features ("is x3 below 2.5?") and returning, at the end of each path, the majority class (classification) or the mean response (regression) of the training samples that reached it. A tree is grown greedily from the top: at each node it picks the split that most reduces the impurity of the two parts, and stops when a depth limit or a minimum leaf size is reached.

## Decision Tree
The classic **CART** tree from DecisionTree.jl, with **axis-aligned** splits: each question compares one feature with a threshold. For classification it minimises the **Gini impurity** (or the entropy) of the leaves; for regression, the **squared error** around the leaf means. Two settings control its size: **max_depth**, the longest path from the root, and **min_samples_leaf**, the fewest training samples a leaf may hold.

## Modal Decision Tree
From ModalDecisionTrees.jl, through MLJ. A column may hold a **whole series per instance** (a signal, a time series, a row of an image), and the splits reason over its parts with **modal logic**: "there is an interval in which the mean of x is above t", "in every interval after this one ...". The tree can then learn patterns in time or space that a flat table of features would hide. On ordinary tabular data it behaves like a standard tree.

## Common Workflow

1. Choose the **Task**, classification or regression, and split the data into training and test sets.
2. Fit with a moderate **max_depth**, and read the **Tree Structure**.
3. Run **Depth vs Accuracy** and **Cross-Validation** to choose the depth where the cross-validated score stops improving.
4. Check the **Confusion Matrix** on the test set, and the **Class Probabilities** of uncertain cases.
5. Compare with a **Random Forest**; explain the model with **Feature Importance** and **Counterfactual Explanations**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
