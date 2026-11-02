# Recurrent Layers — Factsheet

The Recurrent Layers panel trains one recurrent cell from a catalogue of 37 inside a fixed regression script, so that cells can be swapped and compared. The Recurrent Neural Networks panel covers the standard architectures with more settings.

## What the Recurrent Layers Panel Does

| Item | Description |
|---|---|
| **Purpose** | Try less common recurrent cells on sequence regression and compare them with a standard LSTM and GRU |
| **Julia stack** | RecurrentLayers.jl with Flux.jl, or LuxRecurrentLayers.jl with Lux.jl and Optimisers.jl; Enzyme.jl for gradients in both |
| **Models** | **Flux** and **Lux**, with **Recurrent Cell** chosen inside each |
| **Input shape** | **Sequence Data** as `Float32` of size **input_size** by T by sequences; **Target Variable** as **output_size** by sequences |
| **Network** | One recurrent layer, the hidden state of the last step, then a linear `Dense` readout |
| **Key choice** | The cell, which sets the memory mechanism and the parameter count at a given **hidden_size** |

## How the Recurrent Layers Panel Trains a Cell

All training settings are fixed in the generated code and have no inputs of their own. The only inputs that change the network are **Recurrent Cell**, **input_size**, **hidden_size** and **output_size**.

| Setting | Value in the code |
|---|---|
| Loss | Mean squared error |
| Optimiser | Adam at learning rate 0.001 |
| Epochs and batch size | 50 epochs, 32 sequences per batch |
| Hold-out | 20% of the sequences, by a random permutation with seed 1 |
| Regularisation | None: no dropout, gradient clipping or early stopping |

## What Differs Between the Flux and Lux Tabs of Recurrent Layers

| Aspect | **Flux** | **Lux** |
|---|---|---|
| Cells offered | All 37 | 33: no **IntersectionRNN**, **RHN**, **MiRU1** or **MiRU2** |
| Constructor | `MGU(input_size => hidden_size)`, a whole layer | `Recurrence(MGUCell(input_size => hidden_size))` |
| Last hidden state | Taken from the sequence by `h -> h[:, end, :]` | Returned by `Recurrence` |
| Parameters | Held inside `model` | Held apart in `ps` and `st` |
| Training call | `Flux.train!` on `Duplicated(model)` | `Training.single_train_step!` with `AutoEnzyme()` |
| Weight seed | Not set | `Xoshiro(0)` |

## See Also

- [Overview](overview.md) · [Cell Catalogue](cell-catalogue.md) · [Flux vs Lux](flux-vs-lux.md)
