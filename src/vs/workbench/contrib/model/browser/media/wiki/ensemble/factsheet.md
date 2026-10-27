# Ensemble Learning Methods — Factsheet

**Tree ensembles** combine many decision trees into one predictor. Bagging (random forests) grows deep trees independently and averages them, which lowers variance; boosting grows shallow trees in sequence, each correcting the errors of the ones before, which lowers bias. Both capture non-linear effects and interactions without being told about them, and are the strongest general-purpose methods for tabular data.

| | |
|---|---|
| **Purpose** | Predict a class or a number from a table of features, with non-linear effects and interactions |
| **Input** | A numeric feature matrix (rows are observations) and a target vector, plus a held-out test set |
| **Core packages** | [DecisionTree.jl](https://github.com/JuliaAI/DecisionTree.jl), [EvoTrees.jl](https://github.com/Evovest/EvoTrees.jl), [XGBoost.jl](https://github.com/dmlc/XGBoost.jl), [NeuroTreeModels.jl](https://github.com/Evovest/NeuroTreeModels.jl), [SIRUS.jl](https://github.com/rikhuijzer/SIRUS.jl) |
| **Methods** | Random Forests, Gradient Boosting, XGBoost, Differentiable DT |
| **Output** | Predictions and class probabilities, training and test accuracy (classification) or RMSE (regression) |
| **Key choices** | Number of trees or rounds, maximum depth, learning rate (boosting) |

## When to Use

- **Tabular data** with a mix of features, where the relation to the target is non-linear or has interactions you cannot specify in advance.
- When **prediction accuracy** matters more than a single coefficient per feature.
- As a **benchmark** for a simpler model: if a linear or logistic regression comes close to the ensemble, the simpler model is enough.

## What It Is Not

A tree ensemble gives no coefficients, standard errors or p-values, and its importance measures say what the model uses, not what causes the outcome. Trees cannot extrapolate: outside the range of the training data the prediction stays flat at the last leaf. For images, text or sequences, neural networks are usually better; for small samples where inference is the goal, use a regression model.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
