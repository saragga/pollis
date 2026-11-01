# Recurrent Neural Networks — Interpretation

The weights of a recurrent network do not map onto features or lags as regression coefficients do. What can be read is how the state behaves over time and which inputs change the output.

## How to Read Hidden States

**Hidden States** shows a heatmap of the first recurrent layer over time for the first sequence, with one row per unit. Units that change sharply at known events have probably learned to track them. Units that hold steady carry slow information, while those that saturate at their extremes for long spells may have stopped responding. In **Echo State**, the plot shows the reservoir, whose units are random and were not trained, so no one unit has a meaning of its own.

## How to Read Input Saliency in a Recurrent Network

The heatmap from **Input Saliency** has one row for each input feature and one column for each time step. Bright cells mark where a small change in input would move the prediction most, for this one sequence. A recency pattern, with brightness on the right, is typical. Bright cells far back in time indicate long memory in the fitted model, though not necessarily a real dependency in the data, as gradients describe the model alone.

## What the Echo State Parameters Mean

**rho (spectral)** controls how long inputs echo in the reservoir, with values near 1 holding memory longer and smaller values forgetting faster. **alpha (leaking)** sets how quickly states follow new inputs, where a low value gives slow, smooth states suited to slow dynamics. **sparsity** is the fraction of reservoir weights set to zero, and it affects the cost of computation more than the fit. Together with the input scale, these inputs set the time scale of the model, so they carry a meaning that hidden units do not.

## What the Attention Tab Does and Does Not Reveal

In the **Attention** tab, the last state queries every step, so attention weights show which steps entered the summary. This resembles the alignment idea of [Bahdanau, Cho and Bengio (2014)](#ref-BCB2014a). The weights are readable, but the GRU states they weigh already mix earlier inputs, so a weight on step t does not isolate the input at step t. Note also that the panel's **Hidden States** shows the GRU states and not these weights, and they must be obtained separately.

## How to Read a Comparison of LSTM and GRU

The study of [Chung, Gulcehre, Cho and Bengio (2014)](#ref-CGCB2014a) found gated cells better than a plain recurrent one, without a clear winner between them, so a small gap on one dataset should not be read as a general ranking. The GRU has fewer parameters for the same **hidden_size**. When two gated tabs score alike, prefer the smaller one. A gap in error smaller than the movement between runs with different starting weights says nothing.

## How Much to Trust a Recurrent Prediction

These tabs give point predictions with no standard error. Measure the spread of held-out errors, or retrain from several random initial weights, to judge uncertainty. Distrust predictions for sequences unlike those in training, as the network will give an answer with no warning. For a forecast, ask first whether a naive or classical model does as well, since a recurrent network that merely repeats the last value can look accurate on a plot.

## References

<a id="ref-BCB2014a"></a>Bahdanau, D., Cho, K. and Bengio, Y. (2014). Neural machine translation by jointly learning to align and translate. arXiv:1409.0473. [doi:10.48550/arXiv.1409.0473](https://doi.org/10.48550/arXiv.1409.0473)

<a id="ref-CGCB2014a"></a>Chung, J., Gulcehre, C., Cho, K. and Bengio, Y. (2014). Empirical evaluation of gated recurrent neural networks on sequence modeling. arXiv:1412.3555. [doi:10.48550/arXiv.1412.3555](https://doi.org/10.48550/arXiv.1412.3555)

## See Also

- [Diagnostics](diagnostics.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
