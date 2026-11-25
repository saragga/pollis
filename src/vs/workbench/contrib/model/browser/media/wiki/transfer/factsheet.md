# Transfer Learning and Fine-Tuning: Factsheet

The panel's tabs, inputs, example data and sources at a glance.

## What does each tab of Transfer Learning and Fine-Tuning train?

| Tab | Part trained | Weights trained | Share of the model | Computed once, before training |
|---|---|---|---|---|
| **Feature Extraction** | `model.fc` | 5,130 | 0.05% | `forward_features`, `forward_head(...; pre_logits = true)` |
| **Last Block** | `model.layer4`, `model.fc` | 8,398,858 | 75.1% | `forward_intermediates(...; indices = [4])` |
| **Fully Fine-Tuned** | `model` | 11,181,642 | 100% | Nothing |

ResNet-18 with a new last layer of ten outputs has 11,181,642 weights: 2,782,784 in the first convolution and stages 1 to 3, 8,393,728 in stage 4, and 5,130 in the new last layer. All three tabs load it with `create_model("timm/resnet18.tv_in1k"; num_classes = 10)` of Metalhead.jl and train with Adam ([Kingma and Ba (2015)](#ref-KB2015a)) on the cross-entropy of Flux.jl.

## What are the inputs of Transfer Learning and Fine-Tuning?

| Input | Default | Tabs |
|---|---|---|
| **Training Images** | 2000 | all |
| **Test Images** | 1000 | all |
| **Image Size** | 64 | all |
| **Batch** | 64 | all |
| **Seed** | 1 | all |
| **Learning Rate** | 0.001 | Feature Extraction |
| **Epochs** | 10 | Feature Extraction |
| **Learning Rate** | 0.0001 | Last Block, Fully Fine-Tuned |
| **Epochs** | 3 | Last Block, Fully Fine-Tuned |
| **SVHN Images** | 1000 | all |

## Which data does the example of Transfer Learning and Fine-Tuning use?

| Item | Value |
|---|---|
| Network | ResNet-18 ([He, Zhang, Ren and Sun (2016)](#ref-HZRS2016a)) with torchvision's weights, trained on ImageNet ([Deng, Dong, Socher, Li, Li and Fei-Fei (2009)](#ref-DDSLL...2009a)), about 45 MB from Hugging Face |
| Training and test images | MNIST ([LeCun, Bottou, Bengio and Haffner (1998)](#ref-LBBH1998a)), 60,000 training and 10,000 test images of 28 by 28 pixels in grey, about 11 MB |
| Another dataset | SVHN's test split ([Netzer, Wang, Coates, Bissacco, Wu and Ng (2011)](#ref-NWCBW...2011a)), 26,032 images of 32 by 32 pixels in colour; MLDatasets.jl downloads SVHN's three splits, about 1.6 GB |
| Read with | `MNIST(:train)`, `MNIST(:test)` and `SVHN2(:test)` of MLDatasets.jl |

The three are downloaded the first time and kept on the computer. None needs a key.

## Which results does Transfer Learning and Fine-Tuning build on?

| Result | Source |
|---|---|
| Residual networks, ResNet-18 among them | [He, Zhang, Ren and Sun (2016)](#ref-HZRS2016a) |
| Features move from general to specific through a network's layers | [Yosinski, Clune, Bengio and Lipson (2014)](#ref-YCBL2014a) |
| Fixed features of a network trained on ImageNet as a baseline for other tasks | [Sharif Razavian, Azizpour, Sullivan and Carlsson (2014)](#ref-SASC2014a) |
| Networks better on ImageNet transfer better | [Kornblith, Shlens and Le (2019)](#ref-KSL2019a) |
| Domain, task and the kinds of transfer learning | [Pan and Yang (2010)](#ref-PY2010a) |
| A bound on the error in a target domain | [Ben-David, Blitzer, Crammer, Kulesza, Pereira and Vaughan (2010)](#ref-BBCKP...2010a) |
| Batch normalisation | [Ioffe and Szegedy (2015)](#ref-IS2015a) |

## References

<a id="ref-BBCKP...2010a"></a>Ben-David, S., Blitzer, J., Crammer, K., Kulesza, A., Pereira, F. and Vaughan, J. W. (2010). A theory of learning from different domains. *Machine Learning* 79(1–2), 151–175. [doi:10.1007/s10994-009-5152-4](https://doi.org/10.1007/s10994-009-5152-4)

<a id="ref-DDSLL...2009a"></a>Deng, J., Dong, W., Socher, R., Li, L.-J., Li, K. and Fei-Fei, L. (2009). ImageNet: a large-scale hierarchical image database. *2009 IEEE Conference on Computer Vision and Pattern Recognition*, 248–255. [doi:10.1109/CVPR.2009.5206848](https://doi.org/10.1109/CVPR.2009.5206848)

<a id="ref-HZRS2016a"></a>He, K., Zhang, X., Ren, S. and Sun, J. (2016). Deep residual learning for image recognition. *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition*, 770–778. [doi:10.1109/CVPR.2016.90](https://doi.org/10.1109/CVPR.2016.90)

<a id="ref-IS2015a"></a>Ioffe, S. and Szegedy, C. (2015). Batch normalization: accelerating deep network training by reducing internal covariate shift. arXiv:1502.03167. [doi:10.48550/arXiv.1502.03167](https://doi.org/10.48550/arXiv.1502.03167)

<a id="ref-KB2015a"></a>Kingma, D. P. and Ba, J. L. (2015). Adam: A Method for Stochastic Optimization. *International Conference on Learning Representations*. [doi:10.48550/arXiv.1412.6980](https://doi.org/10.48550/arXiv.1412.6980)

<a id="ref-KSL2019a"></a>Kornblith, S., Shlens, J. and Le, Q. V. (2019). Do better ImageNet models transfer better? *2019 IEEE/CVF Conference on Computer Vision and Pattern Recognition*, 2656–2666. [doi:10.1109/CVPR.2019.00277](https://doi.org/10.1109/CVPR.2019.00277)

<a id="ref-LBBH1998a"></a>LeCun, Y., Bottou, L., Bengio, Y. and Haffner, P. (1998). Gradient-based learning applied to document recognition. *Proceedings of the IEEE* 86(11), 2278–2324. [doi:10.1109/5.726791](https://doi.org/10.1109/5.726791)

<a id="ref-NWCBW...2011a"></a>Netzer, Y., Wang, T., Coates, A., Bissacco, A., Wu, B. and Ng, A. Y. (2011). Reading digits in natural images with unsupervised feature learning. *NIPS Workshop on Deep Learning and Unsupervised Feature Learning 2011*. [ufldl.stanford.edu/housenumbers/nips2011_housenumbers.pdf](http://ufldl.stanford.edu/housenumbers/nips2011_housenumbers.pdf)

<a id="ref-PY2010a"></a>Pan, S. J. and Yang, Q. (2010). A survey on transfer learning. *IEEE Transactions on Knowledge and Data Engineering* 22(10), 1345–1359. [doi:10.1109/TKDE.2009.191](https://doi.org/10.1109/TKDE.2009.191)

<a id="ref-SASC2014a"></a>Sharif Razavian, A., Azizpour, H., Sullivan, J. and Carlsson, S. (2014). CNN features off-the-shelf: an astounding baseline for recognition. *2014 IEEE Conference on Computer Vision and Pattern Recognition Workshops*, 512–519. [doi:10.1109/CVPRW.2014.131](https://doi.org/10.1109/CVPRW.2014.131)

<a id="ref-YCBL2014a"></a>Yosinski, J., Clune, J., Bengio, Y. and Lipson, H. (2014). How transferable are features in deep neural networks? *Advances in Neural Information Processing Systems 27*, 3320–3328. [doi:10.48550/arXiv.1411.1792](https://doi.org/10.48550/arXiv.1411.1792)

## See Also

- [Overview](overview.md) · [Transfer Learning](transfer-learning.md) · [Fine-Tuning](fine-tuning.md) · [Another Dataset](another-dataset.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
