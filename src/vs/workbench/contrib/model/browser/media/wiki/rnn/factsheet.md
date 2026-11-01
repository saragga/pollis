# Recurrent Neural Networks — Factsheet

The Recurrent Neural Networks panel fits sequence models in Flux.jl, mapping each input sequence to one output vector. Three of the tabs learn their recurrent weights by gradient descent, and the fourth leaves them fixed and fits only a linear readout.

## What the Recurrent Neural Networks Panel Does

| Item | Description |
|---|---|
| **Purpose** | Sequence regression: one target vector per input sequence |
| **Julia stack** | Flux.jl for layers and training; LinearAlgebra for the Echo State readout |
| **Models** | **LSTM**, **GRU**, **Echo State** and **Attention** tabs |
| **Input shape** | **Sequence data** is input_size × T × n; **Target variable** is output_size × n |
| **Training** | Mean squared error, Adam with learning rate 0.001, batches of 32, 100 epochs |
| **Echo State training** | Ridge regression in closed form, with a penalty of 0.000001 |

## How Each Recurrent Tab Builds Its Prediction

| Tab | Recurrent part | What reaches the readout |
|---|---|---|
| **LSTM** | Stack of LSTM layers | Last hidden state, or the time average with **Bidirectional** |
| **GRU** | Stack of GRU layers | Last hidden state, or the time average with **Bidirectional** |
| **Echo State** | One fixed random reservoir | Last reservoir state, through a ridge readout |
| **Attention** | One GRU, then multi-head attention | Attention summary, with the last state querying all steps |

## Which Inputs Each Recurrent Tab Uses

**input_size** and **output_size** apply to all four tabs. **hidden_size** applies to all but **Echo State**. **num_layers**, **dropout** and **Direction** apply to **LSTM** and **GRU**, where **dropout** acts once, after the last recurrent layer. **reservoir_size**, **rho (spectral)**, **sparsity** and **alpha (leaking)** apply to **Echo State**. **num_heads** applies to **Attention**, and it should divide **hidden_size**.

## See Also

- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Bidirectional RNNs](bidirectional.md) · [Extensions](extensions.md)
