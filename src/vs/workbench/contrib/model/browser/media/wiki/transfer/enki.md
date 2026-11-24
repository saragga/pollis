# Transfer Learning and Fine-Tuning: Enki

Enki, the network Transfer Learning and Fine-Tuning starts from: what it was trained on, its layers, how its head was trained, and how the panel saves a head trained again.

## What is Enki?

Enki is a classifier of RGB images for archaeological tells and mound-like features, published by Paolo Rosati with its training data, its scripts and its trained model ([Rosati (2025a)](#ref-Ros2025a); [Rosati (2025b)](#ref-Ros2025b)). It answers one question of an image of about 350 by 350 m: does it hold a tell or a mound-like feature, or not.

Its training set holds 21,654 images of 350 by 350 pixels, and its validation set 1,290, both released under the CC-BY-SA 4.0 licence ([Rosati (2025a)](#ref-Ros2025a)). The images come from satellite and aerial imagery of the Ancient Near East, centred on known tells or on other ground. Transfer Learning and Fine-Tuning reads `enki0_0.keras`, the trained model of Enki's repository, downloaded once to the **Folder**.

## Which layers make up Enki's network?

Enki's network is EfficientNet-B0 of Keras, a convolutional network that [Tan and Le (2019)](#ref-TL2019a) designed by searching for the best balance of depth, width and resolution, started from weights trained on ImageNet. A stem convolution and sixteen blocks of depthwise convolutions bring an image of 350 by 350 pixels to 11 by 11 positions of 1,280 channels, and each channel is averaged over the positions.

On these 1,280 channels sits Enki's head: a dense layer of 256 units with ReLU, and a dense layer of two classes whose softmax gives the share for a site. Enki drops 30% of the channels at random in training. In Transfer Learning and Fine-Tuning the network beneath the head holds 3,986,546 weights, with each batch normalisation folded into the convolution before it, and the head 328,450.

## How was Enki's head trained?

Enki's training script trains in two stages ([Rosati (2025b)](#ref-Ros2025b)). In the first, the network is frozen and only the head is trained, with Adam at a learning rate of 0.0001. In the second, the network is unfrozen beyond its first 75 layers and trained with the head at a learning rate of 0.00001.

**Fine-Tuned Head** repeats the first stage on the known sites of a new region: the head starts from Enki's weights, and is trained with Adam on the cross-entropy of the two classes, in batches of **Batch** images, with a **Dropout** on the channels. A fifth of the images is kept out, and the head of the epoch with the lowest loss on them is kept. The second stage is left out: it would train millions of weights on the images of a few hundred sites.

## Which images train Enki's head again?

`enki_examples` cuts the training images from the side of the area that is not held out. Each known site gives nine images of 350 m: one centred on it, and eight centred 50 m from it to the north, south, east, west and the four corners, so that the head also learns sites off the centre of a cell, as the cells of the grid hold them. The negatives are cells of the grid at least 700 m from every known site, five for each image of a site, drawn at random with the **Seed**.

The network reads each image of a site once; the channels of the negatives are those of their cells, already computed. **Frozen Features** trains its random forest on the same images.

## Enki's threshold of 99% and the shares of a model trained again

Enki's README keeps as candidates the cells whose share for a tell is 99% or more ([Rosati (2025b)](#ref-Ros2025b)). That threshold belongs to Enki's own head. A head trained again, or a random forest, gives shares on a scale of its own, to which the 99% does not apply.

Transfer Learning and Fine-Tuning therefore compares and maps the three tabs by rank, with the **Share of Cells**: the cells of highest share that make up that share of the area, whatever the share at which they begin. `enki_features` takes the same rule with its `share` keyword.

## How is a head trained again saved and read back?

**Save the Tuned Model** writes the head of **Fine-Tuned Head**, its two dense layers, to a JLD2 file of about 1.3 MB with `enki_save`. The network beneath the head is not written, since it is Enki's own and unchanged.

`enki_model(enki_weights(folder); head = path)` reads Enki's network from its Keras file again and puts the saved head on top of it, after checking that its layers have the sizes of Enki's. The model read back gives the same shares as the model saved, so a head trained on one region can be applied to imagery of the same region later, or shared without Enki's 52 MB.

## References

<a id="ref-Ros2025a"></a>Rosati, P. (2025a). Enki: AI for Archaeology – Datasets for Automatic Site Recognition. Dataset, Zenodo. [doi:10.5281/zenodo.14950564](https://doi.org/10.5281/zenodo.14950564)

<a id="ref-Ros2025b"></a>Rosati, P. (2025b). Enki: AI-Assistant for Archaeological Discoveries. Software and trained model. [github.com/archeorosati/enki](https://github.com/archeorosati/enki)

<a id="ref-TL2019a"></a>Tan, M., & Le, Q. V. (2019). EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks. *Proceedings of the 36th International Conference on Machine Learning*, Proceedings of Machine Learning Research 97, 6105-6114. [proceedings.mlr.press/v97/tan19a.html](https://proceedings.mlr.press/v97/tan19a.html)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Transfer Learning](transfer-learning.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
