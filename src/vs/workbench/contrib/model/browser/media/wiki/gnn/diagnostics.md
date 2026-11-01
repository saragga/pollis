# Graph Neural Networks — Diagnostics

A single graph gives one split of dependent nodes, so a small difference in error can be chance. These checks ask whether the network has learned, whether it generalises to held-out nodes, and whether the graph adds anything.

## How to Read the Training Curve of a Graph Network

**Training Curve** trains a copy of the model for 200 epochs on the full graph, and plots the error on training nodes and on validation nodes. The selected model is left as it was. A validation curve that turns upward while training error keeps falling marks overfitting, and the epoch of lowest validation error is the one to keep. Two curves that both stay high point to too little capacity, weak features, or targets that the graph does not explain.

## How to Check Whether the Graph Helps

**vs Graph-Free MLP** trains a dense network on the node features alone, with the same split and with the epoch chosen by validation error, and compares test errors. A graph model that does no better says that the links add nothing the features have not already given, which is a common and useful result. For **Temporal GNN**, the comparison uses the features of the final snapshot, so it measures both the links and the history together.

## How to Detect Over-Smoothing

**Over-Smoothing Check** reports the mean cosine similarity across all pairs of node embeddings, with each node's similarity to itself counted among them. A value near 1 says that nodes have collapsed to almost the same representation. To judge the effect of depth, compare the value at different **num_layers** values on the same graph, as the level alone depends on the data. If similarity climbs and held-out error rises with depth, reduce the number of layers.

## How to Read Predictions on Test Nodes

**Predictions vs Targets** plots the test nodes only, the 20% scored once and never used for training or for picking the epoch. Points should lie along the dashed diagonal. A flat cloud means the model predicts close to the mean. If a few nodes lie far from it, check whether they are nodes with unusually many or few links, since the degree shapes how much a node's prediction is averaged with others.

## How to Check That Predictions Are Stable

A random split and random starting weights both affect results, especially on small graphs. The panel fixes the split, with `randperm(Xoshiro(1), n)`, so comparisons between tabs use the same nodes. To learn how much a result depends on these choices, change the seed of the split and retrain. Differences between tabs smaller than the movement from one seed to another should not be taken as real.

## Common Failures When Training on a Graph

Features with very different scales make training unstable, and a loss that stays flat suggests that scale or the learning rate is at fault. Isolated nodes get no messages. A mismatch between **in_channels** and the first dimension of **Node features** gives a dimension error at the first layer. For **GAT**, a **hidden_channels** value not divisible by **num_heads** gives a layer whose joined output has the wrong width.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
