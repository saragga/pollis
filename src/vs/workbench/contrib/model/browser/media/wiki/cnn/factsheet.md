# Convolutional Neural Networks — Factsheet

The Convolutional Neural Networks panel trains one-dimensional convolutional networks on sequences, in Flux.jl, to map each sequence to one output vector. The three tabs differ in how far back each output can see.

## What the Convolutional Neural Networks Panel Does

| Item | Description |
|---|---|
| **Purpose** | Sequence regression: one target vector per input sequence |
| **Julia stack** | Flux.jl for the layers and training; Plots.jl for the Next Steps |
| **Models** | 1D Conv, Dilated Conv and TCN tabs |
| **Input shape** | **Sequence data** is T × in_channels × n; **Target variable** is output_size × n |
| **Training** | Mean squared error, Adam with learning rate 0.001, batches of 32, 100 epochs |
| **Key choice** | How long a history the receptive field must cover |

## How Far Back Each Convolutional Tab Sees

The receptive field is the number of time steps that can influence one output. A larger value allows longer patterns, but it does not ensure the network learns them.

| Tab | Dilations | Receptive field in steps | With the default inputs |
|---|---|---|---|
| **1D Conv** | 1 in every layer | 1 + num_layers × (kernel_size − 1) | 9 |
| **Dilated Conv** | dilation_base^(l − 1) at layer l | 1 + (kernel_size − 1) × sum of the dilations | 31 |
| **TCN** | 2^(b − 1) at block b | 1 + 2 × (kernel_size − 1) × (2^num_blocks − 1) | 61 |

## Which Inputs Each Convolutional Tab Uses

**in_channels**, **out_channels**, **kernel_size** and **output_size** apply to all three tabs. **Padding** applies to **1D Conv** and **Dilated Conv**, since **TCN** is always causal. **num_layers** applies to the first two, and **dilation_base** to **Dilated Conv** alone. **num_blocks** and **dropout** apply to **TCN** alone. The **TCN** dilations always double, whatever **dilation_base** holds.

## See Also

- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Causal & Multi-Channel Guide](causal-multichannel.md)
