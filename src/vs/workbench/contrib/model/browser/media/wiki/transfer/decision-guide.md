# Transfer Learning and Fine-Tuning: Decision Guide

Which tab of Transfer Learning and Fine-Tuning to use, by how many labelled images there are, how far the new images are from ImageNet's, and how much computing time there is.

## Which tab of Transfer Learning and Fine-Tuning should I use?

| Situation | Tab | Why |
|---|---|---|
| Few labelled images, or little computing time | **Feature Extraction** | Only the new last layer is trained, on channels computed once |
| Some thousands of images, close to ImageNet's | **Last Block** | The most specific stage adapts; the general stages beneath stay |
| Many images, far from ImageNet's | **Fully Fine-Tuned** | Every layer can adapt to the new images |
| Unsure which of the three | **Three Tabs and From Scratch** | Scores all three and a network from random weights on the same images |

The table is a guide, not a rule: which tab carries best to the new task depends on the images, and the scores of **Three Tabs and From Scratch** settle it for the images at hand.

## When does Feature Extraction suffice?

**Feature Extraction** suffices when the channels of ResNet-18's last stage, as trained on ImageNet, already separate the new classes: a linear classifier on them is then as good as training more of the network. [Sharif Razavian, Azizpour, Sullivan and Carlsson (2014)](#ref-SASC2014a) found such fixed features a strong baseline across many visual tasks.

**Feature Extraction** is also the choice with few labelled images. Its new last layer has 5,130 weights, few enough to train on a few hundred images without fitting them by heart, and the network beneath it cannot be overfitted since it is not trained. Each epoch runs only the last layer, so training takes seconds once the channels are computed.

## When should more of the network be trained again?

When the new images are far from ImageNet's, the features of the last stage are those least suited to them: [Yosinski, Clune, Bengio and Lipson (2014)](#ref-YCBL2014a) found the last layers the most specific to the original task. **Last Block** trains the fourth stage of ResNet-18 again, three quarters of its weights, and keeps the three stages beneath it. **Fully Fine-Tuned** trains every layer.

Training more of the network needs more labelled images and more time: every epoch runs the layers trained forwards and backwards over every image. [Kornblith, Shlens and Le (2019)](#ref-KSL2019a), comparing 16 networks on 12 datasets, conclude that the features learnt on ImageNet are less general than had been suggested, which is the case for training more of the network again.

## Which settings matter most?

| Setting | Higher | Lower |
|---|---|---|
| **Learning Rate** of **Last Block** and **Fully Fine-Tuned** | Larger steps, further from ImageNet's weights | The layers trained again stay closer to ImageNet's weights |
| **Epochs** | More passes over the training images, more risk of fitting them | Less training, faster |
| **Image Size** | More positions at each stage, slower | Fewer positions; below 64 pixels the last stage sees a single one |
| **Training Images** | More examples, slower | Fewer examples, closer to the case transfer learning is for |

The **Learning Rate** of **Feature Extraction** trains a layer that starts from random weights, and is set larger than that of the tabs that train layers of the network again.

## References

<a id="ref-KSL2019a"></a>Kornblith, S., Shlens, J. and Le, Q. V. (2019). Do better ImageNet models transfer better? *2019 IEEE/CVF Conference on Computer Vision and Pattern Recognition*, 2656–2666. [doi:10.1109/CVPR.2019.00277](https://doi.org/10.1109/CVPR.2019.00277)

<a id="ref-SASC2014a"></a>Sharif Razavian, A., Azizpour, H., Sullivan, J. and Carlsson, S. (2014). CNN features off-the-shelf: an astounding baseline for recognition. *2014 IEEE Conference on Computer Vision and Pattern Recognition Workshops*, 512–519. [doi:10.1109/CVPRW.2014.131](https://doi.org/10.1109/CVPRW.2014.131)

<a id="ref-YCBL2014a"></a>Yosinski, J., Clune, J., Bengio, Y. and Lipson, H. (2014). How transferable are features in deep neural networks? *Advances in Neural Information Processing Systems 27*, 3320–3328. [doi:10.48550/arXiv.1411.1792](https://doi.org/10.48550/arXiv.1411.1792)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Transfer Learning](transfer-learning.md) · [Fine-Tuning](fine-tuning.md) · [Another Dataset](another-dataset.md) · [Diagnostics](diagnostics.md)
