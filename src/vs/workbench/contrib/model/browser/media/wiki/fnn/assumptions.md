# Feedforward Neural Networks — Assumptions

A feedforward network sets few conditions on the shape of a relation, but it does set them on its inputs, its loss and its amount of data. The checks of the panel reveal some of the failures and leave others to the user.

## What a Feedforward Network Assumes About Each Sample

Every sample is a vector of **input_size** numbers, and the network treats samples one at a time. Position within the vector has no meaning of its own, and the network has no notion of which features are neighbours. Nothing links one sample to the next. A flattened window of a time series can be fed in, but the network does not know that neighbouring columns are neighbouring times. Autocorrelated samples also make the random split of **Train vs Validation Loss** too kind, because near-copies of training windows land in the validation set. A held-out error far smaller than the error in later use is the usual sign.

## Why Feedforward Networks Need Scaled Inputs

The panel does not scale **Input data** or **Target variable**. Glorot-initialised weights and a learning rate of 0.001 suit inputs and targets of about unit size. A large target leaves the network far from the right scale after 100 epochs, and the loss stays high. Features on very different scales slow training and can dominate the gradient. A loss curve that starts high and falls slowly throughout, or a result that changes when units change, points to this failure. Standardise with training statistics, and undo the target's scaling on the predictions.

## What Mean Squared Error Assumes in Feedforward Networks

**Standard** and **Autoencoder** minimise squared error, which targets a conditional mean and gives outliers a large influence. A target with two likely outcomes is predicted between them, which may be a value that never occurs. Squared error also adds all outputs and all features on one scale, so that an unscaled feature can decide the whole fit of an **Autoencoder**. For a two-mode target, **MDN** is the option that fits. For heavy tails, a robust loss or a transformed target would be needed, and the panel offers neither.

## What a Bottleneck Assumes About the Data

A **latent_dim** smaller than **input_size** assumes that the data lie close to a surface of that dimension. If they do not, reconstruction stays poor whatever the training time. A **latent_dim** equal to or greater than **input_size** lets the network copy its input and compresses nothing. The network does not report the true dimension. Trying several values and watching where the held-out reconstruction error stops falling gives a practical answer. A small code does not guarantee that the coordinates are meaningful or independent.

## What the Fixed Training Recipe of the Feedforward Panel Assumes

Training stops after 100 epochs, with no early stopping and no schedule, so the recipe assumes that 100 epochs at a fixed learning rate are enough and not too many. **Training Loss Curve** shows the first, and **Train vs Validation Loss** the second. The network has many more weights than a linear model, and with few samples it can fit noise closely. The seeds are not set, so two runs give different networks. With **Batch normalisation** on, a final batch of one sample raises an error in current Flux versions, which happens when the sample count leaves a remainder of 1 after division by 64.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
