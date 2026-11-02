# Overview

Classification performance is the agreement between a model's predictions and the true labels, measured on cases the model did not train on. The panel measures it in two ways: from hard labels, through the confusion matrix, and from continuous scores, through the receiver operating characteristic, introduced for machine learning readers by [Fawcett (2006)](#ref-Faw2006a).

## What the Classification Performance Panel Does and Its Julia Stack

The panel assesses a binary classifier that has already made its predictions, and it trains nothing itself. Its measures come through MLJ.jl, described by [Blaom, Kiraly, Lienart, Simillides, Arenas and Vollmer (2020)](#ref-BKLSA...2020a).

| Item | In Classification Performance |
|---|---|
| Purpose | Score hard labels and continuous scores against the true labels of a two-class task |
| Julia stack | MLJ.jl for measures and curves, re-exported from StatisticalMeasures.jl; Plots.jl to draw curves; StatsBase.jl to count classes |
| Tabs | **Metrics** for hard labels, **ROC** for scores |
| Inputs | **True Labels** on both tabs, **Predicted Labels** on **Metrics**, **Score Vector** on **ROC** |
| Positive class | The last label in sort order, unless `pos_class` is set in the code |
| Not in the panel | Model fitting, resampling, confidence intervals |

## How the Metrics Tab Scores Hard Predicted Labels

The **Metrics** tab puts **True Labels** and **Predicted Labels** on the same two ordered levels, with the positive class last, and builds the confusion matrix with `confmat`. It then prints the positive class, accuracy, precision, recall, F1 and the Matthews correlation coefficient, each to three decimal places. The matrix is stored in `cm` and not printed. The tab needs exactly two classes in **True Labels**, because the line that finds the negative class raises an error with any other number. Every figure describes one fixed decision rule, the one that produced the predicted labels.

## How the ROC Tab Scores a Continuous Score Vector

The **ROC** tab leaves the decision rule open. From **True Labels** and **Score Vector**, `Functions.roc_curve` returns the false positive and true positive rates at each distinct score, and `Functions.auc` returns the area under the curve. The tab prints the AUC and two thresholds: the Youden threshold, which maximises TPR - FPR, and the minimum-cost threshold, computed with `cost_fp = 1.0` and `cost_fn = 5.0`, values set in the code and not offered as inputs. The curve is computed and not drawn. Thresholds are in the units of the scores, so any score scale can be used.

## Where the Classification Performance Measures Come From

Several measures in the panel began outside machine learning. [Youden (1950)](#ref-You1950a) proposed his index for rating diagnostic tests. [Matthews (1975)](#ref-Mat1975a) used the coefficient that now carries his name to compare predicted and observed protein secondary structure. [Hanley and McNeil (1982)](#ref-HM1982a) explained the area under the ROC curve to radiology readers as the probability of ranking a random positive case over a random negative one. Precision, recall and F1 grew up in information retrieval, where the relevant documents are few and the irrelevant ones are not worth counting.

## What the Next Steps of Classification Performance Add

| Next Step | Group | Reads | Shows |
|---|---|---|---|
| **Precision-Recall Curve** | Diagnose | **True Labels**, **Score Vector** | Precision against recall at each distinct score, with the positive rate as baseline |
| **Class Imbalance Check** | Diagnose | **True Labels** | Count and percentage of each class |
| **MCC Interpretation** | Interpret | **True Labels**, **Predicted Labels** | MCC, the meaning of -1, 0 and +1, and rule-of-thumb bands |
| **Lift Curve** | Interpret | **True Labels**, **Score Vector** | Cumulative lift at each rank, with 1 as baseline |

A Next Step reads the value held by its input even when the open tab hides that input. **MCC Interpretation** therefore needs a valid **Predicted Labels**, and the two curves a valid **Score Vector**, whichever tab is open.

## A Common Workflow for Classification Performance

1. Score cases the model did not train on, and enter their labels and scores.
2. Run **Class Imbalance Check** to see how rare each class is.
3. Set `pos_class` to the class of interest, since sort order may pick the other one.
4. Read **Metrics** for the labels at the model's current threshold.
5. Read **ROC** and **Precision-Recall Curve** for the ranking across all thresholds.
6. Replace `cost_fp` and `cost_fn` with the real costs, and take the threshold from them.
7. Confirm that threshold on cases not used to choose it.

## References

<a id="ref-BKLSA...2020a"></a>Blaom, A. D., Kiraly, F., Lienart, T., Simillides, Y., Arenas, D. and Vollmer, S. (2020). MLJ: a Julia package for composable machine learning. *Journal of Open Source Software* 5(55), 2704. [doi:10.21105/joss.02704](https://doi.org/10.21105/joss.02704)

<a id="ref-Faw2006a"></a>Fawcett, T. (2006). An introduction to ROC analysis. *Pattern Recognition Letters* 27(8), 861–874. [doi:10.1016/j.patrec.2005.10.010](https://doi.org/10.1016/j.patrec.2005.10.010)

<a id="ref-HM1982a"></a>Hanley, J. A. and McNeil, B. J. (1982). The meaning and use of the area under a receiver operating characteristic (ROC) curve. *Radiology* 143(1), 29–36. [doi:10.1148/radiology.143.1.7063747](https://doi.org/10.1148/radiology.143.1.7063747)

<a id="ref-Mat1975a"></a>Matthews, B. W. (1975). Comparison of the predicted and observed secondary structure of T4 phage lysozyme. *Biochimica et Biophysica Acta (BBA) - Protein Structure* 405(2), 442–451. [doi:10.1016/0005-2795(75)90109-9](https://doi.org/10.1016/0005-2795(75)90109-9)

<a id="ref-You1950a"></a>Youden, W. J. (1950). Index for rating diagnostic tests. *Cancer* 3(1), 32–35. [doi:10.1002/1097-0142(1950)3:1&lt;32::AID-CNCR2820030106&gt;3.0.CO;2-3](https://doi.org/10.1002/1097-0142(1950)3:1%3C32::AID-CNCR2820030106%3E3.0.CO;2-3)

## See Also

- [Metric Guide](clf-metrics.md) · [ROC Analysis](clf-roc.md) · [Imbalanced Classes](clf-imbalanced.md)
