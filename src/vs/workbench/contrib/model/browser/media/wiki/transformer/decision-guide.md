# Transformers — Decision Guide

The task usually decides the tab. The harder decisions are whether there is enough data to justify a transformer and how large to make it.

## Which Transformer Tab Fits a Problem

| Task | Tab | Why |
|---|---|---|
| Labelling a whole text or token sequence | **Encoder** | All tokens read each other, and one head predicts the class |
| Generating the next tokens | **Decoder** | A causal mask keeps each position from reading ahead |
| Translating one sequence into another | **Encoder-Decoder** | The decoder reads the encoded source through attention |
| Forecasting a series over a horizon | **Time Series** | Patches form tokens, and all horizons come out at once |
| Predicting a value from text together with numbers | **Cross-Modal** | Numerical features join the text summary before the final layer |

## When a Transformer Is Worth Its Cost

A transformer earns its size with many examples and dependencies that vary in position, such as relations between distant words. With tabular or small time series data, simpler models are usually better and far cheaper. If the task is on text and a pretrained model exists, using it will generally beat training from scratch, which is all that this panel does. Check with **vs Simple Baseline**, and then with a separate later test period.

## How to Choose Sinusoidal or Learned Positions

**Sinusoidal** adds no parameters and gives every position a meaningful vector from the start, so it is the safer choice with limited data. **Learned** can adapt to the specific structure of a task, such as positions with special roles, but it adds **d_model** × **seq_len** weights that must be trained. In this panel, both settings build a table of fixed length, so neither takes an input longer than the table. With plenty of data, the two often perform alike, so the simpler option is a reasonable default.

## How to Size a Transformer

Scale the model to the data, and do not take the defaults as a recommendation. For a few thousand examples, try a **d_model** of 64 or 128, two layers and four heads, with **d_ff** at two to four times **d_model**. Each block's cost grows about with the square of **d_model**. Raise **dropout** from 0.1 to 0.3 when training loss falls far below held-out loss. Compare sizes with **Parameter Count** and held-out loss together, and stop growing the model once the held-out loss stops improving.

## How to Choose the Time Series Inputs

**seq_len** should cover the seasonal cycles that matter, and **patch_size** should be a share of the cycle, so that each token holds a meaningful local shape. A large patch gives fewer tokens and quicker training, and it also blurs fine detail. A longer **pred_len** puts more weight on the flat output layer, whose size is **d_model** × patches × **pred_len**, and so needs more data. For many tasks, a linear model on the same lookback is the benchmark to beat first.

## When to Consider Other Sequence Models

Recurrent or convolutional networks are good options when data are scarce, as their structure compensates for fewer examples. Efficient attention variants matter only for very long sequences, because full attention scales with the square of the length, and the [Efficient Attention](efficient-attention.md) page sets out those choices. Classical forecasting models remain a sensible first choice for a single short series, where a transformer has too few windows to learn from.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Time Series Transformers](time-series.md) · [Cross-Modal Transformers](cross-modal.md)
