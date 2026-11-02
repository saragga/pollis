# Temperature Scaling

Temperature scaling divides every logit by one positive number before the sigmoid. Probabilities move towards 0.5 or away from it, and the classifier's decisions at the 0.5 threshold stay as they were.

## What Temperature Scaling Computes

The calibrated probability is p = 1 / (1 + exp(-z / T)), where z is the logit. T is chosen to minimise the negative log-likelihood of the labels on the calibration cases. T greater than 1 softens an overconfident model, T less than 1 sharpens an underconfident one, and T = 1 changes nothing. [Guo, Pleiss, Sun and Weinberger (2017)](#ref-GPSW2017a) proposed it as a one-parameter simplification of Platt scaling for neural networks. The panel's code minimises `nll` with `optimize(nll, [1.0], LBFGS())` from Optim.jl, starting at T = 1, and reads T from `T_opt`.

## How Temperature Scaling Reads the Panel Inputs

**Raw Scores / Logits** must hold logits here, the values before the sigmoid. Probabilities would all be positive numbers and would be read as logits, which gives every case a value above 0.5 and a meaningless T. To convert them, use `log.(p ./ (1 .- p))`, as the panel's default does. **True Labels** takes 0/1 or false/true. The panel handles the binary case, with one logit per case. The multi-class form in the original work divides a whole vector of logits by T before the softmax, and the same idea would need a change to `nll`.

## What Temperature Scaling Does Well

One parameter can be fitted reliably with few cases and has little room to overfit. Any positive T keeps the order of the cases and the sign of each logit, so accuracy at the 0.5 threshold and the area under the ROC curve stay the same. T also reads easily as a single statement about the model's confidence. Applying it to new cases needs just the formula, `1 ./ (1 .+ exp.(-new_logits ./ T_opt))`, with no stored table.

## Where Temperature Scaling Misleads

T scales around logit 0 and cannot shift. If predictions are too high or too low overall, as happens when the base rate changes, no temperature corrects that, and a term like the intercept of **Platt Scaling** is needed. A single T also assumes that overconfidence is the same at all confidence levels, so a curve that errs in opposite directions on the two sides is left in place. Calibration on a held-out set does not carry over to data from a different distribution. Because the panel fits and evaluates on the same cases, its results lean optimistic, though less so than for more flexible mappings.

## How to Check a Temperature Fit

The code does not print how the optimiser ended, so check `Optim.converged(res)`. T is not constrained to be positive. A negative `T_opt` flips every prediction, which suggests that labels and logits are reversed, and no value of T then repairs the model. `1e-12` inside the logarithms guards against log(0), and extreme logits at a small T can still make `nll` flat. Very large T means that the logits carry little information about the labels. If T sits near 1, the model was already about right in overall confidence, though not necessarily at every level, as **Reliability Diagram** will show.

## What to Compare Temperature Scaling With

**Platt Scaling** on logit input contains **Temperature** as a special case with a = 0 and b = 1 / T, so a clear gain from Platt points to a wrong overall level. **Isotonic** shows whether a more irregular mapping does better, given enough held-out cases. **Expected Calibration Error (ECE)** and **Brier Score Comparison** report raw probabilities at T = 1 beside the calibrated ones. Since accuracy cannot change at the 0.5 threshold, a table of accuracy before and after adds nothing here.

## References

<a id="ref-GPSW2017a"></a>Guo, C., Pleiss, G., Sun, Y. and Weinberger, K. Q. (2017). On calibration of modern neural networks. arXiv:1706.04599. [doi:10.48550/arXiv.1706.04599](https://doi.org/10.48550/arXiv.1706.04599)

## See Also

- [Overview](mc-overview.md) · [Platt Scaling](mc-platt.md) · [Isotonic Regression](mc-isotonic.md) · [ECE and Brier Score](mc-metrics.md)
