# Overview

A classifier can rank cases well and still give poor probabilities. Calibration fits a mapping from its scores to probabilities that agree with how often the event happens, and leaves the classifier itself unchanged.

## What the Model Calibration Panel Does

| Item | Description |
|---|---|
| **Purpose** | Map the scores of a binary classifier to better probabilities, then measure the change |
| **Julia stack** | GLM.jl for **Platt Scaling**, plain Julia for **Isotonic**, Optim.jl for **Temperature**, CalibrationErrors.jl and Plots.jl for the checks |
| **Tabs** | **Platt Scaling**, **Isotonic**, **Temperature** |
| **Inputs** | **Raw Scores / Logits** and **True Labels**, one value per case, from data the classifier did not train on |
| **Output** | `cal_probs`, a calibrated probability for each case in those inputs |
| **Key choice** | How flexible the mapping should be, given how many calibration cases there are |

## What Well-Calibrated Probabilities Mean

Among the cases given a probability of 0.3, about 30% should turn out positive, and likewise at every other value. [DeGroot and Fienberg (1983)](#ref-DF1983a) separated that property from refinement, which is how far the forecasts spread towards 0 and 1. A forecaster that always gives the base rate is calibrated and useless, so calibration alone is not the aim. Calibration matters when the probability itself is used, for a cost-based threshold, an expected loss, or a combination of models. For ranking alone, it adds nothing.

## How Each Calibration Tab Works

| Tab | Mapping | Parameters | Input expected |
|---|---|---|---|
| **Platt Scaling** | Logistic regression of the label on the score | Two | Score on any scale |
| **Isotonic** | Non-decreasing step function, by Pool Adjacent Violators | One per pooled block | Probability score |
| **Temperature** | Logit divided by a single T, then passed through the sigmoid | One | Logit |

[Niculescu-Mizil and Caruana (2005)](#ref-NC2005a) compared the first two across many kinds of classifier, and [Guo, Pleiss, Sun and Weinberger (2017)](#ref-GPSW2017a) proposed the third for neural networks that are overconfident.

## How to Choose a Calibration Method

| Situation | Tab | Why |
|---|---|---|
| Few calibration cases | **Temperature** or **Platt Scaling** | Few parameters, so less risk of fitting noise |
| Reliability curve is S-shaped | **Platt Scaling** | A logistic curve has that shape, particularly on logit input |
| Overconfident logits, centred correctly | **Temperature** | Sharpens or softens without moving logit 0 |
| Probabilities too high or low overall | **Platt Scaling** | Its intercept can shift them, which T cannot do |
| Many cases and an irregular curve | **Isotonic** | Assumes only that the mapping does not decrease |

## A Common Workflow for Model Calibration

Set aside cases the classifier did not train on, and split them when possible: one part to fit the mapping and one to check it. Choose a tab and run the code, then use **Reliability Diagram** to see the calibrated curve. **Expected Calibration Error (ECE)** and **Brier Score Comparison** put the raw and calibrated scores side by side. The generated code fits and scores on the same cases, so these checks flatter every method, and most of all the flexible ones. To judge a method fairly, apply the fitted mapping to the second part. [Zadrozny and Elkan (2002)](#ref-ZE2002a) fit such mappings on data held out from training, for the same reason.

## References

<a id="ref-DF1983a"></a>DeGroot, M. H. and Fienberg, S. E. (1983). The comparison and evaluation of forecasters. *The Statistician* 32(1/2), 12. [doi:10.2307/2987588](https://doi.org/10.2307/2987588)

<a id="ref-GPSW2017a"></a>Guo, C., Pleiss, G., Sun, Y. and Weinberger, K. Q. (2017). On calibration of modern neural networks. arXiv:1706.04599. [doi:10.48550/arXiv.1706.04599](https://doi.org/10.48550/arXiv.1706.04599)

<a id="ref-NC2005a"></a>Niculescu-Mizil, A. and Caruana, R. (2005). Predicting good probabilities with supervised learning. *Proceedings of the 22nd International Conference on Machine Learning*, 625–632. [doi:10.1145/1102351.1102430](https://doi.org/10.1145/1102351.1102430)

<a id="ref-ZE2002a"></a>Zadrozny, B. and Elkan, C. (2002). Transforming classifier scores into accurate multiclass probability estimates. *Proceedings of the Eighth ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*, 694–699. [doi:10.1145/775047.775151](https://doi.org/10.1145/775047.775151)

## See Also

- [Platt Scaling](mc-platt.md) · [Isotonic Regression](mc-isotonic.md) · [Temperature Scaling](mc-temperature.md) · [ECE and Brier Score](mc-metrics.md)
