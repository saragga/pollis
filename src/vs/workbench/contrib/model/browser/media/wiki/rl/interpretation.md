# Recurrent Layers — Interpretation

The panel's outputs describe one trained copy of one cell. They show what that copy does on particular sequences, and that is a narrower claim than what the cell can do in general.

## How to Read the Printed Errors of a Recurrent Cell

The main script prints `Train MSE` and `validation MSE`, in squared units of the target as supplied. A root gives a number in target units, which is usually easier to judge. Validation error above training error is normal. Validation error under training error can occur by chance on a small split. Neither number is a test error once it has been used to choose among cells, because the choice itself draws on the validation sequences. Keep a third set apart if a final estimate is needed.

## How to Read Predictions Against Targets for a Recurrent Cell

**Predictions vs Targets** plots the held-out sequences, with a dashed diagonal for perfect prediction. Points on the diagonal are the aim. A nearly horizontal band says that the cell is predicting close to one value, however low the training error was. A slope with the right direction but too shallow reflects shrinkage under squared error with a weak signal. Scatter that widens with the target suggests a need for a transformation. With **output_size** above 1, all outputs share one plot, so that a poor output can hide among good ones.

## How to Read the Hidden State Heatmap of a Recurrent Cell

**Hidden State Heatmap** shows each hidden unit against time for the first sequence, using the trained weights. Units that change slowly are holding memory, and units that follow the input are acting as filters. Colours pinned at the same extreme suggest saturation in cells that use `tanh`. Colours that deepen steadily along the time axis point to growing state in cells without a bound, such as **coRNN**. The order of units has no meaning, and the plot covers only one sequence. A unit's pattern does not prove that the readout uses it.

## How to Read the Final Hidden State of a Recurrent Cell

**Final Hidden State** prints the vector that the readout sees after the last step of the first sequence, and every prediction is a linear function of such a vector. Values at the limits of a bounded range suggest saturation, and many near-zero values suggest unused width. Single elements do not have a fixed meaning between runs. For a cell with an extra memory, such as **OriginalLSTM** or **coRNN**, the printed vector is the output state and leaves out the second state that the cell also carries.

## How to Read Input Sensitivity of a Recurrent Cell

**Input Sensitivity** draws a heatmap of the absolute gradient of the summed prediction for the first sequence, by input feature and time step. Bright cells at distant steps show that those steps influence the output locally. Comparing the map across cells of the catalogue shows how far back each cell reads. The map is local to one sequence and to current weights. It is not an attribution of the prediction, and it says nothing about causes. With **output_size** above 1, opposite effects on different outputs can cancel in the sum before the absolute value is taken.

## What Common Misreadings Arise with Recurrent Cell Comparisons

| Reading | Why it can mislead |
|---|---|
| A cell wins, so it is the best design | One run on one split at package defaults |
| Fewer parameters at one width means a simpler fit | Training ease and memory behaviour also differ |
| A stable cell cannot forget | Stability concerns gradients and dynamics, not retention of a given signal |
| A long-memory cell finds long dependencies | The data must hold them, and 50 epochs must suffice to find them |
| **Flux** and **Lux** runs of one cell should agree | Starts, biases and some defaults differ |

## See Also

- [Diagnostics](diagnostics.md) · [Cell Catalogue](cell-catalogue.md) · [Decision Guide](decision-guide.md)
