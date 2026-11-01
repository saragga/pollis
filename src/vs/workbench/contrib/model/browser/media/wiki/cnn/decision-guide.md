# Convolutional Neural Networks — Decision Guide

The first decision is whether the prediction concerns a finished sequence or the next step after it. The second is how much history the output needs to reach.

## Which Convolutional Tab Fits a Problem

| Situation | Tab | Why |
|---|---|---|
| Short local patterns, anywhere in the sequence | **1D Conv** | Few parameters, and a small receptive field is enough |
| Long windows, with no need for residual blocks | **Dilated Conv** | Receptive field grows exponentially with **num_layers** |
| Forecasting from a long history | **TCN** | Always causal, with skip connections that help deep networks train |
| Needs a regularised deep network | **TCN** | **dropout** is available only in this tab |

## When to Use Causal or Same Padding

Choose **Causal** when the output should depend on the end of the window, as when predicting the value that follows it. Choose **Same (acausal)** when classifying or scoring a whole, finished sequence and the position of a pattern is not important. **Same (acausal)** also takes global max pooling in these tabs, so it discards timing. **TCN** has no such choice, since causal padding is part of its definition.

## How to Size the Receptive Field

Start from the longest dependency the problem plausibly has, such as a full seasonal cycle, and pick values that cover it. Use **kernel_size** between 3 and 9 and adjust depth first, as depth adds reach cheaply under dilation. A receptive field much longer than the input window adds parameters and no extra information. For **Dilated Conv**, a **dilation_base** of 2 covers all steps, and a larger base with a small kernel can leave gaps between the steps that an output reads.

## How to Size a Convolutional Network

Start with few filters, such as 32 for **out_channels**, and two to four layers or blocks. Increase them only if **Held-Out Error** shows underfitting. With few sequences, a large network has far more parameters than observations and will memorise them. Set **dropout** between 0.1 and 0.3 in **TCN** when the gap between training and held-out error grows, and leave it at 0 on small problems at first to confirm that the network can fit at all.

## How Convolutional Networks Compare with Other Sequence Models

Convolutional networks train in parallel across time and have a fixed, known memory length, and they suit large numbers of fixed-length windows. Recurrent networks handle variable lengths more naturally and carry state beyond a fixed window. Transformers read relations between any two positions, and need more data to do so well. On small and noisy samples, classical time series models and **vs Linear Baseline** are often hard to beat, and they should be run first.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Causal & Multi-Channel Guide](causal-multichannel.md)
