# Recurrent Layers — Decision Guide

The standard LSTM and GRU are the benchmark. A cell from the catalogue is worth keeping when it beats them on held-out sequences by more than the run-to-run noise, or matches their error at a clear saving in size.

## Which Recurrent Cell and Tab Fit the Situation

| Situation | Tab and cell | Why |
|---|---|---|
| A first model with few parameters | Either tab, **MGU** | One gate, and the panel's default |
| Parameters or computing time are tight | Either tab, **JANET**, **UGRNN** or **FastRNN** | Fewer gates or a very simple update |
| Dependencies are thought to span many steps | Either tab, **LEM**, **coRNN** or **IndRNN** | Designed to keep gradients usable over long spans |
| Slow and fast effects are mixed | Either tab, **LEM** or **SCRN** | Learned time scales or a slow context state |
| Input and state widths are equal, and output may pass through | **Flux**, **IntersectionRNN** | Available only there, and needs that equality |
| Several highway steps per input | **Flux**, **RHN** | Available only there |
| A functional style with explicit state | **Lux**, any of the 33 | Parameters and state are passed by hand |

## Whether to Use the Recurrent Layers or the Recurrent Neural Networks Panel

Recurrent Layers trains one layer with one script and no dropout, so that cells are the only thing changing. Recurrent Neural Networks has depth, dropout, direction, attention and an echo state tab, and is the better start when one of those is needed or when no special reason favours an unusual cell. Move to Recurrent Layers after a standard model exists to beat. Its results use a random split, and its code is short enough to adapt by hand.

## How Much a Recurrent Cell Choice Is Likely to Matter

Published comparisons give modest expectations. [Greff, Srivastava, Koutnik, Steunebrink and Schmidhuber (2017)](#ref-GSKSS2017a) tested eight LSTM variants on three tasks and found none clearly better than the standard form. [Collins, Sohl-Dickstein and Sussillo (2016)](#ref-CSS2016a) found that common architectures reach similar capacity per parameter once trained well, and differ mainly in how easily they train. So a large gain from a cell swap deserves suspicion until it is repeated. Those studies do not cover every cell in the panel, and a task with very long dependencies may be an exception.

## How to Choose Width for a Recurrent Cell

**hidden_size** starts at 64, and the tooltip gives a typical range of 32 to 512. Parameter count grows with its square for a dense recurrent matrix. To compare cells fairly by capacity, change **hidden_size** per cell until **Parameter Count** gives a similar figure, since **Compare with LSTM** and **Compare with GRU** hold width equal instead. If training and validation errors are both high and close, try more width, and if the gap is wide, try less. With few sequences, stay small, as the panel has no dropout to fall back on.

## Which of Flux or Lux to Choose for Recurrent Layers

Choose by the rest of the project. **Flux** suits a project already written with mutable models, and it has all 37 cells. **Lux** suits explicit state, composable functional code, and reuse of parameters without a model object. Neither tab is presented here as more accurate, and the panel makes no speed claim. If the wanted cell is **IntersectionRNN**, **RHN**, **MiRU1** or **MiRU2**, the panel offers it only under **Flux**.

## References

<a id="ref-CSS2016a"></a>Collins, J., Sohl-Dickstein, J. and Sussillo, D. (2016). Capacity and trainability in recurrent neural networks. arXiv:1611.09913. [doi:10.48550/arXiv.1611.09913](https://doi.org/10.48550/arXiv.1611.09913)

<a id="ref-GSKSS2017a"></a>Greff, K., Srivastava, R. K., Koutnik, J., Steunebrink, B. R. and Schmidhuber, J. (2017). LSTM: a search space odyssey. *IEEE Transactions on Neural Networks and Learning Systems* 28(10), 2222–2232. [doi:10.1109/TNNLS.2016.2582924](https://doi.org/10.1109/TNNLS.2016.2582924)

## See Also

- [Cell Catalogue](cell-catalogue.md) · [Flux vs Lux](flux-vs-lux.md) · [Assumptions](assumptions.md)
