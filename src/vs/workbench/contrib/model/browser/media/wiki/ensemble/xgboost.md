# XGBoost

**XGBoost** (Chen and Guestrin, 2016) is gradient boosting with two additions:

- **A second-order approximation of the loss**: each tree is fitted using both the gradient and the curvature (Hessian) of the loss, which gives better leaf values in one step.
- **Explicit regularisation**: a penalty on the number of leaves and on the size of the leaf weights is part of the objective, so a split is made only when its gain exceeds the penalty.

It also handles missing values by learning a default direction at each split, and runs in parallel. It is the C++ library behind many winning entries in prediction competitions and many industrial pipelines.

## In the Panel
- `xgboost` from XGBoost.jl, with **n_trees** as `num_round`, **max_depth** as `max_depth` and **eta** as `eta`.
- Classification uses `multi:softprob`, with the labels recoded to 0, 1, 2, and so on, and returns one probability per class; regression uses `reg:squarederror`.
- **Built-in Feature Importance** uses `importance(bst, "gain")`: the average gain of the splits that use each feature.
- The regularisation penalties stay at the library defaults; set `lambda`, `alpha` or `gamma` in the code to change them.

## XGBoost or EvoTrees
XGBoost and EvoTrees are both second-order gradient boosting with histogram splits, and with the same settings give similar accuracy. Use XGBoost for very large data, to reproduce a model built elsewhere with XGBoost, or for its many options; use EvoTrees for a pure-Julia stack.

## See Also
- [Gradient Boosting](gradient-boosting.md) · [Decision Guide](decision-guide.md) · [Feature Importance](feature-importance.md)
