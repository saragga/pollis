# Transfer Learning and Fine-Tuning: Factsheet

The panel's tabs, inputs, example data and sources at a glance.

## What does each tab of Transfer Learning and Fine-Tuning run?

| Tab | Functions | Trained | Output |
|---|---|---|---|
| **As Published** | `enki_model`, `enki_probability` | Nothing | Enki's share for a site of every cell of 350 m |
| **Frozen Features** | `enki_examples`, `build_forest`, `apply_forest_proba` | A random forest on 1,280 channels | The share of the forest's trees that vote for a site |
| **Fine-Tuned Head** | `enki_examples`, `enki_finetune`, `enki_probability` | The head: 328,450 weights | The share of the trained head |

All three read the channels of every cell once with `enki_pooled`, the longest step, kept in a file in the **Folder**. Enki's network beneath the head, 3,986,546 weights, is frozen in all three.

## What are the inputs of Transfer Learning and Fine-Tuning?

| Input | Default | Tabs |
|---|---|---|
| **Folder** | data/examples of the Pollis Workspace | all |
| **Area** | 6.42, 53.22, 6.64, 53.35 | all |
| **Imagery (WMS)** | PDOK's current aerial photographs | all |
| **Known Sites** | groningen-terps.gpkg | all |
| **Held-Out Side** | East | all |
| **Share of Cells** | 0.1 | all |
| **Seed** | 1 | all |
| **Trees** | 128 | Frozen Features |
| **Epochs** | 15 | Fine-Tuned Head |
| **Learning Rate** | 0.0001 | Fine-Tuned Head |
| **Batch** | 128 | Fine-Tuned Head |
| **Dropout** | 0.3 | Fine-Tuned Head |

## Which data does the example of Transfer Learning and Fine-Tuning use?

| Item | Value |
|---|---|
| Area | The terps (wierden) of northern Groningen, about 15 by 15 km |
| Imagery | Current aerial photographs of 25 cm from PDOK's Web Map Service, read at 1 m in UTM zone 32N |
| Known sites | The protected archaeological monuments of the Rijksdienst voor het Cultureel Erfgoed, from PDOK's OGC API |
| Cells | 350 by 350 m, as Enki's images |
| First run | About 0.4 GB of imagery and about 20 minutes, then read from the files |

Both services are open and need no key.

## Which results does Transfer Learning and Fine-Tuning build on?

| Result | Source |
|---|---|
| Features move from general to specific through a network's layers, and transferred features help even after fine-tuning | [Yosinski, Clune, Bengio and Lipson (2014)](#ref-YCBL2014a) |
| EfficientNet-B0, the network beneath Enki's head | [Tan and Le (2019)](#ref-TL2019a) |
| Enki, its head, its two stages of training and its threshold of 99% | [Rosati (2025b)](#ref-Ros2025b) |
| Enki's training images of tells and other ground | [Rosati (2025a)](#ref-Ros2025a) |
| Random forests, with a random choice of features at each split | [Breiman (2001)](#ref-Bre2001a) |

## References

<a id="ref-Bre2001a"></a>Breiman, L. (2001). Random Forests. *Machine Learning* 45(1), 5-32. [doi:10.1023/A:1010933404324](https://doi.org/10.1023/A:1010933404324)

<a id="ref-Ros2025a"></a>Rosati, P. (2025a). Enki: AI for Archaeology – Datasets for Automatic Site Recognition. Dataset, Zenodo. [doi:10.5281/zenodo.14950564](https://doi.org/10.5281/zenodo.14950564)

<a id="ref-Ros2025b"></a>Rosati, P. (2025b). Enki: AI-Assistant for Archaeological Discoveries. Software and trained model. [github.com/archeorosati/enki](https://github.com/archeorosati/enki)

<a id="ref-TL2019a"></a>Tan, M., & Le, Q. V. (2019). EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks. *Proceedings of the 36th International Conference on Machine Learning*, Proceedings of Machine Learning Research 97, 6105-6114. [proceedings.mlr.press/v97/tan19a.html](https://proceedings.mlr.press/v97/tan19a.html)

<a id="ref-YCBL2014a"></a>Yosinski, J., Clune, J., Bengio, Y., & Lipson, H. (2014). How Transferable Are Features in Deep Neural Networks? *Advances in Neural Information Processing Systems 27*, 3320-3328. [doi:10.48550/arXiv.1411.1792](https://doi.org/10.48550/arXiv.1411.1792)

## See Also

- [Overview](overview.md) · [Transfer Learning](transfer-learning.md) · [Enki](enki.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
