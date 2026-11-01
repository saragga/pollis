# Convolutional Neural Networks — Assumptions

A convolutional network has no formal statistical model behind it, but its design builds in beliefs about the data. A prediction is only as good as the fit between those beliefs and the sequence at hand.

## What Weight Sharing Assumes About a Sequence

Sharing filters across time assumes translation invariance: a shape means the same thing wherever it occurs. Max pooling strengthens this belief by discarding where the strongest response happened. The assumption suits repeated local patterns, and it suits less well a series whose meaning depends on absolute position or on a change of regime, since a filter cannot tell an early occurrence from a late one on its own.

## What a Receptive Field Assumes About Memory

Each output depends on a fixed window of past steps. Anything older cannot reach it, unlike a recurrent state that can in principle carry information indefinitely. Choosing **kernel_size**, **num_layers** or **num_blocks** therefore states the longest dependency the network is allowed to use. With **Causal** padding, a dependency longer than the receptive field is invisible, however long the training runs.

## Why Stationary Windows Matter for Convolutional Networks

Training windows and later windows should come from a similar distribution. A network trained on levels of a trending series meets values outside its training range when used on later data, and convolutional filters extrapolate poorly there. Differencing or using returns, and scaling with statistics from the training period only, reduce the problem. Time series windows also overlap and are dependent, so the effective sample is smaller than the number of windows.

## What Causal and Same Padding Assume About Timing

**Causal** padding keeps every output from reading later steps in its sequence, and this matters when a sequence continues past the moment of prediction. **Same (acausal)** padding lets outputs read both sides, which is safe only when the entire sequence is known at that moment, as in classifying a finished window. Neither setting protects against leakage created outside the network, such as scaling with the full sample or windows that overlap the target.

## What the Training Setup Assumes

The tabs use mean squared error, so they target the conditional mean and are sensitive to outliers and to the scale of **Target variable**. Fixed choices of 100 epochs, batches of 32 and a learning rate of 0.001 assume a problem of moderate size with inputs near unit scale. The `DataLoader` shuffles windows, which is standard for training, but the split used to judge the model must still respect time. A small dataset gives far too few examples for a network with many filters.

## See Also

- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Causal & Multi-Channel Guide](causal-multichannel.md)
