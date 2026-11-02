# ECE and Brier Score

The three Next Steps of the Model Calibration panel measure different things. **Reliability Diagram** shows where the probabilities go wrong, **Expected Calibration Error (ECE)** condenses that into one number, and **Brier Score Comparison** also rewards probabilities that separate the classes.

## How to Read a Reliability Diagram

**Reliability Diagram** divides the range from 0 to 1 into 10 equal-width bins, and plots each bin's mean of `cal_probs` against its fraction of positives. Points on the dashed diagonal agree with the observed rate. Points under it mean that probabilities are too high, and points over it mean that they are too low. An S-shaped pattern, under the diagonal at high values and over it at low values, is the mark of overconfidence. Empty bins are left out, and the chart shows no bin counts, so a point from a handful of cases looks as firm as any other. Only calibrated values are plotted, so to see the raw curve, set `cal_probs` to the raw scores and run the step again.

## How Expected Calibration Error Is Computed

Cases fall into bins by predicted probability. For each bin, take the absolute gap between mean predicted probability and observed frequency, then average the gaps with weights equal to the bin's share of cases: ECE = sum((n_b / n) |mean_p_b - freq_b|). Lower is better, and 0 means no gap in any bin. [Pakdaman Naeini, Cooper and Hauskrecht (2015)](#ref-PCH2015a) introduced the measure. The panel uses `ECE(UniformBinning(10))` from CalibrationErrors.jl, and evaluates raw and calibrated values with 10 equal-width bins. With **Temperature**, the raw values are the sigmoid of the logits, equivalent to T = 1.

## Where Expected Calibration Error Misleads

The value depends on the binning. More bins raise it on the same predictions, because each bin holds fewer cases and has a noisier gap, so a comparison holds only for one number of bins. Equal-width bins can also sit nearly empty when predictions crowd together. Gaps of opposite sign in different bins do not cancel, yet gaps within a single bin do. ECE can also be excellent for a useless model: always predicting the base rate gives an ECE near 0. ECE on few cases carries a positive bias, so a small non-zero value may be noise. Read it together with a measure of discrimination.

## How the Brier Score Is Computed

The Brier score of [Brier (1950)](#ref-Bri1950a) is the mean squared gap between probability and outcome: mean((p - y)^2). It runs from 0 to 1 for binary labels, with lower better. Always predicting 0.5 gives 0.25, and always predicting the base rate b gives b(1 - b), which serves as a reference for a rare event. **Brier Score Comparison** prints `Brier (raw)`, `Brier (cal)` and `Improvement`, their difference, with positive values favouring the calibrated probabilities.

## What the Brier Score Adds to Calibration Measures

The score reflects both calibration and refinement, in the sense set out by [DeGroot and Fienberg (1983)](#ref-DF1983a). It is a proper scoring rule, so a forecaster does best in expectation by reporting true beliefs, and it cannot be gamed by constant predictions in the way ECE can. A mapping that keeps the order of the cases can change mainly the calibration part, so the improvement shown is largely a calibration gain. With a rare event all values are small, so compare them with b(1 - b), not with 0.

## Why These Calibration Checks Need Held-Out Cases

All three steps score `cal_probs` on the cases used to fit the mapping. **Isotonic** can never show a loss in Brier score on those cases, and it tends to look nearly perfect on the other two measures. Results from the three tabs are therefore not on an equal footing. For a fair comparison, fit on one part of the calibration data and compute `cal_probs` for another part, then run the steps with that part's labels. Differences that are small relative to case-to-case variation can be judged with a bootstrap over cases, which the panel does not provide.

## References

<a id="ref-Bri1950a"></a>Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. *Monthly Weather Review* 78(1), 1–3. [doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2](https://doi.org/10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2)

<a id="ref-DF1983a"></a>DeGroot, M. H. and Fienberg, S. E. (1983). The comparison and evaluation of forecasters. *The Statistician* 32(1/2), 12. [doi:10.2307/2987588](https://doi.org/10.2307/2987588)

<a id="ref-PCH2015a"></a>Pakdaman Naeini, M., Cooper, G. and Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. *Proceedings of the AAAI Conference on Artificial Intelligence* 29(1). [doi:10.1609/aaai.v29i1.9602](https://doi.org/10.1609/aaai.v29i1.9602)

## See Also

- [Overview](mc-overview.md) · [Platt Scaling](mc-platt.md) · [Isotonic Regression](mc-isotonic.md) · [Temperature Scaling](mc-temperature.md)
