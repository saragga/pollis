# Transfer Learning and Fine-Tuning: Fine-Tuning

How Transfer Learning and Fine-Tuning freezes and trains the layers of ResNet-18: the new last layer, the stages kept, the learning rate and batch normalisation.

## How is the last layer of ResNet-18 replaced?

ResNet-18 as trained on ImageNet ends in a dense layer of 512 inputs and 1,000 outputs, one for each of ImageNet's classes. A new task has its own classes, so that layer is replaced. `create_model("timm/resnet18.tv_in1k"; num_classes = 10)` of Metalhead.jl loads the network with ImageNet's weights and a new dense layer of 512 inputs and 10 outputs, its weights drawn at random. The layer is the field `fc` of the model.

The new layer gives one score for each digit, and `Flux.logitcrossentropy` compares the scores, through a softmax, with the true digit. All three tabs of Transfer Learning and Fine-Tuning train the new last layer; they differ in what they train beneath it.

## How does Transfer Learning and Fine-Tuning keep layers as they are?

A layer is kept as it is by leaving it out of what the optimiser updates: `Flux.setup(Adam(rate), part)` sets up Adam ([Kingma and Ba (2015)](#ref-KB2015a)) for `part` only, and only the gradient of `part` is taken. **Feature Extraction** trains `model.fc`; **Last Block** trains `Chain(model.layer4, model.global_pool, model.fc)`; **Fully Fine-Tuned** trains the whole model.

The layers kept give the same output for an image at every epoch, so Transfer Learning and Fine-Tuning computes it once, before training. **Feature Extraction** computes the 512 averaged channels of every image with `forward_features` and `forward_head(...; pre_logits = true)`; **Last Block** computes the output of the third stage with `forward_intermediates`. Each epoch then runs only the layers trained, forwards and backwards.

## Why is the learning rate smaller for the layers fine-tuned?

The layers fine-tuned start from weights that already describe images well. A large step of the optimiser can move them far from those weights in the first batches, before the new last layer, which starts from random weights, gives useful gradients. A small learning rate keeps the layers close to their trained weights, so that the new images adjust them rather than replace them.

Transfer Learning and Fine-Tuning therefore has two learning rates: the **Learning Rate** of **Feature Extraction**, for a new last layer trained alone, and a smaller one for **Last Block** and **Fully Fine-Tuned**, which train layers of the network as well. [Yosinski, Clune, Bengio and Lipson (2014)](#ref-YCBL2014a) found that a network initialised with transferred features and fine-tuned generalises better than one trained from random weights.

## What happens to batch normalisation when a network is fine-tuned?

Each convolution of ResNet-18 is followed by a batch normalisation ([Ioffe and Szegedy (2015)](#ref-IS2015a)), which, in training, normalises each channel by the mean and variance of the batch and keeps running averages of them; outside training it uses the running averages. In ResNet-18 as trained on ImageNet, those averages are ImageNet's.

`Flux.trainmode!(part)` sets the batch normalisations of the layers trained to normalise by each batch and to update their averages, which move from ImageNet's towards those of the new images. The layers kept stay in test mode, with ImageNet's averages, since their output is computed once. After each epoch, `Flux.testmode!` sets the whole model back to the running averages for scoring.

## Why are the images enlarged and normalised?

ResNet-18 halves the width and height of an image five times, in its first convolution, its pooling and three of its four stages. An image of 28 pixels, MNIST's size, would be reduced to a single position at the last stage. Transfer Learning and Fine-Tuning enlarges each image to the **Image Size** with `Flux.upsample_bilinear`.

The weights of ResNet-18 were trained on images in red, green and blue, each channel normalised by ImageNet's mean and standard deviation. A grey image of MNIST is repeated in the three channels, and every image is normalised by the same means, 0.485, 0.456 and 0.406, and standard deviations, 0.229, 0.224 and 0.225, as Metalhead.jl's processor for these weights does.

## References

<a id="ref-IS2015a"></a>Ioffe, S. and Szegedy, C. (2015). Batch normalization: accelerating deep network training by reducing internal covariate shift. arXiv:1502.03167. [doi:10.48550/arXiv.1502.03167](https://doi.org/10.48550/arXiv.1502.03167)

<a id="ref-KB2015a"></a>Kingma, D. P. and Ba, J. L. (2015). Adam: A Method for Stochastic Optimization. *International Conference on Learning Representations*. [doi:10.48550/arXiv.1412.6980](https://doi.org/10.48550/arXiv.1412.6980)

<a id="ref-YCBL2014a"></a>Yosinski, J., Clune, J., Bengio, Y. and Lipson, H. (2014). How transferable are features in deep neural networks? *Advances in Neural Information Processing Systems 27*, 3320–3328. [doi:10.48550/arXiv.1411.1792](https://doi.org/10.48550/arXiv.1411.1792)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Transfer Learning](transfer-learning.md) · [Another Dataset](another-dataset.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
