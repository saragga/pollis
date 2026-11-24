# Transfer Learning and Fine-Tuning: Transfer Learning

How a trained network carries over to a new task: which layers transfer, the ways of adapting them, and what limits the transfer.

## Which layers of a trained network transfer to a new task?

[Yosinski, Clune, Bengio and Lipson (2014)](#ref-YCBL2014a) measured, layer by layer, how general or specific the features of a deep convolutional network are. Networks trained on natural images learn, in their first layer, features similar to Gabor filters and colour blobs, which are not specific to one dataset or task. By the last layer the features have become specific to the original task.

The transition between the two is what decides what to keep. The early and middle layers of a network describe edges, textures and shapes that most image tasks share; the last layers combine them into the classes of the original task. A new task with its own classes therefore keeps most of the network and replaces or retrains what sits on top.

## Feature extraction or fine-tuning?

There are two common ways to adapt a trained network. In feature extraction the network is frozen and run once on every image; the output of one of its layers, here the 1,280 channels averaged over the image, becomes the input of a new classifier, trained on the labelled examples of the new task. In fine-tuning, layers of the network keep their structure and start from their trained weights, and training continues on the new examples.

**Frozen Features** of Transfer Learning and Fine-Tuning is feature extraction, with a random forest as the new classifier. **Fine-Tuned Head** is fine-tuning restricted to the head: the two dense layers on top of the frozen network, started from Enki's weights. **As Published** adapts nothing, and is the baseline both must beat.

## Why fine-tune only the last layers?

Fine-tuning deeper layers means running the network backwards for every image, for many images, and fitting millions of weights. With few labelled examples those weights can fit the examples rather than the task. [Yosinski, Clune, Bengio and Lipson (2014)](#ref-YCBL2014a) also found that splitting a network between layers whose neurons co-adapted during training raises difficulties of optimisation, separate from the specialisation of the higher layers.

Training only the head keeps the network beneath it as it was, so that its features, learnt on many images, are not changed by a few. The head of Enki holds 328,450 weights, about 8% of the model, and its training is cheap once the channels of each image have been computed: each epoch is a few matrix products on those channels.

## How far can a network be transferred?

[Yosinski, Clune, Bengio and Lipson (2014)](#ref-YCBL2014a) report that the transferability of features decreases as the distance between the original task and the new one increases, but that features transferred even from distant tasks can be better than random features. They also found that a network initialised with transferred features generalises better, and that the gain lingers even after fine-tuning on the new dataset.

For Enki, the distance has several parts: the ground, the kind of site, the season and the imagery. A network trained on tells in arid ground, on satellite imagery, meets other landscapes, other sites and other cameras in a new region. The held-out score of **As Published** measures how far Enki carries unchanged; the other two tabs measure what the known sites of the new region add.

## A random forest on frozen features

A random forest, introduced by [Breiman (2001)](#ref-Bre2001a), combines many classification trees, each grown on a random sample of the examples and choosing each split among a random selection of the features. [Breiman (2001)](#ref-Bre2001a) shows that the error of a forest depends on the strength of the individual trees and the correlation between them, and that the random selection of features at each split gives error rates that compare favourably with Adaboost while being more robust to noise.

On frozen features, a random forest needs no learning rate, no epochs and no scaling of its inputs, and its share of votes ranks the cells directly. It does not start from Enki's head, so it uses what Enki's network sees but not what Enki learnt to conclude from it.

## References

<a id="ref-Bre2001a"></a>Breiman, L. (2001). Random Forests. *Machine Learning* 45(1), 5-32. [doi:10.1023/A:1010933404324](https://doi.org/10.1023/A:1010933404324)

<a id="ref-YCBL2014a"></a>Yosinski, J., Clune, J., Bengio, Y., & Lipson, H. (2014). How Transferable Are Features in Deep Neural Networks? *Advances in Neural Information Processing Systems 27*, 3320-3328. [doi:10.48550/arXiv.1411.1792](https://doi.org/10.48550/arXiv.1411.1792)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Enki](enki.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
