# Transformers — Interpretation

Attention maps are attractive because they look like explanations. This page covers what they show, what they do not, and how to read the other outputs of the panel.

## How to Read an Attention Map

**Attention Map** shows, for the first example, the attention weights of one head in the first block: each row is a querying position, and each column a position being read. A bright cell says that this position took a large share of its output from that one. The diagonal often stands out, since a position usually reads itself. Stripes may mark a token that many positions read, such as a delimiter. Other heads may show a quite different pattern, so one head is only a sample of the whole.

## Whether Attention Weights Explain a Prediction

[Jain and Wallace (2019)](#ref-JW2019a) found that attention weights often correlate weakly with other measures of feature importance, and that quite different weights can produce the same prediction. An attention weight records one step in a computation that continues through residual paths, feed-forward layers and later blocks. It is a description of how information moved, and it does not show what caused a prediction. Use it to form a hypothesis, then test it by changing the input and seeing how the output moves.

## What the Size of a Model Means

**Parameter Count** gives the total, the count for one block and the count for the embedding. With token inputs, the embedding often accounts for a large share, since it holds **vocab_size** × **d_model** weights. This figure, set against the number of examples, says how much memorisation is possible. A larger model that does no better on held-out data has shown that its extra capacity was not needed, and the smaller model should be preferred.

## How to Read Generated Output

**Predict New Data** gives classes in **Encoder**, generated tokens in **Decoder** and **Encoder-Decoder**, forecasts in **Time Series** and values in **Cross-Modal**. Tokens that come out repetitive after a few steps are normal for a small model with greedy choice, and do not necessarily mean that the code is faulty. Cross-entropy per position is a sounder measure than reading samples by eye. A random guess among V tokens gives a cross-entropy of log(V), which sets a useful upper mark.

## How to Read a Cross-Modal Result

**Cross-Modal** adds the projected numbers to the text summary before the final layer. To learn what text contributes, compare with the least-squares baseline in **vs Simple Baseline**, which uses only numbers. A model that beats it on held-out data shows that the text carries extra information about the target, in that sample. A model that matches it says the numbers did the work, and the text encoder only added weights to fit.

## How to Read a Forecast from a Transformer

A **Time Series** forecast is one direct mapping from a lookback to the horizon, so all **pred_len** values come out at once and do not feed back on one another. Smooth forecasts that miss turning points are common, as mean squared error rewards the average of possible futures. A forecast that beats repeating the last value on a later test period is real evidence of skill. Beating it inside the training data alone says nothing about skill, since a large enough network can recall past windows.

## References

<a id="ref-JW2019a"></a>Jain, S. and Wallace, B. C. (2019). Attention is not explanation. *Proceedings of NAACL-HLT 2019*, 3543–3556. [doi:10.18653/v1/N19-1357](https://doi.org/10.18653/v1/N19-1357)

## See Also

- [Diagnostics](diagnostics.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
