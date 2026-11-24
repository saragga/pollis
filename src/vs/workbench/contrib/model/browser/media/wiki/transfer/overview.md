# Transfer Learning and Fine-Tuning: Overview

**Transfer Learning and Fine-Tuning** takes a network trained on one task and puts it to work on another, with the few labelled examples the new task has: unchanged, as a source of features for a new classifier, or with its last layers trained again.

## What does transfer learning do with a trained network?

A network trained on many images learns features in its layers that are useful beyond its own task. [Yosinski, Clune, Bengio and Lipson (2014)](#ref-YCBL2014a) found that the first layers of networks trained on natural images learn features that are general, applicable to many datasets and tasks, while the features of the last layers become specific to the original task.

Transfer learning keeps the general part of a trained network and adapts the rest to a new task. The new task then needs far fewer labelled examples than training a network from the start would, since most of the weights are taken as they are. How much of the network to adapt, and how, depends on how many examples the new task has and how far it lies from the original one.

## Which network does Transfer Learning and Fine-Tuning start from?

Transfer Learning and Fine-Tuning starts from Enki, a classifier of RGB images published by [Rosati (2025b)](#ref-Ros2025b) and trained on images of tells and mound-like features of the Ancient Near East from the dataset of [Rosati (2025a)](#ref-Ros2025a). Enki's network is EfficientNet-B0, by [Tan and Le (2019)](#ref-TL2019a), with a head of two dense layers on top.

The new task is the same kind of question on other ground: whether an image of 350 by 350 m holds a known archaeological site, in a region and on imagery Enki was not trained on. ArchaeologicalDetection.jl reads Enki's published Keras file in Julia and runs its network with NNlib.jl.

## What do the three tabs of Transfer Learning and Fine-Tuning train?

| Tab | Network beneath the head | Head | Trained on the known sites |
|---|---|---|---|
| **As Published** | Enki's, frozen | Enki's | Nothing |
| **Frozen Features** | Enki's, frozen | Replaced by a random forest | The forest |
| **Fine-Tuned Head** | Enki's, frozen | Enki's, trained again | The two dense layers |

**Frozen Features** feeds the 1,280 channels Enki's network gives each image to a random forest, after [Breiman (2001)](#ref-Bre2001a), from DecisionTree.jl. **Fine-Tuned Head** starts the two dense layers from Enki's weights and trains them on the known sites with `enki_finetune`.

## How are the tabs of Transfer Learning and Fine-Tuning scored?

The area is split in two at the column of cells of 350 m that halves the known sites. Every tab trains on the sites of one side and is scored on the other, the **Held-Out Side**, whose sites none of the tabs has seen. Two scores are printed for the held-out side: the area under the ROC curve (AUC), the probability that a cell holding a site ranks above a cell holding none, and the share of the held-out sites that lie in the top **Share of Cells** of highest share.

## How is Transfer Learning and Fine-Tuning organised?

| Group | Action | What it does |
|---|---|---|
| Visualise | **Probability Map** | The share for a site of every cell, with the known sites and the split |
| Visualise | **Training Curves** | The loss of the head after each epoch (Fine-Tuned Head) |
| Diagnose | **Sites Missed** | The held-out sites outside the top Share of Cells, with their share and rank |
| Predict | **Features Found** | The top Share of Cells joined into features, written to a GeoPackage |
| Predict | **Save the Tuned Model** | The trained head written with `enki_save` (Fine-Tuned Head) |
| Compare | **Three Models on Held-Out Ground** | The three tabs scored on the same held-out side |
| Interpret | **What Was Retrained** | The weights frozen against those each tab trains |

## References

<a id="ref-Bre2001a"></a>Breiman, L. (2001). Random Forests. *Machine Learning* 45(1), 5-32. [doi:10.1023/A:1010933404324](https://doi.org/10.1023/A:1010933404324)

<a id="ref-Ros2025a"></a>Rosati, P. (2025a). Enki: AI for Archaeology – Datasets for Automatic Site Recognition. Dataset, Zenodo. [doi:10.5281/zenodo.14950564](https://doi.org/10.5281/zenodo.14950564)

<a id="ref-Ros2025b"></a>Rosati, P. (2025b). Enki: AI-Assistant for Archaeological Discoveries. Software and trained model. [github.com/archeorosati/enki](https://github.com/archeorosati/enki)

<a id="ref-TL2019a"></a>Tan, M., & Le, Q. V. (2019). EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks. *Proceedings of the 36th International Conference on Machine Learning*, Proceedings of Machine Learning Research 97, 6105-6114. [proceedings.mlr.press/v97/tan19a.html](https://proceedings.mlr.press/v97/tan19a.html)

<a id="ref-YCBL2014a"></a>Yosinski, J., Clune, J., Bengio, Y., & Lipson, H. (2014). How Transferable Are Features in Deep Neural Networks? *Advances in Neural Information Processing Systems 27*, 3320-3328. [doi:10.48550/arXiv.1411.1792](https://doi.org/10.48550/arXiv.1411.1792)

## See Also

- [Factsheet](factsheet.md) · [Transfer Learning](transfer-learning.md) · [Enki](enki.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
- Convolutional Neural Networks: [Overview](../cnn/overview.md)
