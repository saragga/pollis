# Recurrent Layers — Flux vs Lux

The two tabs of the Recurrent Layers panel express one network in two frameworks. They differ in where parameters live, how sequences are returned and, for some cells, in which package defaults apply.

## How Flux and Lux Store Parameters of a Recurrent Cell

In **Flux**, weights sit inside the layer objects, and `Flux.train!` overwrites them in place, so `model` is both the structure and the fitted result. In **Lux**, `Chain(...)` holds no numbers. `Lux.setup(Xoshiro(0), model)` creates parameters `ps` and state `st`, and a call has the form `model(x, ps, st)`, returning the output and the new state. That makes it easy to keep several sets of weights for one structure. The price is that `ps` and `st` must be carried around by hand. The trained `st` is passed through `Lux.testmode` before use.

## How Flux and Lux Return Sequences from a Recurrent Cell

The **Flux** tab uses a whole-sequence layer, such as `MGU(input_size => hidden_size)`, which returns all hidden states as **hidden_size** by T by sequences. An anonymous function, `h -> h[:, end, :]`, keeps the last step. The **Lux** tab wraps a one-step cell, such as `MGUCell(input_size => hidden_size)`, in `Recurrence`, which by default returns only the last state. For **Hidden State Heatmap**, the **Lux** code rebuilds the wrapper with `return_sequence=true`, and reuses `ps.layer_1` and `st.layer_1`. Both tabs read sequences with time as the second dimension and sequences as the last.

## How Training Differs Between Flux and Lux in Recurrent Layers

Both tabs use Adam at 0.001, 50 epochs, batches of 32, mean squared error and Enzyme.jl, and both draw the split from `Xoshiro(1)`. **Flux** builds a `DataLoader` and passes `Duplicated(model)` to `Flux.train!`. **Lux** builds a `Training.TrainState`, partitions a fresh `randperm` of the sequences in each epoch, and calls `Training.single_train_step!` with `AutoEnzyme()` and `MSELoss()`. Neither tab includes a layer whose behaviour changes between modes, so dropout and running statistics do not arise here. **Flux** leaves its weight start unseeded, whereas **Lux** starts from `Xoshiro(0)`, but its batch order is unseeded.

## Which Recurrent Cell Defaults Differ Between Flux and Lux

Package defaults are not the same in the two packages for some cells, and the panel passes none of these options. So a cell with one name may have different dynamics in each tab. The values come from the package sources.

| Cell | Default in RecurrentLayers.jl (**Flux**) | Default in LuxRecurrentLayers.jl (**Lux**) |
|---|---|---|
| **coRNN** | dt 0.1, gamma 1.0, epsilon 1.0 | dt 1.0, gamma 0.0, epsilon 0.0 |
| **UnICORNN** | dt 0.1, alpha 0.0 | dt 1.0, alpha 0.0 |
| **FastRNN** | init_alpha 3.0, init_beta -3.0 | init_alpha -3.0, init_beta 3.0 |

At these starts, **FastRNN** in **Flux** weights the candidate heavily and in **Lux** weights the old state heavily. **coRNN** in **Lux** has a larger step and no damping.

## How Weight Initialisation and Bias Differ Between Flux and Lux

**Flux** cells default to `glorot_uniform` weights. **Lux** cells with their default of `nothing` draw shifted Gaussian values scaled by the inverse root of **hidden_size**, so that the two tabs start from different distributions. The standard cells also have different bias layouts: Flux's own `LSTM` and `GRU` have one bias vector, whereas Lux's `LSTMCell` and `GRUCell` have separate biases for the input and state paths. So **Parameter Count** can differ between tabs for one model, as it can in **Compare with LSTM** and **Compare with GRU**.

## How to Move a Recurrent Cell from Flux to Lux

Replace `Name` with `NameCell` inside `Recurrence`, remove the function that selects the last step, and replace the implicit model call with `model(x, ps, st)`. The readout layer is then called `layer_2` in `ps`, and the recurrent layer `layer_1`. **Lux** has no **IntersectionRNN**, **RHN**, **MiRU1** or **MiRU2** in this panel, so those models cannot make the move through the panel. Pass any non-default options explicitly, using the keyword names of each package, as the tables of defaults differ. Expect a difference in results, and test both on held-out sequences instead of assuming the fit carries over.

## How to Choose Between Flux and Lux for Recurrent Cells

**Flux** has the complete catalogue and a compact idiom, which makes it the natural tab for browsing cells. **Lux** suits code that needs explicit state, such as functional composition, or several parameter sets per structure. The panel's code does not compare speed, and neither tab gives statistically different guarantees. A choice made for the sake of a framework should still be checked with **Validation Loss**. Moving between tabs changes starting weights and some defaults, so it is not a pure test of the framework.

## See Also

- [Factsheet](factsheet.md) · [Cell Catalogue](cell-catalogue.md) · [Decision Guide](decision-guide.md)
