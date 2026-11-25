# Transfer Learning and Fine-Tuning: Another Dataset

Why a model is scored on a second dataset of the same classes, what the two datasets of Transfer Learning and Fine-Tuning are, and what theory says about the gap between them.

## What are MNIST and SVHN?

MNIST is a database of handwritten digits described by [LeCun, Bottou, Bengio and Haffner (1998)](#ref-LBBH1998a): 60,000 training images and 10,000 test images, each a digit from 0 to 9 written by hand, centred in a grey image of 28 by 28 pixels. SVHN, the Street View House Numbers, is a dataset of digits cropped from photographs of house numbers taken in Google Street View, introduced by [Netzer, Wang, Coates, Bissacco, Wu and Ng (2011)](#ref-NWCBW...2011a), with over 600,000 labelled digits. Its cropped digits are colour images of 32 by 32 pixels, centred on one digit with parts of its neighbours at the sides.

Both have the same ten classes. MLDatasets.jl reads both: `MNIST(:train)`, `MNIST(:test)` and `SVHN2(:test)`, whose labels give the digit 0 as 10.

## Why score a model on another dataset of the same digits?

Test images drawn from the same dataset as the training images share the way it was collected: the same writers or cameras, the same scanning, the same centring. A high accuracy on them shows that the model learnt that dataset, not that it learnt the digits wherever they appear. [Netzer, Wang, Coates, Bissacco, Wu and Ng (2011)](#ref-NWCBW...2011a) note that reading handwritten digits is virtually solved, while recognising characters in photographs is far more difficult.

**On Another Dataset** applies the model trained on MNIST to SVHN's test images, with no training on SVHN, and prints its accuracy on both. Chance is one in ten. The difference between the two accuracies is the cost of moving from MNIST's images to SVHN's for that model.

## What does theory say about the error on another domain?

[Ben-David, Blitzer, Crammer, Kulesza, Pereira and Vaughan (2010)](#ref-BBCKP...2010a) bound the error of a classifier on a target domain by its error on the source domain it was trained on, a measure of divergence between the two domains, and the error of the best single classifier for both. The divergence can be estimated from unlabelled samples of the two domains, and when some classifier performs well on both, it and the source error together characterise the target error.

In the terms of [Pan and Yang (2010)](#ref-PY2010a), MNIST and SVHN are two domains of the same task: the labels are the same ten digits, the images are drawn from different distributions. Learning a classifier for a target domain from a labelled source domain is what they call domain adaptation.

## Why can fine-tuning lower the accuracy on another dataset?

A tab trained on MNIST adapts its weights to whatever separates MNIST's digits, including what is particular to MNIST: grey strokes on a black background, centred and of similar thickness. The more of the network is trained on MNIST, the more of it can adapt to those particulars, and the further it moves from the weights learnt on ImageNet's photographs.

**Three Tabs and From Scratch** scores the three tabs and ResNet-18 trained from random weights on MNIST and on SVHN. A tab can gain on MNIST and lose on SVHN; which tab keeps most of its accuracy on SVHN is what the comparison shows for the inputs chosen.

## References

<a id="ref-BBCKP...2010a"></a>Ben-David, S., Blitzer, J., Crammer, K., Kulesza, A., Pereira, F. and Vaughan, J. W. (2010). A theory of learning from different domains. *Machine Learning* 79(1–2), 151–175. [doi:10.1007/s10994-009-5152-4](https://doi.org/10.1007/s10994-009-5152-4)

<a id="ref-LBBH1998a"></a>LeCun, Y., Bottou, L., Bengio, Y. and Haffner, P. (1998). Gradient-based learning applied to document recognition. *Proceedings of the IEEE* 86(11), 2278–2324. [doi:10.1109/5.726791](https://doi.org/10.1109/5.726791)

<a id="ref-NWCBW...2011a"></a>Netzer, Y., Wang, T., Coates, A., Bissacco, A., Wu, B. and Ng, A. Y. (2011). Reading digits in natural images with unsupervised feature learning. *NIPS Workshop on Deep Learning and Unsupervised Feature Learning 2011*. [ufldl.stanford.edu/housenumbers/nips2011_housenumbers.pdf](http://ufldl.stanford.edu/housenumbers/nips2011_housenumbers.pdf)

<a id="ref-PY2010a"></a>Pan, S. J. and Yang, Q. (2010). A survey on transfer learning. *IEEE Transactions on Knowledge and Data Engineering* 22(10), 1345–1359. [doi:10.1109/TKDE.2009.191](https://doi.org/10.1109/TKDE.2009.191)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Transfer Learning](transfer-learning.md) · [Fine-Tuning](fine-tuning.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
