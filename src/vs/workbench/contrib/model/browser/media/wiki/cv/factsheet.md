# Cross-Validation Strategies — Factsheet

**Cross-validation** estimates how well a modelling procedure predicts new data by fitting it repeatedly on part of the observations and scoring it on the rest. The estimate describes the **procedure** (fitting this kind of model to data like these), not the one model fitted to the full dataset. Its validity depends on whether the held-out observations resemble the data the model will meet in use.

| | |
|---|---|
| **Purpose** | Estimate prediction error honestly, choose hyperparameters and compare models, with folds that respect the structure of the data |
| **Input** | A feature matrix with samples in columns, a response, and where needed group labels and time stamps; the number of folds and a seed |
| **Core packages** | [DataSplits.jl](https://github.com/davide-grheco/DataSplits.jl) |
| **Strategies** | 24, in four families: cross-validation and resampling, distance-based, group-aware, time-series |
| **Output** | Train and test indices for each fold, fold sizes, the test RMSE per fold and its mean and spread |
| **Key choice** | The strategy: the held-out data must represent the kind of generalisation you want to measure |

## When to Use

- **Estimating prediction error** when the data are too few to set aside a large test set.
- **Tuning hyperparameters** (a penalty, a tree depth) or choosing between models; with nested CV when the tuned model's error must also be estimated.
- **Grouped data**: repeated measurements on patients, sites or firms, where new groups are the target.
- **Time series**, where the model must forecast the future from the past.
- **Calibration design** in chemometrics: choosing which samples to measure so that the training set spans the feature space.

## What It Is Not

Cross-validation does not make dependent data independent: shuffled k-fold on grouped or time-ordered data gives optimistic scores. The spread of the fold scores is not a standard error, because the training sets overlap. Scores used to tune a model are no longer an unbiased estimate of its error. Distance-based splits are for designing training sets, not for estimating prospective performance. For the bootstrap as a tool for standard errors and confidence intervals, see Bootstrap Resampling.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
