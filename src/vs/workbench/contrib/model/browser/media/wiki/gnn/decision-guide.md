# Graph Neural Networks — Decision Guide

Start by asking whether a graph is justified at all, then what the links mean and whether they change through time. The choice of tab follows from those answers.

## Which Graph Neural Network Tab Fits a Problem

| Situation | Choice | Why |
|---|---|---|
| One graph with neighbours of similar relevance | **GCN** | Few parameters, fast and a good baseline |
| Neighbours differ widely in relevance | **GAT** | Learns a weight for each edge from the node features |
| Large or growing graphs, or new nodes at prediction time | **GraphSAGE** | Learns an aggregation function usable on unseen nodes |
| A sequence of snapshots of a changing graph | **Temporal GNN** | A recurrent cell evolves the weights across snapshots |
| Several kinds of edge with different meanings | **Graph type**: **Heterogeneous** | Separate weights per relation, as in [Schlichtkrull, Kipf, Bloem, van den Berg, Titov and Welling (2018)](#ref-SKBBT...2018a) |

## When to Use a Graph Network at All

A graph model suits data whose links plausibly carry information not already in the node features. If there is no natural graph, and one must be invented from the same features, a dense or tree model on those features is often the better first step. Run **vs Graph-Free MLP** early. With few nodes, a graph network has too little data to justify its parameters, and a regression with features summarising the neighbours is a sound alternative.

## How to Choose the GraphSAGE Aggregator

The **aggr** input takes three values, each answering a different question about the neighbourhood. **mean** gives the typical neighbour and is stable across nodes of different degree. **max** reacts to the strongest neighbour, which suits a problem where one extreme link matters. **sum** preserves the number of neighbours, which suits targets that build up with exposure, but its outputs grow with degree, so it can be hard to train on graphs with some highly connected nodes.

## How to Size a Graph Network

Start with **num_layers** at 2 and **hidden_channels** at the default of 64, and go up only when both errors stay high. Set **dropout** between 0.1 and 0.5 when the validation error separates from the training error. In **GAT**, four heads is a sensible start, and more heads divide the same width further. Deeper is seldom better here: test one extra layer at a time and read **Over-Smoothing Check** along the way.

## How Graph Networks Compare with Other Models

A panel regression with spatial or network lags gives coefficients with standard errors and needs far less data, and it should be preferred when an interpretable effect is what the analysis wants. A dense network or gradient boosting ignores the links and sets the baseline for what they add. Graph networks have the most to offer with many nodes, informative links, and nonlinear effects of neighbours, which is a demanding combination.

## References

<a id="ref-SKBBT...2018a"></a>Schlichtkrull, M., Kipf, T. N., Bloem, P., van den Berg, R., Titov, I. and Welling, M. (2018). Modeling relational data with graph convolutional networks. *Lecture Notes in Computer Science*, 593–607. [doi:10.1007/978-3-319-93417-4_38](https://doi.org/10.1007/978-3-319-93417-4_38)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Heterogeneous Graphs](heterogeneous.md) · [GNN Architectures in Finance](gnn-architectures-finance.md)
