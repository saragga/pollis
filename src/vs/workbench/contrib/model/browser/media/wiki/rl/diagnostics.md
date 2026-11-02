# Recurrent Layers — Diagnostics

An exotic cell gets its first test against two plain questions: does it learn more than the mean, and does it beat the standard cells at its size. These Next Steps address those questions and a few mechanical ones.

## How to Check Shapes in the Recurrent Layers Panel

**Output Shapes** prints the prediction shape, and in **Flux** also the hidden-state shape. The prediction should be **output_size** by sequences, and the hidden states **hidden_size** by T by sequences. A wrong order of dimensions is the most common mistake, and it can pass silently when **input_size** happens to equal T or the number of sequences. If **Target Variable** has its dimensions swapped, `Flux.mse` and `MSELoss` may broadcast or fail. Run this step first when a new data set gives a strange error.

## How to Use Validation Loss to Judge a Recurrent Cell

**Validation Loss** prints the held-out mean squared error beside the error of always predicting the training mean. A cell that lies well under the baseline has learned something beyond the average. A cell near the baseline has not, which may reflect a target with no signal, too little data or too few epochs. A cell far over the baseline is overfitting or unstable. Compare with the training error that the main script prints, as a low training error and a high validation error signal overfitting.

## How to Read the Gradient Norm of a Trained Recurrent Cell

**Gradient Norm** prints one number: the norm of the gradient of the training loss over all of `X_train`, at the trained weights. A value near zero at a high loss suggests vanishing gradients or a stuck model. A very large value or `NaN` indicates exploding gradients or unstable dynamics, so scale the data or change the cell. A small value at a low loss is what convergence should look like. The number covers all weights at one moment. It does not show gradients over time, and it does not separate one step of the sequence from another.

## How to Compare a Recurrent Cell with the Standard LSTM or GRU

**Compare with LSTM** and **Compare with GRU** train the standard cell from Flux or Lux at the same **hidden_size** on the same split, then print parameters and validation error for both models. A chosen cell that does as well with fewer parameters is the good outcome. One that loses to both at more parameters has no case on this data. Repeat the run, because weights and batch order differ between runs. In **Flux**, the training call uses a fresh `Adam` state, and each model trains for 50 epochs from its own start.

## How to Spot Parameter Problems in a Recurrent Cell

**Parameter Count** prints the number of trainable values, including the readout. Comparing it with the number of training sequences gives a first warning: far more parameters than target values invite overfitting. Comparing across cells at one **hidden_size** shows how much each design costs, since a multi-gate cell can hold several times the weights of a single-gate one. Counts do not transfer between tabs in every case, because the bias vectors differ. The number alone says nothing of quality.

## What the Recurrent Layers Panel Does Not Check

The panel records no learning curve, so write the training loop to save the error for each epoch if convergence is in doubt. It has no time-ordered split, no repeated runs and no check of hidden-state growth. To test stability, rerun with other seeds and compare the spread of validation errors with the gap between cells. To look for state explosion, compute the largest absolute value in the states of **Hidden State Heatmap** and watch it across sequence lengths. For series forecasts, compare with a naive forecast, which the training-mean baseline does not replace.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
