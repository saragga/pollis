# Isotonic Regression

Isotonic calibration finds the non-decreasing step function of the score that lies closest to the labels. It assumes only that a higher score should not mean a lower probability.

## What Isotonic Regression Computes

Among all sequences f_1 <= f_2 <= ... <= f_n over the cases sorted by score, the method minimises sum((y_i - f_i)^2). Pool Adjacent Violators solves that exactly. It walks through the sorted labels, and whenever a block has a higher mean than the block after it, the two merge into one block with their weighted mean. [Ayer, Brunk, Ewing, Reid and Silverman (1955)](#ref-ABERS1955a) gave the estimator, and [Zadrozny and Elkan (2002)](#ref-ZE2002a) brought it to classifier calibration. The panel's **Isotonic** tab writes the algorithm out in the function `pav`, so no package is needed.

## How Isotonic Regression Reads the Panel Inputs

**Raw Scores / Logits** is used only through its order, as `pav` sorts the cases by it and never uses the values otherwise. Any strictly increasing transformation of the scores gives the same pooled blocks. **True Labels** must be 0/1 or false/true. Scores that are tied are not treated as equal: `sortperm` places them in some order, and they can land in different blocks with different calibrated values. Averaging `cal_probs` within tied scores removes that effect. **Expected Calibration Error (ECE)** and **Brier Score Comparison** treat the input as a probability, so logits make their raw figures meaningless, although the fit itself is unaffected.

## What Isotonic Regression Does Well

No curve shape is assumed, so S-shapes, kinks and asymmetric errors can all be followed. No optimiser or starting value is involved, and the solution is unique. The order of the scores is respected, and the mean of `cal_probs` equals the mean of the labels. Given enough cases, [Niculescu-Mizil and Caruana (2005)](#ref-NC2005a) found that it often did better than a parametric mapping, because any error of shape disappears.

## Where Isotonic Regression Misleads

Flexibility needs data. With few cases, and particularly few positives, the steps follow noise. The lowest and highest blocks often give exactly 0 or 1, and such certainty is rarely justified and makes any log-loss infinite. Pooling also creates ties, so cases with different scores share one probability, and the area under the ROC curve can change a little as a result. The fit on its own cases is also misleadingly good. Because raw scores are themselves a non-decreasing sequence in that order, and `pav` minimises squared error among all such sequences, **Brier Score Comparison** cannot show a loss on the fitting cases, so a positive improvement there proves nothing.

## How to Apply an Isotonic Fit to New Scores

`pav` returns one value per input case and no function for new scores, so the generated code has nothing to apply to fresh data. To use the mapping, sort the fitted scores with their values and look up each new score with `searchsortedlast`, giving it the value of the nearest fitted score at or under it. Scores under the lowest fitted score take the lowest value. Linear interpolation between block values is a common variant, and it reduces ties. This step is also what makes a held-out check possible.

## What to Compare Isotonic Regression With

**Platt Scaling** and **Temperature** have one or two parameters, so they are the natural benchmark on small samples. Fit each on one part of the calibration cases and score on the other with **Brier Score Comparison** or **Expected Calibration Error (ECE)**. If **Isotonic** gains little there, the simpler mapping is preferable. **Reliability Diagram** will sit close to the diagonal on the fitting cases, by construction, so that chart is informative only on held-out cases.

## References

<a id="ref-ABERS1955a"></a>Ayer, M., Brunk, H. D., Ewing, G. M., Reid, W. T. and Silverman, E. (1955). An empirical distribution function for sampling with incomplete information. *The Annals of Mathematical Statistics* 26(4), 641–647. [doi:10.1214/aoms/1177728423](https://doi.org/10.1214/aoms/1177728423)

<a id="ref-NC2005a"></a>Niculescu-Mizil, A. and Caruana, R. (2005). Predicting good probabilities with supervised learning. *Proceedings of the 22nd International Conference on Machine Learning*, 625–632. [doi:10.1145/1102351.1102430](https://doi.org/10.1145/1102351.1102430)

<a id="ref-ZE2002a"></a>Zadrozny, B. and Elkan, C. (2002). Transforming classifier scores into accurate multiclass probability estimates. *Proceedings of the Eighth ACM SIGKDD International Conference on Knowledge Discovery and Data Mining*, 694–699. [doi:10.1145/775047.775151](https://doi.org/10.1145/775047.775151)

## See Also

- [Overview](mc-overview.md) · [Platt Scaling](mc-platt.md) · [Temperature Scaling](mc-temperature.md) · [ECE and Brier Score](mc-metrics.md)
