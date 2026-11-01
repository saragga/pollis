# Convolutional Neural Networks — Overview

A convolutional network slides short learned filters along a sequence and reuses the same weights at every position, an idea that became standard through the document recognition networks of [LeCun, Bottou, Bengio and Haffner (1998)](#ref-LBBH1998a). In one dimension the filters run along the time axis, so each one responds to a local shape wherever that shape occurs.

## What a One-Dimensional Convolution Computes

A filter of length **kernel_size** takes a weighted sum of neighbouring time steps across all input channels, and the result passes through a nonlinearity. **out_channels** filters run in parallel, producing that many feature maps. Stacking layers builds longer shapes out of shorter ones. Weight sharing keeps the parameter count independent of the length of the sequence, and the computation runs in parallel over time steps, unlike a recurrent network that must step through them in order.

## How Dilation Lengthens the View into the Past

A dilated filter skips steps: with dilation d it reads every d-th value, so a filter of the same size spans more of the sequence ([Yu and Koltun (2015)](#ref-YK2015a)). Doubling the dilation at each layer makes the receptive field grow exponentially with depth. The audio model of [van den Oord, Dieleman, Zen, Simonyan, Vinyals, Graves, Kalchbrenner, Senior and Kavukcuoglu (2016)](#ref-ODZSV...2016a) combined this schedule with causal filters, so that long audio contexts stayed affordable.

## What Makes a Temporal Convolutional Network

The TCN of [Bai, Kolter and Koltun (2018)](#ref-BKK2018a) joins three ingredients: causal padding, doubling dilations and residual connections ([He, Zhang, Ren and Sun (2016)](#ref-HZRS2016a)). Their comparison found these networks competitive with recurrent ones across a range of sequence tasks. The **TCN** tab builds residual blocks of two causal dilated convolutions with dropout, and adds a one-by-one convolution to match channels on the skip path when needed. The published block also has weight normalisation, which this tab leaves out.

## How the Three Tabs Turn a Sequence into a Prediction

With **Padding** set to **Same (acausal)**, **1D Conv** and **Dilated Conv** apply global max pooling over time, taking each filter's strongest response anywhere in the sequence. With **Causal** padding, and always in **TCN**, the network reads the features at the last time step, which have seen only the past. A dense layer then maps those features to **output_size** values. So the pooled form asks whether a shape occurred, and the causal form reads what the recent history implies.

## A Common Workflow for Convolutional Networks

1. Shape the data as T × in_channels × n, normally with scaled inputs.
2. Choose the tab whose receptive field covers the history that matters.
3. Train, and read **Training Curve** and **Held-Out Error**.
4. Compare with a simple model through **vs Linear Baseline**.
5. Use **Input Saliency** and **Learned Filters** to see what the network reads.

## References

<a id="ref-BKK2018a"></a>Bai, S., Kolter, J. Z. and Koltun, V. (2018). An empirical evaluation of generic convolutional and recurrent networks for sequence modeling. arXiv:1803.01271. [doi:10.48550/arXiv.1803.01271](https://doi.org/10.48550/arXiv.1803.01271)

<a id="ref-HZRS2016a"></a>He, K., Zhang, X., Ren, S. and Sun, J. (2016). Deep residual learning for image recognition. *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition*, 770–778. [doi:10.1109/CVPR.2016.90](https://doi.org/10.1109/CVPR.2016.90)

<a id="ref-LBBH1998a"></a>LeCun, Y., Bottou, L., Bengio, Y. and Haffner, P. (1998). Gradient-based learning applied to document recognition. *Proceedings of the IEEE* 86(11), 2278–2324. [doi:10.1109/5.726791](https://doi.org/10.1109/5.726791)

<a id="ref-ODZSV...2016a"></a>van den Oord, A., Dieleman, S., Zen, H., Simonyan, K., Vinyals, O., Graves, A., Kalchbrenner, N., Senior, A. and Kavukcuoglu, K. (2016). WaveNet: a generative model for raw audio. arXiv:1609.03499. [doi:10.48550/arXiv.1609.03499](https://doi.org/10.48550/arXiv.1609.03499)

<a id="ref-YK2015a"></a>Yu, F. and Koltun, V. (2015). Multi-scale context aggregation by dilated convolutions. arXiv:1511.07122. [doi:10.48550/arXiv.1511.07122](https://doi.org/10.48550/arXiv.1511.07122)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md) · [Causal & Multi-Channel Guide](causal-multichannel.md)
