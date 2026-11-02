# Recurrent Layers — Overview

Decades of research have produced many recurrent cells, each changing how the state is kept or updated. The Recurrent Layers panel puts them behind one constructor and one training script, which makes a like-for-like trial cheap.

## Why So Many Recurrent Cells Exist

A recurrent cell is a rule that combines the state h(t-1) with the input x(t) to give h(t). The LSTM of [Hochreiter and Schmidhuber (1997)](#ref-HS1997a) added a protected memory and gates, and the gated unit of [Cho, van Merrienboer, Gulcehre, Bahdanau, Bougares, Schwenk and Bengio (2014)](#ref-CMGBB...2014a) folded that design into fewer parts. Later work pulled in different directions: fewer gates to save parameters, automated search for better wiring, and dynamics designed from differential equations to keep gradients stable over long spans. Each design was tested on its authors' benchmarks, so its claims do not transfer automatically to another data set.

## What RecurrentLayers.jl and LuxRecurrentLayers.jl Provide

[Martinuzzi (2025)](#ref-Mar2025a) describes these packages, which implement the cells for several Julia deep learning frameworks. Each cell type is constructed from a pair, `Name(input_size => hidden_size)`, so that replacing one cell by another leaves the surrounding code as it was. The packages offer extra keyword options, such as initialisers and time steps. The panel passes none of these, so every cell runs with its package defaults. In the panel, the choice is one input, **Recurrent Cell**, and the header of the generated code carries a comment on the chosen cell.

## How the Recurrent Layers Panel Builds Its Network

The panel generates the same three-part network for every cell. The recurrent layer reads a batch of sequences of length T, each step having **input_size** features, and updates a state of **hidden_size** numbers. The state from the last step goes to a linear `Dense` layer of size **output_size**. So the network gives one prediction per sequence, not one per step. Training minimises mean squared error for 50 epochs with Adam on 80% of the sequences, and the script prints the mean squared error on both parts of the split.

## How the Flux and Lux Tabs of Recurrent Layers Differ in Style

**Flux** keeps the weights inside the model object and updates them in place, using `Flux.train!`. **Lux** keeps the model as a description with no weights, and passes parameters `ps` and state `st` explicitly at each call. Both tabs differentiate with Enzyme.jl, a reverse-mode tool that works on compiled code. The cells share names across the tabs, though four are available only in **Flux**, and some package defaults differ. The tabs are therefore two routes to similar models, and a result from one is not a replication of the other.

## A Common Workflow in the Recurrent Layers Panel

Prepare `Float32` sequences of the stated shape, scaled, and pick a **Recurrent Cell** and tab. The default cell is **MGU**, a small gated cell. Run the code, which trains and prints both errors. **Output Shapes** confirms the shapes, and **Parameter Count** gives the size. **Validation Loss** compares the held-out error with predicting the training mean. **Compare with LSTM** and **Compare with GRU** train the standard cells on the same split. **Predictions vs Targets**, **Input Sensitivity** and **Hidden State Heatmap** help to read the result. **Predict New Sequences** applies the model to `X_new`.

## References

<a id="ref-CMGBB...2014a"></a>Cho, K., van Merrienboer, B., Gulcehre, C., Bahdanau, D., Bougares, F., Schwenk, H. and Bengio, Y. (2014). Learning phrase representations using RNN encoder-decoder for statistical machine translation. *Proceedings of EMNLP*, 1724–1734. [doi:10.3115/v1/D14-1179](https://doi.org/10.3115/v1/D14-1179)

<a id="ref-HS1997a"></a>Hochreiter, S. and Schmidhuber, J. (1997). Long short-term memory. *Neural Computation* 9(8), 1735–1780. [doi:10.1162/neco.1997.9.8.1735](https://doi.org/10.1162/neco.1997.9.8.1735)

<a id="ref-Mar2025a"></a>Martinuzzi, F. (2025). Unified implementations of recurrent neural networks in multiple deep learning frameworks. arXiv:2510.21252. [doi:10.48550/arXiv.2510.21252](https://doi.org/10.48550/arXiv.2510.21252)

## See Also

- [Factsheet](factsheet.md) · [Cell Catalogue](cell-catalogue.md) · [Decision Guide](decision-guide.md)
