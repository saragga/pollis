# Transfer Learning and Fine-Tuning: Decision Guide

Which tab of Transfer Learning and Fine-Tuning to use, by whether there are known sites and how close the region is to Enki's.

## Which tab of Transfer Learning and Fine-Tuning should I use?

| Situation | Tab | Why |
|---|---|---|
| No known sites in the region | **As Published** | Nothing can be trained or scored; Enki's shares are the only guide |
| Known sites, few settings to choose | **Frozen Features** | A random forest has no learning rate, epochs or batch to set |
| Known sites, Enki's head as the start | **Fine-Tuned Head** | The head starts from what Enki learnt and adapts it to the region |
| Sites on both sides of the area | **Three Models on Held-Out Ground** | Scores the three on the same sites before one is chosen |

The table is a guide, not a rule: the held-out scores of **Three Models on Held-Out Ground** decide for the region at hand.

## When does As Published suffice?

**As Published** suffices when the new region resembles the ground and the sites Enki was trained on: tells and mound-like features, on imagery like that of its training set. Its held-out AUC and its share of held-out sites in the top **Share of Cells** are then close to those of the tabs trained on the region, and training adds little.

**As Published** is also the only choice without known sites, and the reference against which training on known sites is judged. A tab that does not beat **As Published** on held-out ground has learnt the training side rather than the region.

## When should the network be trained on the known sites?

When the region differs from Enki's: other kinds of sites, other ground, other imagery. Training then teaches the new classifier which of the 1,280 channels of Enki's network mark a site in this region.

**Frozen Features** sets Enki's head aside and learns from the channels alone, without what Enki's head concluded from them. **Fine-Tuned Head** keeps the head and moves its weights, so that it starts from what Enki learnt. Which of the two carries better to new ground in a region is what **Three Models on Held-Out Ground** shows.

## Which settings of Fine-Tuned Head matter most?

| Setting | Higher | Lower |
|---|---|---|
| **Epochs** | More passes, more risk of fitting the training images | The head stays closer to Enki's |
| **Learning Rate** | Larger steps, faster and less stable | Smaller steps, the head moves less |
| **Batch** | Smoother steps, fewer of them | Noisier steps, more of them |
| **Dropout** | Fewer channels in each step, less fitting | More channels in each step |

The defaults are those of the first stage of Enki's own training. **Training Curves** shows whether the loss on the images kept out still falls at the last epoch, which calls for more epochs, or rises while the loss on the training images falls, which calls for fewer.

## What is not offered by Transfer Learning and Fine-Tuning?

Training layers of the network beneath the head, as the second stage of Enki's own training does, is not offered: it needs the network to be run backwards for every image, and many more labelled images than a region usually has. Training a network from the start on the known sites is not offered either: a few hundred images cannot fit the weights of a network of millions.

Other networks, trained on other tasks, can be adapted in the same way: frozen, as a source of features, or with their last layers trained again. Transfer Learning and Fine-Tuning shows the three steps with Enki, whose published weights Julia reads without Python.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Transfer Learning](transfer-learning.md) · [Enki](enki.md) · [Diagnostics](diagnostics.md)
