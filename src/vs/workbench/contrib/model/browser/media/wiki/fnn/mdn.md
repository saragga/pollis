# Mixture Density Network

A mixture density network predicts a whole conditional distribution in place of one number. [Bishop (1994)](#ref-Bis1994a) proposed it, and the **MLP** tab of the Feedforward Neural Networks panel offers it as an **Output head**.

## What a Mixture Density Network Computes

For an input x, the network gives K mixture weights w_k(x), means mu_k(x) and standard deviations s_k(x), and so a distribution for the target y:

p(y | x) = sum over k of w_k(x) * N(y; mu_k(x), s_k(x)^2)

Training minimises the mean of -log p(y | x) over a batch. Unlike a mean squared error fit, which returns a single conditional mean, the mixture can show two likely outcomes at one input, or a spread that changes with the input. With K large enough, a Gaussian mixture of this kind can follow many conditional shapes, given enough data to fit them.

## How the MDN Output Head Works in the MLP Tab

Setting **Output head** to **MDN** puts three `Dense` heads of size **num_components** on the backbone. The weights pass through `softmax`, so they are positive and sum to 1. The standard deviations pass through `softplus`, so they are positive. The means have no transformation. **input_size**, **hidden_size**, **num_layers**, **activation**, **dropout**, **Residual connections** and **Batch normalisation** apply to the backbone as usual. **Target variable** must have one row, as the loss compares that row with every component. The code offers no multivariate form, and **output_size** is not used.

## Where a Mixture Density Network Is Useful

A mixture density network suits inverse problems, where several inputs lead to one output and so one input may have several answers, and any case where the shape of the outcome changes with the input. It also yields a likelihood, which permits density forecasts and proper scoring on held-out data. Intervals and tail probabilities come directly from the mixture. A standard head gives none of these. The output remains only as good as the fit, and a mixture learned from few samples can look more exact than it is.

## Where a Mixture Density Network Misleads

Components do not carry a stable identity across inputs or runs, so reading the first component as a regime has no basis. One component can collapse onto a few points with a tiny standard deviation, which sends the likelihood upwards on training data and is a form of overfitting. The code has no floor on s_k. It computes `log.(sum(w .* exp.(log_p); dims=1))` without a log-sum-exp step, so that a target far from all components gives a zero sum, an infinite loss and then `NaN` weights. Scaling the target to about unit size makes this less likely.

## How the Mixture Density Network Works with the Other Next Steps

Several Next Steps treat an **MDN** differently. **Training Loss Curve** plots the loss on a log axis, which cannot show a negative loss. **Per-Sample Error** measures squared error from the mixture mean, so it hides a good multimodal fit. **Input Sensitivity** sums the component means without weights. **Learned Representation** reads the backbone. **Predict New Data** returns the weights, means and standard deviations, each with **num_components** rows. **Classical Baseline** returns a mean squared error, while **Train vs Validation Loss** returns a negative log-likelihood, so those two figures are not comparable.

## What to Compare a Mixture Density Network With

Compare with the same backbone at **num_components** equal to 1, a single Gaussian with changing mean and spread. If more components do not lower the held-out negative log-likelihood from **Train vs Validation Loss**, the extra modes are not supported by the data. To compare with the **Standard** head, compute a mean squared error from the mixture mean on the same held-out samples, as the two losses differ in kind. Check calibration on held-out data by drawing from the fitted mixture and comparing the coverage of intervals with their nominal level, which the panel does not do.

## References

<a id="ref-Bis1994a"></a>Bishop, C. M. (1994). Mixture density networks.

## See Also

- [Overview](overview.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
