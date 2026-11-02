# Feedforward Neural Networks — Overview

A feedforward network passes each input through a stack of learned transformations, and information moves in one direction only. The three tabs of the panel use one shared hidden block for three different jobs.

## Where Feedforward Neural Networks Come From

[Rumelhart, Hinton and Williams (1986)](#ref-RHW1986a) showed that back-propagating errors lets hidden units learn useful internal representations. [Hornik, Stinchcombe and White (1989)](#ref-HSW1989a) then showed that one hidden layer with a squashing activation can approximate any Borel measurable function to any accuracy, given enough units. That theorem does not say how many units are needed, or that training will find those weights. It also does not promise good behaviour on new data. Modern practice stacks several narrower layers and trains them with minibatch gradient methods, which is what every tab of the panel does.

## How the MLP Tab Maps Inputs to a Target

**MLP** builds **num_layers** hidden blocks of width **hidden_size**, each a `Dense` layer with the chosen **activation** followed by `Dropout`. With **Output head** set to **Standard**, a linear `Dense` layer of size **output_size** follows, and training minimises mean squared error. A network trained this way estimates the conditional mean of the target. Each input vector is handled on its own, so the order of samples carries no meaning. A time series must first be turned into windows or lagged features. With **Output head** set to **MDN**, the output is a mixture distribution in place of a single number.

## How the Autoencoder Tab Learns a Code

**Autoencoder** joins an encoder, which compresses **input_size** features to **latent_dim** numbers, to a decoder, which rebuilds the features from that code. Training needs no target, as the input serves as its own. [Baldi and Hornik (1989)](#ref-BH1989a) analysed the linear case, where the optimum projects onto the leading principal components. [Hinton and Salakhutdinov (2006)](#ref-HS2006a) showed that deep nonlinear codes can improve on PCA, using layer-by-layer pretraining. The panel does no pretraining, and trains the whole network from random weights.

## How the VAE Tab Turns a Code into a Distribution

**VAE** follows [Kingma and Welling (2013)](#ref-KW2013a) and [Rezende, Mohamed and Wierstra (2014)](#ref-RMW2014a). The encoder returns a mean and a log-variance for each latent coordinate, and each pass draws the code as the mean plus scaled Gaussian noise. That reparameterisation lets gradients pass through the draw. A KL term pulls the codes towards a standard normal prior, so that drawing from the prior and decoding gives new samples. The method belongs to the wider family of variational inference reviewed by [Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a).

## What the Optional Blocks of a Feedforward Network Add

Four options change the hidden block or the output of the network.

| Option | What the code does | Source |
|---|---|---|
| **dropout** | Zeroes hidden units at random while the network is in training mode | [Hinton, Srivastava, Krizhevsky, Sutskever and Salakhutdinov (2012)](#ref-HSKSS2012a) |
| **Residual connections** | Adds each block's input to its output, except in the first block of a stack | [He, Zhang, Ren and Sun (2016)](#ref-HZRS2016a) |
| **Batch normalisation** | Normalises the input of each hidden block by batch statistics | [Ioffe and Szegedy (2015)](#ref-IS2015a) |
| **MDN** | Replaces the **MLP** output with mixture weights, means and standard deviations | [Bishop (1994)](#ref-Bis1994a) |

## A Common Workflow in the Feedforward Neural Networks Panel

Scale the features first, because the panel does not. Choose a tab, generate the code and run it, which trains on every sample. **Training Loss Curve** then shows whether the loss has settled, and **Train vs Validation Loss** retrains on 80% of the samples to measure generalisation. **Classical Baseline** gives the error of least squares or PCA, which is the figure the network has to beat. **Per-Sample Error** finds badly fitted samples, and **Learned Representation** and **Input Sensitivity** help to read the fitted network. **Predict New Data** applies it to `X_new`. Note that **Train vs Validation Loss** replaces `model` with the network trained on 80%, so later steps use that network.

## References

<a id="ref-BH1989a"></a>Baldi, P. and Hornik, K. (1989). Neural networks and principal component analysis: learning from examples without local minima. *Neural Networks* 2(1), 53–58. [doi:10.1016/0893-6080(89)90014-2](https://doi.org/10.1016/0893-6080(89)90014-2)

<a id="ref-Bis1994a"></a>Bishop, C. M. (1994). Mixture density networks.

<a id="ref-BKM2017a"></a>Blei, D. M., Kucukelbir, A. and McAuliffe, J. D. (2017). Variational inference: a review for statisticians. *Journal of the American Statistical Association* 112(518), 859–877. [doi:10.1080/01621459.2017.1285773](https://doi.org/10.1080/01621459.2017.1285773)

<a id="ref-HZRS2016a"></a>He, K., Zhang, X., Ren, S. and Sun, J. (2016). Deep residual learning for image recognition. *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition*, 770–778. [doi:10.1109/CVPR.2016.90](https://doi.org/10.1109/CVPR.2016.90)

<a id="ref-HS2006a"></a>Hinton, G. E. and Salakhutdinov, R. R. (2006). Reducing the dimensionality of data with neural networks. *Science* 313(5786), 504–507. [doi:10.1126/science.1127647](https://doi.org/10.1126/science.1127647)

<a id="ref-HSKSS2012a"></a>Hinton, G. E., Srivastava, N., Krizhevsky, A., Sutskever, I. and Salakhutdinov, R. R. (2012). Improving neural networks by preventing co-adaptation of feature detectors. arXiv:1207.0580. [doi:10.48550/arXiv.1207.0580](https://doi.org/10.48550/arXiv.1207.0580)

<a id="ref-HSW1989a"></a>Hornik, K., Stinchcombe, M. and White, H. (1989). Multilayer feedforward networks are universal approximators. *Neural Networks* 2(5), 359–366. [doi:10.1016/0893-6080(89)90020-8](https://doi.org/10.1016/0893-6080(89)90020-8)

<a id="ref-IS2015a"></a>Ioffe, S. and Szegedy, C. (2015). Batch normalization: accelerating deep network training by reducing internal covariate shift. arXiv:1502.03167. [doi:10.48550/arXiv.1502.03167](https://doi.org/10.48550/arXiv.1502.03167)

<a id="ref-KW2013a"></a>Kingma, D. P. and Welling, M. (2013). Auto-encoding variational Bayes. arXiv:1312.6114. [doi:10.48550/arXiv.1312.6114](https://doi.org/10.48550/arXiv.1312.6114)

<a id="ref-RMW2014a"></a>Rezende, D. J., Mohamed, S. and Wierstra, D. (2014). Stochastic backpropagation and approximate inference in deep generative models. arXiv:1401.4082. [doi:10.48550/arXiv.1401.4082](https://doi.org/10.48550/arXiv.1401.4082)

<a id="ref-RHW1986a"></a>Rumelhart, D. E., Hinton, G. E. and Williams, R. J. (1986). Learning representations by back-propagating errors. *Nature* 323(6088), 533–536. [doi:10.1038/323533a0](https://doi.org/10.1038/323533a0)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
