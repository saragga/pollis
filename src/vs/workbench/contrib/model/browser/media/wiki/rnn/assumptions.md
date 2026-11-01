# Recurrent Neural Networks — Assumptions

A recurrent network applies one update rule at every step and compresses the past into a fixed-size state. The assumptions below come from that structure and from how the panel trains it.

## What a Shared Update Rule Assumes

The same weights apply at all time steps, so the relation between the state, the new input and the next state is taken to be stable over the whole sequence. A series whose dynamics change, through a structural break or a shift in volatility, breaks this. Recurrent networks can in principle learn to respond to regimes, but only ones present in training. Levels of a trending series meet unseen ranges in use, so differences or returns and training-sample scaling are usually safer.

## What a Fixed-Size State Assumes

The state must summarise everything relevant from the past in **hidden_size** numbers. With the last state as the only input to the readout, a long sequence must pass through this bottleneck, and early details fade. The **Attention** tab eases this limit by letting the last state read all earlier steps again. In **Echo State**, the size is set by **reservoir_size**, and memory is further limited by **rho (spectral)** and **alpha (leaking)**.

## Why Long Dependencies Are Hard to Learn

[Bengio, Simard and Frasconi (1994)](#ref-BSF1994a) showed that training by gradient descent becomes harder as the span of a dependency grows, as gradients vanish or explode across many steps. The gated cells of [Hochreiter and Schmidhuber (1997)](#ref-HS1997a) and of [Cho, van Merrienboer, Gulcehre, Bahdanau, Bougares, Schwenk and Bengio (2014)](#ref-CMGBB...2014a) ease the vanishing but do not remove it. So a dependency that spans hundreds of steps can remain out of reach, however large the state.

## What the Fixed Reservoir Assumes

**Echo State** assumes that a random recurrent network already produces states rich enough for a linear readout. No gradient adapts the reservoir to the task. The echo state property, under which the effect of early inputs and starting state fades away, is commonly sought with a spectral radius below 1, though this is a rule of thumb and not a guarantee. The reservoir comes from an unseeded random draw, so each run gives a different model.

## What Direction Assumes About Timing

**Unidirectional** reads the past only, and suits prediction of later values. **Bidirectional** runs a second pass from the end of the sequence and averages over all steps, so every output reads the whole window. This is valid only when the entire window is known at the moment of prediction, as in classifying a completed sequence. For a forecast, it is safe only if the target lies strictly after the window, and even then the most recent step gets no special role.

## What the Training Setup Assumes

Mean squared error targets the conditional mean and is sensitive to outliers. Training windows are shuffled in batches, each window beginning from a zero state, so the network learns from its window alone and does not carry state across windows. Hence dependencies longer than T cannot be learned. Overlapping windows are dependent, so judge the model on a split that respects time, with enough sequences to support the weights.

## References

<a id="ref-BSF1994a"></a>Bengio, Y., Simard, P. and Frasconi, P. (1994). Learning long-term dependencies with gradient descent is difficult. *IEEE Transactions on Neural Networks* 5(2), 157–166. [doi:10.1109/72.279181](https://doi.org/10.1109/72.279181)

<a id="ref-CMGBB...2014a"></a>Cho, K., van Merrienboer, B., Gulcehre, C., Bahdanau, D., Bougares, F., Schwenk, H. and Bengio, Y. (2014). Learning phrase representations using RNN encoder-decoder for statistical machine translation. *Proceedings of EMNLP*, 1724–1734. [doi:10.3115/v1/D14-1179](https://doi.org/10.3115/v1/D14-1179)

<a id="ref-HS1997a"></a>Hochreiter, S. and Schmidhuber, J. (1997). Long short-term memory. *Neural Computation* 9(8), 1735–1780. [doi:10.1162/neco.1997.9.8.1735](https://doi.org/10.1162/neco.1997.9.8.1735)

## See Also

- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Bidirectional RNNs](bidirectional.md)
