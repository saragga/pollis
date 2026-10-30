# Overview

The Ensemble Learning Methods panel fits **tree ensembles**: many decision trees whose predictions are combined into one. A single deep tree fits the training data closely but changes a lot from sample to sample; combining many trees keeps the flexibility and removes most of that instability. The same panel handles **classification** (predict a class, with probabilities) and **regression** (predict a number).

## Random Forests
**Bagging**: each tree grows on a bootstrap sample of the rows, choosing each split among a random subset of the features, and the forest votes (classification) or averages (regression). Deep trees, low variance through averaging, little tuning. From DecisionTree.jl.

## Gradient Boosting
**Boosting**: shallow trees are added one at a time, each fitted to the gradients of the loss left by the trees before it, and shrunk by the learning rate. Usually the most accurate on tabular data once tuned. Pure Julia, from EvoTrees.jl.

## XGBoost
**Regularised boosting**: the same idea, with a second-order approximation of the loss and penalties on the number of leaves and their weights. The C++ library used widely in industry, from XGBoost.jl.

## Differentiable DT
**Soft trees**: each split sends an observation left and right with sigmoid weights instead of a hard yes or no, so the whole ensemble is differentiable and is trained by gradient descent, like a neural network. From NeuroTreeModels.jl, in a Pollis fork that runs on current Julia, accepts any Tables.jl table and adds a feature importance.

## Common Workflow

1. Fit **Random Forests** as a baseline: it rarely does badly with the default settings.
2. Check **vs Simple Baseline** and **vs Single Decision Tree**: the gap is what the ensemble adds.
3. Fit **Gradient Boosting** or **XGBoost**, and tune the number of rounds, the depth and the learning rate on held-out data.
4. Look at **Residuals or Calibration** and **Test Metric Uncertainty** before trusting a difference between models.
5. Explain the chosen model with **Permutation Importance**, **Partial Dependence** and **Shapley Values**, and distil it into rules with **Stable Rules (SIRUS)**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
