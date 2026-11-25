# Transfer Learning and Fine-Tuning: Transfer Learning

How a trained network carries over to a new task: what transfers, the ways of adapting it, and what limits the transfer.

## What are a domain and a task in transfer learning?

[Pan and Yang (2010)](#ref-PY2010a) define transfer learning through two notions. A domain is a space of features with a probability distribution over it: the images a dataset holds and how often each kind occurs. A task is a set of labels with a function to learn from the features to the labels. Transfer learning uses what was learnt in a source domain and task to improve learning in a target domain and task, when the two differ.

In Transfer Learning and Fine-Tuning the source is ImageNet, natural photographs labelled with 1,000 classes of objects. The target task is new, the ten digits, and so is its domain: MNIST's grey handwritten digits. **On Another Dataset** then keeps the task and changes the domain, to SVHN's photographed house numbers.

## Which layers of a trained network transfer to a new task?

[Yosinski, Clune, Bengio and Lipson (2014)](#ref-YCBL2014a) measured, layer by layer, how general or specific the features of a deep convolutional network are. Networks trained on natural images learn, in their first layer, features similar to Gabor filters and colour blobs, which are not specific to one dataset or task. By the last layer the features have become specific to the original task.

The transition between the two decides what to keep. The early and middle layers of a network describe edges, textures and shapes that most image tasks share; the last layers combine them into the classes of the original task. A new task with its own classes therefore keeps most of the network and replaces or trains again what sits on top. **Accuracy by Cut Layer** shows the transition in ResNet-18 itself.

## How good are features taken from a trained network as they are?

[Sharif Razavian, Azizpour, Sullivan and Carlsson (2014)](#ref-SASC2014a) took the features of one layer of OverFeat, a network trained to classify ImageNet's objects, and trained only a linear support vector machine on them, for tasks increasingly far from the original: object and scene classification, fine-grained recognition, attribute detection and image retrieval. They report results better than those of the highly tuned methods of the time in all the visual classification tasks they tried.

[Kornblith, Shlens and Le (2019)](#ref-KSL2019a) compared 16 networks on 12 datasets. A network's accuracy on ImageNet was strongly correlated with its accuracy after transfer, whether it was used as a fixed extractor of features or fine-tuned. On two small fine-grained datasets, pretraining on ImageNet gave minimal benefits.

## Feature extraction or fine-tuning?

There are two common ways to adapt a trained network. In feature extraction the network is frozen and run once on every image; the output of one of its layers, here the 512 channels averaged over the image, becomes the input of a new classifier trained on the labelled examples of the new task. In fine-tuning, layers of the network keep their structure and start from their trained weights, and training continues on the new examples.

**Feature Extraction** of Transfer Learning and Fine-Tuning is feature extraction with a new last layer, a linear classifier, as the new classifier. **Last Block** fine-tunes the fourth stage of ResNet-18 with the new last layer, and **Fully Fine-Tuned** fine-tunes every layer. ResNet-18 trained from random weights, in **Three Tabs and From Scratch**, is the baseline all three must beat.

## How far can a network be transferred?

[Yosinski, Clune, Bengio and Lipson (2014)](#ref-YCBL2014a) report that the transferability of features decreases as the distance between the original task and the new one increases, but that features transferred even from distant tasks can be better than random features. They also found that a network initialised with transferred features generalises better, and that the gain lingers even after fine-tuning on the new dataset.

The distance has several parts: the content of the images, their colours and their way of being taken. Handwritten digits scanned in grey are far from ImageNet's photographs of objects. SVHN's digits are photographs in colour, as ImageNet's images are, and have the classes of MNIST.

## References

<a id="ref-KSL2019a"></a>Kornblith, S., Shlens, J. and Le, Q. V. (2019). Do better ImageNet models transfer better? *2019 IEEE/CVF Conference on Computer Vision and Pattern Recognition*, 2656–2666. [doi:10.1109/CVPR.2019.00277](https://doi.org/10.1109/CVPR.2019.00277)

<a id="ref-PY2010a"></a>Pan, S. J. and Yang, Q. (2010). A survey on transfer learning. *IEEE Transactions on Knowledge and Data Engineering* 22(10), 1345–1359. [doi:10.1109/TKDE.2009.191](https://doi.org/10.1109/TKDE.2009.191)

<a id="ref-SASC2014a"></a>Sharif Razavian, A., Azizpour, H., Sullivan, J. and Carlsson, S. (2014). CNN features off-the-shelf: an astounding baseline for recognition. *2014 IEEE Conference on Computer Vision and Pattern Recognition Workshops*, 512–519. [doi:10.1109/CVPRW.2014.131](https://doi.org/10.1109/CVPRW.2014.131)

<a id="ref-YCBL2014a"></a>Yosinski, J., Clune, J., Bengio, Y. and Lipson, H. (2014). How transferable are features in deep neural networks? *Advances in Neural Information Processing Systems 27*, 3320–3328. [doi:10.48550/arXiv.1411.1792](https://doi.org/10.48550/arXiv.1411.1792)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Fine-Tuning](fine-tuning.md) · [Another Dataset](another-dataset.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
