# Recurrent Layers — Assumptions

A shared script for 37 cells takes the same data shape, package defaults and training budget for all of them.

## What the Recurrent Layers Script Assumes About the Task

The network gives one prediction per sequence, read from the hidden state after the last step. So the task must be sequence-to-one regression. A target for each time step cannot be fitted without changing the code. All sequences in a batch must have one length T, since **Sequence Data** is a three-dimensional array. The loss is squared error and the readout is linear, so the network fits a numeric target.

## What Package Defaults Assume About a Recurrent Cell

The panel calls `Name(input_size => hidden_size)` with no other argument. Time steps, damping, scaling constants and depth therefore stay at their package defaults, even though the source papers often tune them for each task. **coRNN**, **UnICORNN**, **LEM** and the antisymmetric cells are the most exposed to this, as their stability depends on such constants. **RHN** runs at the default depth of 3. A poor result under these defaults does not show that a cell cannot do better under tuning. Neither does a good result carry over to other values.

## What IntersectionRNN Requires in the Recurrent Layers Panel

**IntersectionRNN** needs **input_size** equal to **hidden_size**, as its output is a gated mix of the input and a transformed state. The package stops with an `ArgumentError` when the two differ, so the code sets **hidden_size** to the value of **input_size** for this cell. That changes the capacity available, so a comparison with other cells needs them run at the same width. The requirement concerns **Flux** only, because **Lux** does not offer this cell.

## What the Random Hold-Out in Recurrent Layers Assumes

The split draws 20% of the sequences at random, with a fixed seed, so it treats sequences as exchangeable. That is sound for separate units, such as one sequence per subject or per document. It fails for sliding windows from one series, where sequences overlap and neighbours lie on both sides of the split. In that case, build `X_val` and `y_val` from the latest windows and overwrite those variables, or evaluate on a later test set. A random split of overlapping windows gives a validation error lower than the model would reach on later data.

## What Fixed Training Settings Assume About Each Cell

Fifty epochs at a learning rate of 0.001 with no clipping treat all cells as having a similar speed of training. Cells with slow dynamics or small initial steps may still be improving at the end, and unbounded states such as those of **coRNN** may grow without clipping to restrain them. **Sequence Data** and **Target Variable** reach the network as given. Standardise features and target with training statistics, since cells with `tanh` state cannot represent a large level directly, and a linear readout must then stretch to reach it. The number of sequences must also support the parameters that **Parameter Count** reports.

## What a Comparison of Recurrent Cells Assumes

**Compare with LSTM** and **Compare with GRU** train each model once at the same **hidden_size**. Width is not capacity, as cells at one width differ several times over in parameter count. A single run also mixes the effect of the cell with that of its random start, more so in **Flux**, whose starting weights are random on each run. A small difference on a small validation set may be noise. Treat a difference as real only when it holds across repeated runs and, for serial data, on a split that respects time.

## See Also

- [Cell Catalogue](cell-catalogue.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
