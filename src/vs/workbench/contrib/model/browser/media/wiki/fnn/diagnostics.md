# Feedforward Neural Networks — Diagnostics

A network trained on every sample has no built-in test of its own quality. These checks look at convergence, generalisation and the value added over a classical method, and they state what each Next Step actually runs.

## How to Read the Training Loss Curve of a Feedforward Network

**Training Loss Curve** trains for 100 more epochs and plots the mean batch loss after each one on a log scale. A smooth fall that levels off is the aim, and a curve still falling at the end calls for more epochs. A flat curve from the start suggests unscaled data or a target with little signal. With **dropout** above 0 or **Batch normalisation** on, the recorded losses are noisier and usually higher than the loss in test mode, as the code measures them in training mode. With **MDN**, the loss can be negative, and a log axis cannot show those values.

## How to Detect Overfitting in a Feedforward Network

**Train vs Validation Loss** draws a random 80/20 split, resets the weights, trains for 100 epochs on the 80%, switches to test mode and returns both losses. A validation loss near the training loss is the aim. A much larger validation loss means overfitting, so reduce **hidden_size** or **num_layers**, raise **dropout**, or gather more data. The step leaves `model` as the 80% network. Its reset sets vector parameters to zero, which with **Batch normalisation** on includes the scale and the running variance. The split has no seed, and repeating the step shows how much the result moves.

## How to Find Badly Fitted Samples in a Feedforward Network

**Per-Sample Error** switches to test mode and draws a histogram of each sample's squared error, summed over outputs or features. A compact histogram with a thin right tail is common. A separate group of large errors marks outliers, a subpopulation or data errors, which are worth inspecting before retraining. The errors are in-sample unless **Train vs Validation Loss** has run first, and even then the histogram mixes the two parts of the split. With **MDN**, the error is measured from the mixture mean, so a good two-mode fit can still show large errors.

## How to Check Whether a Feedforward Network Beats a Classical Method

**Classical Baseline** prints one in-sample mean squared error: least squares with an intercept for **MLP**, and PCA with **latent_dim** components for the other tabs. Compare it with the network's in-sample error, which the step does not print. A network that barely improves on it adds little for its cost. **MDN** and **VAE** need care, as their losses contain more than squared error. PCA in `MultivariateStats` also stops early when 99% of the variance is explained, so that it may use fewer components than **latent_dim**. A small in-sample gain says nothing about new data.

## Which Feedforward Network Checks Run with Dropout On

`Flux.train!` calls `Flux.trainmode!` on the model, and the mode lasts until `Flux.testmode!` is called. So after training, **Learned Representation** and **Input Sensitivity** run with dropout active and batch normalisation in training mode, unless a step that calls `Flux.testmode!` has run earlier. **Train vs Validation Loss**, **Per-Sample Error** and **Predict New Data** make that call. **Training Loss Curve** trains again, which restores training mode. With **dropout** at 0 and **Batch normalisation** off, the two modes give the same computation and the order of steps does not matter. Otherwise, calling `Flux.testmode!(model)` first gives repeatable results.

## What the Feedforward Panel Does Not Check

The panel has no check of **MDN** calibration, no separate report of the KL term in **VAE** and no test of whether new samples are plausible. To check calibration, draw from the fitted mixture on held-out inputs and compare coverage of intervals with their nominal level. To look for an unused latent space, compute the KL term from the encoder outputs on the data, as a value near zero means that the decoder ignores the code. To judge samples, compare the means and correlations of `X_gen` with those of the data.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
