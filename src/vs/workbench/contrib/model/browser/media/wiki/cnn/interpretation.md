# Convolutional Neural Networks — Interpretation

Filters and saliency maps give clues about what a convolutional network uses, not explanations in the sense of a regression coefficient. Read them as pointers to check, and confirm any conclusion with held-out data.

## What the Learned Filters Show

**Learned Filters** displays the kernel weights of the first layer for the first input channel. Weights of one sign act as local averages, and weights with a sign change act as detectors of a rise or a fall. Filters that look like random noise suggest that training has not found structure, or that the layer has more filters than it needs. Only the first layer can be read this directly, as deeper filters act on feature maps and not on the original inputs.

## How to Read Feature Maps

**Feature Maps** is a heatmap of the first layer's responses over time for the first sequence. Each row is a filter and each column a time step, so a bright patch marks where a filter fired strongly. Patterns that line up with known events suggest that the filter has found them. Rows that stay silent throughout may be dead filters: with the rectified linear activation, a unit that outputs zero for all inputs receives no gradient.

## How to Read Input Saliency

**Input Saliency** gives the gradient of the prediction with respect to every step and channel of one sequence. A large value means the output would change most in response to a small change at that point. A gradient is a local measure for one input, and it describes the sensitivity of the model and not a causal effect in the data. Averaging over many sequences is steadier than reading one, and channels on different scales should be compared only after scaling.

## What the Number of Filters and Layers Means

Depth and width are capacity, and they carry no direct meaning about the data. A larger network with a similar held-out error says that the extra capacity was not needed. Receptive field is the exception, since its length is a claim about the data: when a longer receptive field brings lower held-out error, older history is carrying information.

## How to Read a Pooled Output Compared with a Causal One

With **Same (acausal)** padding, the pooled output records the strongest response of each filter, wherever it occurred, so the network reacts to the presence of a shape and not its timing. With **Causal** padding and in **TCN**, the output depends on the final position, and recent shapes tend to count most. When the pooled form does better on the same task, the timing of the pattern may matter little. The opposite result suggests that recency matters.

## How Much to Trust a Forecast from a Convolutional Network

A point prediction from these tabs has no standard error. For a sense of uncertainty, use the spread of errors on held-out data, or retrain with different random initial weights and see how much the predictions move. Predictions for inputs unlike the training windows deserve the least trust, and nothing in the network flags them.

## See Also

- [Diagnostics](diagnostics.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
