# Transfer Learning and Fine-Tuning: Overview

**Transfer Learning and Fine-Tuning** takes ResNet-18, a convolutional network trained on ImageNet, to a new task with few labelled images, MNIST's handwritten digits, and then asks how far the result carries to another dataset of the same digits, SVHN's photographed house numbers.

## What does transfer learning do with a trained network?

A network trained on many images learns features in its layers that are useful beyond its own task. [Yosinski, Clune, Bengio and Lipson (2014)](#ref-YCBL2014a) found that the first layers of networks trained on natural images learn features that are general, applicable to many datasets and tasks, while the features of the last layers become specific to the original task.

Transfer learning keeps the general part of a trained network and adapts the rest to a new task. [Pan and Yang (2010)](#ref-PY2010a) describe it as using the knowledge gained in a source domain and task to learn a target task, when the target has too few labelled examples to learn from alone. The new task then needs far fewer labelled examples than training a network from the start would.

## Which network does Transfer Learning and Fine-Tuning start from?

Transfer Learning and Fine-Tuning starts from ResNet-18 of [He, Zhang, Ren and Sun (2016)](#ref-HZRS2016a), with the weights torchvision trained on the 1.28 million training images of ImageNet's 1,000 classes ([Deng, Dong, Socher, Li, Li and Fei-Fei (2009)](#ref-DDSLL...2009a)). Metalhead.jl loads the network and its weights in Flux.jl ([Innes (2018)](#ref-Inn2018a)), with a new last layer of ten outputs, one for each digit.

ResNet-18 has a first convolution and four stages of residual blocks. Each stage halves the width and height of its input and doubles its channels, from 64 to 512. The 512 channels of the last stage are averaged over the image and passed to the last layer.

## What do the three tabs of Transfer Learning and Fine-Tuning train?

| Tab | Stages 1 to 3 | Stage 4 | New last layer |
|---|---|---|---|
| **Feature Extraction** | Kept | Kept | Trained |
| **Last Block** | Kept | Trained | Trained |
| **Fully Fine-Tuned** | Trained | Trained | Trained |

All three train on the same sample of MNIST's training images, with Adam ([Kingma and Ba (2015)](#ref-KB2015a)), and are scored on a sample of MNIST's test images, which no tab trains on. The layers kept as they are run once over every image, before training, so that each epoch runs only the layers trained.

## Why does Transfer Learning and Fine-Tuning use a second dataset?

A model can score well on test images drawn the same way as its training images and fail on images collected in another way. MNIST's digits were written by hand on forms and scanned in grey ([LeCun, Bottou, Bengio and Haffner (1998)](#ref-LBBH1998a)); SVHN's were cropped from photographs of house numbers in Google Street View, in colour, with neighbouring digits, shadows and blur ([Netzer, Wang, Coates, Bissacco, Wu and Ng (2011)](#ref-NWCBW...2011a)).

**On Another Dataset** applies the model trained on MNIST to SVHN's test images, which it has never seen, beside its accuracy on MNIST. The gap between the two accuracies is what the shift from one dataset to the other costs the model.

## How is Transfer Learning and Fine-Tuning organised?

| Group | Action | What it does |
|---|---|---|
| Visualise | **Training Curves** | The loss and the test accuracy after each epoch |
| Visualise | **Misclassified Digits** | MNIST's test images the model gets wrong |
| Diagnose | **Confusion Matrix** | Each true digit against the digit given |
| Predict | **On Another Dataset** | The model applied to SVHN, beside its accuracy on MNIST |
| Compare | **Three Tabs and From Scratch** | The three tabs and ResNet-18 trained from random weights, on MNIST and SVHN |
| Interpret | **What Was Retrained** | The weights kept against those trained |
| Interpret | **Accuracy by Cut Layer** | A new last layer on each stage of the network as trained on ImageNet |

## References

<a id="ref-DDSLL...2009a"></a>Deng, J., Dong, W., Socher, R., Li, L.-J., Li, K. and Fei-Fei, L. (2009). ImageNet: a large-scale hierarchical image database. *2009 IEEE Conference on Computer Vision and Pattern Recognition*, 248–255. [doi:10.1109/CVPR.2009.5206848](https://doi.org/10.1109/CVPR.2009.5206848)

<a id="ref-HZRS2016a"></a>He, K., Zhang, X., Ren, S. and Sun, J. (2016). Deep residual learning for image recognition. *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition*, 770–778. [doi:10.1109/CVPR.2016.90](https://doi.org/10.1109/CVPR.2016.90)

<a id="ref-Inn2018a"></a>Innes, M. (2018). Flux: Elegant Machine Learning with Julia. *Journal of Open Source Software* 3(25), 602. [doi:10.21105/joss.00602](https://doi.org/10.21105/joss.00602)

<a id="ref-KB2015a"></a>Kingma, D. P. and Ba, J. L. (2015). Adam: A Method for Stochastic Optimization. *International Conference on Learning Representations*. [doi:10.48550/arXiv.1412.6980](https://doi.org/10.48550/arXiv.1412.6980)

<a id="ref-LBBH1998a"></a>LeCun, Y., Bottou, L., Bengio, Y. and Haffner, P. (1998). Gradient-based learning applied to document recognition. *Proceedings of the IEEE* 86(11), 2278–2324. [doi:10.1109/5.726791](https://doi.org/10.1109/5.726791)

<a id="ref-NWCBW...2011a"></a>Netzer, Y., Wang, T., Coates, A., Bissacco, A., Wu, B. and Ng, A. Y. (2011). Reading digits in natural images with unsupervised feature learning. *NIPS Workshop on Deep Learning and Unsupervised Feature Learning 2011*. [ufldl.stanford.edu/housenumbers/nips2011_housenumbers.pdf](http://ufldl.stanford.edu/housenumbers/nips2011_housenumbers.pdf)

<a id="ref-PY2010a"></a>Pan, S. J. and Yang, Q. (2010). A survey on transfer learning. *IEEE Transactions on Knowledge and Data Engineering* 22(10), 1345–1359. [doi:10.1109/TKDE.2009.191](https://doi.org/10.1109/TKDE.2009.191)

<a id="ref-YCBL2014a"></a>Yosinski, J., Clune, J., Bengio, Y. and Lipson, H. (2014). How transferable are features in deep neural networks? *Advances in Neural Information Processing Systems 27*, 3320–3328. [doi:10.48550/arXiv.1411.1792](https://doi.org/10.48550/arXiv.1411.1792)

## See Also

- [Factsheet](factsheet.md) · [Transfer Learning](transfer-learning.md) · [Fine-Tuning](fine-tuning.md) · [Another Dataset](another-dataset.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
- Convolutional Neural Networks: [Overview](../cnn/overview.md)
