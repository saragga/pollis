# Convolutional Neural Networks — Diagnostics

A falling training loss says only that the optimiser is working. These checks ask whether the network has learned something that holds on data it has not seen.

## How to Read the Training Curve of a Convolutional Network

**Training Curve** continues training and records the mean squared error after each epoch. A curve that is still falling at the end calls for more epochs. A curve that is flat from the start points to a learning rate problem, unscaled inputs or a target with little signal. Sharp spikes suggest a learning rate that is too high for the scale of the data. A loss that becomes `NaN` nearly always means unscaled data or an exploding gradient.

## How to Detect Overfitting in a Convolutional Network

**Held-Out Error** compares the error on training sequences with the error on held-out sequences, `X_test` and `y_test`. A small gap with a low error is the aim. A large gap means the filters have memorised the training windows, so reduce **out_channels** or depth, raise **dropout** in **TCN**, or gather more data. For time series, hold out the latest windows rather than a random sample: overlapping neighbours in a random split share most of their values, and the held-out error then looks better than it is.

## How to Check Whether the Network Beats a Simple Model

**vs Linear Baseline** fits least squares to the flattened input windows and compares the held-out error with that of the network. A network that does not beat this baseline has found no useful nonlinearity, so the simple model is the better choice. On noisy financial series, losing to a linear model or to a naive forecast is a common result, and it is informative in itself.

## How to Read Predictions Against Targets

**Predictions vs Targets** plots each prediction against its target, and the points should lie along the diagonal. A cloud flatter than the diagonal means the network predicts close to the mean, which is what mean squared error rewards when the signal is weak. A curved cloud points to a missing nonlinearity or scale, and a few distant points to outliers that dominate the loss.

## How to Check the Receptive Field in Practice

**Input Saliency** shows the gradient of a prediction with respect to each time step and channel, and so reveals the effective receptive field. Weight piled against the oldest visible step suggests a window that is too short. Weight concentrated on the last few steps of a long receptive field shows that most of the available history is unused, and a smaller network may do as well.

## When a Multi-Step Forecast Drifts

**Recursive Multi-Step Forecast** feeds each prediction back as the newest input for 12 steps, so errors feed on themselves. It needs **in_channels** equal to **output_size**, and it warns when the model uses global max pooling, which cannot tell the newest value from an old one. Forecasts that explode or collapse to a constant after a few steps are a warning that the one-step fit does not carry over. Check the one-step error first, as it sets a lower limit on what the recursion can reach.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
