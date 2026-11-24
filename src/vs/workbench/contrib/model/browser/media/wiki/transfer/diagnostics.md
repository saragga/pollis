# Transfer Learning and Fine-Tuning: Diagnostics

How to read the scores of Transfer Learning and Fine-Tuning, and the checks of its Next Steps.

## Why score on held-out ground?

A model trained on known sites scores well on those sites whether or not it has learnt anything that carries to new ground. The images of the training sites are therefore no test of it. Transfer Learning and Fine-Tuning splits the area into two sides at the column of cells that halves the known sites, trains on one side and scores on the other, the **Held-Out Side**.

A split by side, rather than at random, keeps the training and the test sites apart on the ground. Neighbouring cells share soils, land use and imagery, and a site and its neighbours often look alike; a random split would put cells next to training sites into the test, and the scores would be too high. Changing the **Held-Out Side** from east to west repeats the test the other way, with the other side's sites.

## What does the AUC of Transfer Learning and Fine-Tuning measure?

The area under the ROC curve (AUC) printed by the Example Code is the probability that a held-out cell holding a known site ranks above a held-out cell holding none, ties counting one half. An AUC of 0.5 is a ranking no better than chance, and 1 a ranking that puts every site cell first.

The AUC uses only the order of the shares, so it compares tabs whose shares are on different scales: Enki's head, a head trained again and a random forest. It summarises the whole ranking, including its tail, while a survey visits only the top of it.

## What does the share of held-out sites in the top cells measure?

The share of held-out sites in the top **Share of Cells** asks what a survey of the highest-ranked cells would find: of the known sites on the held-out side, the share whose cell lies among the cells of highest share that make up the **Share of Cells** of that side. It is the recall at a fixed share of the area.

**Three Models on Held-Out Ground** gives it at 5, 10 and 20% of the cells, for the three tabs. A tab can have the higher AUC and find fewer sites in the top 5%, or the reverse; the share that matters is the share of the area a survey can cover.

## How do I read the Training Curves of Fine-Tuned Head?

**Training Curves** shows, after each epoch, the cross-entropy of the head on the images it is trained on and on the fifth of the images kept out. Both should fall at first. A loss on the images kept out that rises while the loss on the training images keeps falling marks fitting to the training images; the head of the epoch of lowest loss on the images kept out is the one kept.

The images kept out come from the training side, around the same sites, so they check the training, not the transfer: a low loss on them does not promise a high score on the **Held-Out Side**.

## What does Sites Missed show?

**Sites Missed** lists the held-out sites whose cell lies outside the top **Share of Cells**, with the cell's share and its rank among the held-out cells. A site of very low rank is one the model does not see at all; a site just below the cut-off would be found with a slightly larger share.

The positions are in the coordinates of the image, metres of the UTM zone, so each missed site can be looked at on the imagery: a site under buildings, under woodland or too small for a cell of 350 m is one no model of RGB imagery would find.

## What does What Was Retrained show?

**What Was Retrained** counts the weights of Enki's network beneath the head, frozen in every tab, and the weights of the head, two dense layers of 1,280 to 256 and of 256 to 2. For **Frozen Features** it gives the trees of the forest and their leaves; for **Fine-Tuned Head**, the share of the model's weights that training changed.

The counts show how small a part of the model the known sites of a region train. Whatever a tab learns from them, the features it learns from are those of Enki's network, trained on Enki's images; a region whose sites those features do not describe stays out of reach of all three tabs.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Transfer Learning](transfer-learning.md) · [Enki](enki.md) · [Decision Guide](decision-guide.md)
