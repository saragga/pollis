# Recurrent Neural Networks — Diagnostics

Recurrent networks can fit noise and still look sensible on a plot of predictions. These checks separate real signal from memorisation, and a sound model from a numerically unstable one.

## How to Read the Recurrent Training Curve

For **LSTM**, **GRU** and **Attention**, **Training Curve** continues training for 100 more epochs and plots the mean squared error on a log scale. A curve still falling calls for more epochs, and a curve flat from the start points to unscaled inputs, too low a learning rate or little signal. Spikes that recur are often exploding gradients, for which scaling the data is the first remedy. A training curve shows nothing about generalisation.

## How to Tune the Echo State Readout

**Echo State** has no epochs, so **Training Curve** plots the training error against the ridge penalty, from 0.00000001 to 10. A very small penalty lets the readout chase noise, and a very large one shrinks predictions towards zero. Choose by error on held-out sequences, as training error can only fall as the penalty falls. If no penalty works, change the reservoir instead, trying other values of **rho (spectral)** and **alpha (leaking)** or a larger **reservoir_size**.

## How to Detect Overfitting in a Recurrent Network

**Held-Out Error** compares the error on training sequences with the error on held-out sequences, `X_test` and `y_test`, in the same shape. A large gap means the network has memorised windows, so reduce **hidden_size** or **num_layers**, or raise **dropout**. Hold out the latest windows and not a random sample. With overlapping windows, a random split places near-copies of training data in the test set, and the error looks far better than it would in use.

## How to Check Whether the Network Beats a Simple Model

**vs Linear Baseline** fits least squares to the flattened input windows and compares the held-out error with that of the network, on `X_test` and `y_test`. A network that does not beat this baseline has found no useful nonlinearity, so the simple model is the better choice. On noisy financial series, losing to a linear model or to a naive forecast is a common result, and it is informative in itself.

## How to Check Long Memory with Input Saliency

**Input Saliency** shows the absolute gradient of the output with respect to each input feature and time step, for the first sequence. Gradients that fade quickly going back in time show how far the network effectively reads, and that length often proves to be much shorter than the window. If the data are known to have longer dependencies, the training has not found them, which suggests a gated cell, **Attention** or a shorter problem.

## When a Multi-Step Forecast Fails

**Recursive Multi-Step Forecast** feeds predictions back for 12 steps as the newest input, and needs **input_size** equal to **output_size**. Errors compound, so a forecast may settle on a constant, oscillate or diverge. Settling on a constant is common when the one-step signal is weak, as the network has learned to predict near the mean. With **Bidirectional**, the last step has no special role in the output, so a recursive forecast is not a natural use of the model.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
