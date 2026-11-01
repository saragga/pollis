# Graph Neural Networks — Interpretation

A graph network's weights have no direct meaning for any one node. Understanding comes from the embeddings it produces, the sensitivity of predictions to features and the comparison with simpler models.

## How to Read Node Embeddings

**Node Embeddings** projects each node's hidden representation onto its first two principal components, and colours it by the first target. A smooth change of colour across the plot says that the embedding has organised nodes by the target. Clusters may reflect communities in the graph, and whether they matter depends on whether they also line up with the target. Two components can hide structure, so a lack of pattern in this plot is not proof of a lack of signal.

## How to Read Feature Saliency

**Feature Saliency** averages the absolute gradient of predictions with respect to each input feature across nodes. A tall bar marks a feature to which predictions react strongly, and in a graph that reaction includes the effect through neighbouring nodes. Sensitivity is a property of the fitted model and depends on feature scale, so compare features only after scaling. Correlated features can share or swap their importance across training runs, so check that the ranking holds across a few seeds.

## What the Test Error Says About the Graph

The gap between test errors in **vs Graph-Free MLP** is the most direct measure of what the links contribute. A real improvement says that neighbours hold information about a node beyond its own features. This is a statement about prediction, and it does not establish that one node influences another: linked nodes may be alike because similar nodes form links, or because a shared factor moves them both.

## What Attention Weights Do and Do Not Show

In **GAT**, attention weights say how much each neighbour contributes in one layer and one head, and they are tempting to read as the importance of a relationship. They are only one component of the computation, since the message also depends on the features and on the later layers. The weights can vary across seeds even when predictions do not. Treat them as a hint worth checking, and compare them across runs before drawing a conclusion.

## How to Use a Model on a New Graph

**Predict on a New Graph** applies the fitted weights to a graph `g_new` with features `X_new`, which must have the same feature layout as the training data. All the tabs share weights across nodes, so the call runs on any graph. A good result still requires that the new graph resembles the old one in degree distribution and in what its links mean. Predictions on a graph of a quite different kind deserve no more trust than the resemblance allows.

## How to Read the Number of Layers

A preferred depth of two says that useful information sits within two hops, and only under this architecture and these features. When deeper models lose accuracy, this may be smoothing and not a lack of distant information, so it does not prove that distant nodes are irrelevant. Comparing depth together with **Over-Smoothing Check** helps to separate the two explanations.

## See Also

- [Diagnostics](diagnostics.md) · [Assumptions](assumptions.md) · [GNN Architectures in Finance](gnn-architectures-finance.md)
