# Recurrent Neural Networks — Decision Guide

The first question is whether a recurrent network is needed at all. The next is how much data there is, since that largely decides between training the recurrent weights and leaving them fixed.

## Which Recurrent Tab Fits a Problem

| Situation | Tab | Why |
|---|---|---|
| Long dependencies with plenty of data | **LSTM** | A separate memory cell and three gates |
| Similar task, with less data or less time | **GRU** | Two gates and fewer parameters at the same width |
| Few sequences, or very fast fitting is needed | **Echo State** | Only the readout is fitted, in closed form |
| The relevant steps differ from one sequence to the next | **Attention** | The last state can read any earlier step again |

## When to Use Bidirectional or Unidirectional

Choose **Unidirectional** when each output should read only the past, which is the default for forecasting. Choose **Bidirectional** when a whole sequence is known before the prediction, as in labelling a completed window. The second direction doubles the parameters and doubles the width of the readout. It is not available in **Echo State** or **Attention**, as the input **Direction** applies only to **LSTM** and **GRU**.

## When the Echo State Tab Is the Better Start

**Echo State** of [Jaeger and Haas (2004)](#ref-JH2004a) fits in one matrix solve and avoids the problem of vanishing gradients altogether. It suits small samples, chaotic or dynamical signals, and quick screening of whether a recurrent structure helps at all. The cost is a large reservoir compared with the number of fitted outputs, and a result that depends on a random draw. Tune **rho (spectral)** and **alpha (leaking)** by held-out error, and average over several reservoirs before trusting any single one.

## How to Size a Recurrent Network

Start with one layer and a **hidden_size** of 32 to 64, and add width before depth. A second layer rarely helps in small problems, and it adds weights to fit. A rule worth checking is the ratio of parameters to sequences, as an LSTM with 64 units over 10 features already holds about 19,000 weights. Raise **dropout** when the gap between training and held-out error grows, and bear in mind that it acts here only after the last recurrent layer.

## How Recurrent Networks Compare with Other Sequence Models

Convolutional networks train faster and have a fixed window, and they are a good first alternative when the relevant history has a known length. Transformers read any pair of positions, and they usually need more data. Classical models with a few parameters, such as exponential smoothing or autoregressions, are often hard to beat on short and noisy series. Compute a naive forecast and a linear model first, so that any gain from a recurrent network is measured and not assumed.

## References

<a id="ref-JH2004a"></a>Jaeger, H. and Haas, H. (2004). Harnessing nonlinearity: predicting chaotic systems and saving energy in wireless communication. *Science* 304(5667), 78–80. [doi:10.1126/science.1091277](https://doi.org/10.1126/science.1091277)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Bidirectional RNNs](bidirectional.md) · [Extensions](extensions.md)
