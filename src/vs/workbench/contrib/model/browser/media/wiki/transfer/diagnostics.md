# Transfer Learning and Fine-Tuning: Diagnostics

How to read the scores of Transfer Learning and Fine-Tuning and the checks of its Next Steps.

## What does the accuracy of Transfer Learning and Fine-Tuning measure?

The accuracy printed after each epoch is the share of MNIST's test images, a sample of the **Test Images**, whose digit the model gives right: the digit of highest score among the ten outputs of the new last layer. Chance is one in ten. No tab trains on the test images, so the accuracy measures how the model does on handwritten digits it has not seen.

The test images are drawn from the same dataset as the training images. Their accuracy therefore says how well the model learnt MNIST, not how it does on digits collected in another way; that is what **On Another Dataset** measures.

## How do I read the Training Curves of Transfer Learning and Fine-Tuning?

**Training Curves** shows, after each epoch, the cross-entropy of the model on the training images, averaged over the batches of the epoch, and its accuracy on MNIST's test images. The cross-entropy should fall; the accuracy should rise and then level off.

An accuracy that falls while the cross-entropy keeps falling marks fitting to the training images. An accuracy that stays flat from the first epoch shows that more epochs add nothing. A cross-entropy that rises or jumps from one epoch to the next marks a **Learning Rate** too large for the layers trained. The training cross-entropy of **Last Block** and **Fully Fine-Tuned** is computed with batch normalisation in training mode, by each batch, and the test accuracy in test mode, so the two are not on the same footing.

## What do the Confusion Matrix and Misclassified Digits show?

**Confusion Matrix** counts, for each true digit of MNIST's test images, how often the model gives each digit, and prints the share right for each true digit. The counts off the diagonal show which digits the model takes for which, a 4 given as 9 or a 7 given as 1.

**Misclassified Digits** draws up to 16 of the test images the model gets wrong, at MNIST's own 28 pixels, each with the digit given and the true one. Some are digits a person would also misread; others are clear digits the model has not learnt.

## How do I read the accuracy on another dataset?

**On Another Dataset** prints the accuracy of the model on MNIST's test images beside its accuracy on a sample of SVHN's test images, the **SVHN Images**, and the share right for each digit of SVHN. The model never trains on SVHN.

The difference between the two accuracies measures how much of what the model learnt is particular to MNIST. **Three Tabs and From Scratch** prints the same two accuracies for the three tabs and for ResNet-18 trained from random weights, so the difference can be compared across them. When the digits of a dataset are not equally frequent, the share right for each digit is a better guide than the overall accuracy, which weighs the frequent digits most.

## How do I read Reading the Comparison?

**Reading the Comparison** reads the accuracies printed by **Three Tabs and From Scratch**, which must be run first. For each model it gives the drop from MNIST to SVHN, and how many standard errors its accuracy on SVHN lies above chance, one in ten; for each tab, its gain over ResNet-18 trained from random weights, on MNIST and on SVHN.

An accuracy measured on a sample of test images varies with the sample. **Reading the Comparison** therefore lists the pairs of models whose accuracies on one dataset are closer than two standard errors of their difference: the sample cannot tell those two apart. The standard errors cover the sampling of the test images only. Each model is trained once, and training again with another **Seed** changes its first weights and the order of its batches, which moves its accuracies as well.

## What do What Was Retrained and Accuracy by Cut Layer show?

**What Was Retrained** counts the weights of ResNet-18 by stage, and the weights the tab trains: the new last layer for **Feature Extraction**, the fourth stage and the new last layer for **Last Block**, every weight for **Fully Fine-Tuned**. The fourth stage holds three quarters of the network's weights.

**Accuracy by Cut Layer** averages the output of each of the four stages of ResNet-18, as trained on ImageNet, over the image, trains a new last layer on each, and scores it on MNIST and SVHN. A stage whose layer scores well holds features that separate the digits as they are; a stage whose score falls from MNIST to SVHN holds features particular to one of the two.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Transfer Learning](transfer-learning.md) · [Fine-Tuning](fine-tuning.md) · [Another Dataset](another-dataset.md) · [Decision Guide](decision-guide.md)
