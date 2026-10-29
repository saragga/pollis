# Overview

This webview builds the **training and test sets** on which a model is fitted and evaluated, with DataSplits.jl. A model's error on the data it was fitted to is optimistic; an honest estimate needs data the model has not seen, and the way those data are held out decides what the estimate means. The panel offers four families of strategies, each answering a different question, and runs a least-squares model on every fold, a placeholder to replace with your own.

## Cross-Validation
**K-fold** and its variants divide the observations into k folds, each held out once while the model is fitted on the rest: stratified folds keep the response distribution in every fold, repeated k-fold averages over several random assignments, leave-one-out and leave-p-out hold out every observation or pair, and **nested CV** separates tuning from evaluation. Random **resampling** strategies (ShuffleSplit, BootstrapSplit, StratifiedShuffleSplit) draw independent train/test splits instead. See [Cross-Validation](cross-validation.md).

## Distance-Based
**Kennard-Stone**, **SPXY**, **MDKS**, **OptiSim** and the minimum and maximum dissimilarity strategies choose a training set that **covers the feature space**, for small datasets in chemometrics and similar fields. They design training sets; their leftover test sets are not random samples. See [Distance-Based](distance-based.md).

## Group-Aware
**GroupKFold** and **GroupShuffleSplit** keep every observation of a group (a patient, a batch, a firm) on the same side of the split, so that the score measures performance on **new groups**. See [Group-Aware](group-aware.md).

## Time-Series
**TimeSplit**, **TimeSeriesSplit**, **BlockedCV** and **PurgedKFold** respect the order of time: the model is trained on the past and tested on the future, or tested on blocks with buffers around them. See [Time-Series](time-series.md).

## Common Workflow

1. Choose the **Strategy** that matches how the model will be used, and set **n**, **k** and the **Seed**.
2. Look at the **Fold Sizes** and the **Feature Coverage** of training and test sets.
3. Check the **Class Balance** across folds, and run the **Leakage Check**.
4. Read the **CV Score** across folds.
5. **Compare Strategies** on the same model, and estimate the **Optimism Bias** of the in-sample error.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
