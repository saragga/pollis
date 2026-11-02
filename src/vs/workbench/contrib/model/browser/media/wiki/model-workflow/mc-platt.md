# Platt Scaling

Platt scaling fits a logistic regression that takes the classifier's score as its only regressor. The fitted curve turns each score into a probability, using two parameters.

## What Platt Scaling Computes

The calibrated probability is p = 1 / (1 + exp(-(a + b s))), where s is the score, and a and b maximise the binomial likelihood of the labels. The panel fits this with `glm(@formula(y ~ score), tbl, Binomial(), LogitLink())` from GLM.jl and returns `cal_probs` from `predict`. John Platt proposed the mapping for the outputs of support vector machines, and [Lin, Lin and Weng (2007)](#ref-LLW2007a) review how to fit it reliably.

## How Platt Scaling Reads the Panel Inputs

**Raw Scores / Logits** gives one score per case, and **True Labels** gives 0/1 or false/true. The score enters the regression as supplied. That choice matters for probability scores. The fitted curve is logistic in s, and s stays between 0 and 1, so `cal_probs` cannot go beyond the curve's values at those two ends. Converting first with `log.(p ./ (1 .- p))` lets the mapping reach the whole range, and it leaves the identity mapping available at a = 0, b = 1. Scores equal to exactly 0 or 1 need clipping before that conversion.

## How to Read the Fitted Platt Parameters

`coef(platt)` returns a and b. With logit input, b greater than 1 means the classifier was underconfident and b less than 1 means it was overconfident, while a shifts every probability up or down on the log-odds scale. With probability input, these readings do not apply. A negative b says that higher scores go with fewer positives, and that usually means the labels or scores are the wrong way round. Calling `coeftable(platt)` gives their standard errors, which assume independent cases.

## What Platt Scaling Does Well

Two parameters need few cases, so the fit stays stable on small calibration sets. Provided b is positive, the order of the cases is kept, so ranking measures such as the area under the ROC curve stay the same. The intercept also corrects a wrong overall level, which a single temperature cannot do. New cases need only `predict(platt, (score = new_scores,))`, and the mapping gives a value for any score, including those beyond the calibration range.

## Where Platt Scaling Misleads

The S-shape is an assumption. [Niculescu-Mizil and Caruana (2005)](#ref-NC2005a) found that it suits classifiers whose reliability curve bends that way, and that it does less for others. If the true curve is irregular or asymmetric, the fit will be off in some part of the range, however many cases there are. A class balance that differs between calibration and use also shifts a, so the mapping must be fitted on cases that resemble the ones to be scored. With few positives, the estimates of a and b are themselves unsure. Because `cal_probs` is computed on the cases used for the fit, it is an optimistic picture of the result on new cases.

## What to Compare Platt Scaling With

**Reliability Diagram** on `cal_probs` shows whether a curve remains. **Temperature** is the nearest alternative: both act on the logit, and if Platt gives a near 0 on logit input, T is about 1/b and the single parameter is enough. **Isotonic** drops the shape assumption, and a clear gain from it on held-out cases suggests that the S-shape is wrong. **Brier Score Comparison** and **Expected Calibration Error (ECE)** put raw and calibrated scores side by side, and a check on cases kept out of the fit gives the fairer comparison.

## References

<a id="ref-LLW2007a"></a>Lin, H.-T., Lin, C.-J. and Weng, R. C. (2007). A note on Platt's probabilistic outputs for support vector machines. *Machine Learning* 68(3), 267–276. [doi:10.1007/s10994-007-5018-6](https://doi.org/10.1007/s10994-007-5018-6)

<a id="ref-NC2005a"></a>Niculescu-Mizil, A. and Caruana, R. (2005). Predicting good probabilities with supervised learning. *Proceedings of the 22nd International Conference on Machine Learning*, 625–632. [doi:10.1145/1102351.1102430](https://doi.org/10.1145/1102351.1102430)

## See Also

- [Overview](mc-overview.md) · [Isotonic Regression](mc-isotonic.md) · [Temperature Scaling](mc-temperature.md) · [ECE and Brier Score](mc-metrics.md)
