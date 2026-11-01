# Graph Neural Networks — Assumptions

A graph neural network takes the links it is given as fact. The results depend on what those links mean, and on how well they describe the relation between neighbouring nodes.

## What the Graph Itself Assumes

The edges are taken to carry information about the target. Yet a graph built by the analyst, such as one from thresholding correlations, embodies many choices, and each choice changes the model. A correlation graph computed over the full sample also leaks later information into earlier predictions. Missing or spurious edges act directly on the messages, and nothing in the training flags them, so test the sensitivity of results to how the graph was built.

## Why Similar Neighbours Help a GCN

Averaging neighbours works best under homophily, where linked nodes tend to have similar targets. Under heterophily, where links join nodes with different targets, a neighbourhood average blurs what makes a node distinct, and the **GCN** tab may do worse than a model with no graph. **GraphSAGE** keeps a node's own features apart from its neighbours' aggregate, which mitigates the problem, and **GAT** can downweight unhelpful neighbours. **vs Graph-Free MLP** shows whether the graph helps at all.

## What the Random Split of Nodes Assumes

All nodes and edges remain visible during training, and only the training nodes contribute to the loss. This is the transductive setting of [Kipf and Welling (2017)](#ref-KW2017a), which assumes that test nodes are known at training time and that only their targets are hidden. Test node features still flow into the embeddings of training nodes through messages, which is legitimate only if those features truly would be available. For data that arrive through time, a random split of nodes can let information travel backwards, and an inductive evaluation on a later graph is sounder.

## What Each Layer's Depth Assumes About Reach

**num_layers** states how far relevant information lies. Two hops is often enough, since in many real networks a few hops reach a large part of the graph. Depth brings the risk shown by [Li, Han and Wu (2018)](#ref-LHW2018a): repeated smoothing makes the representations of different nodes converge, and the nodes become hard to tell apart. Unlike a convolutional network on a sequence, more depth is not usually the cheap way to improve fit.

## What Message Passing Cannot Distinguish

Standard message passing sees a node's neighbourhood only through an aggregate, so it can give two nodes the same representation when their neighbourhoods look alike, even if they sit in different places in the graph. Features that describe global position, such as centrality, must be added by the user to **Node features** if they matter. Nodes with no neighbours receive no messages and rely on their own features, which is worth checking in a sparse graph.

## What Temporal and Heterogeneous Settings Assume

The **Temporal GNN** tab assumes a sequence of snapshots with node features at each, and weights that evolve smoothly, since a recurrent cell links each snapshot to the previous one. The target is scored once, after the final snapshot. With **Graph type** set to **Heterogeneous**, the model assumes one node type and that the edge types are known, with separate weights for each, so that a sparse relation offers few data points for its own weights.

## References

<a id="ref-KW2017a"></a>Kipf, T. N. and Welling, M. (2017). Semi-supervised classification with graph convolutional networks. *International Conference on Learning Representations*. arXiv:1609.02907. [doi:10.48550/arXiv.1609.02907](https://doi.org/10.48550/arXiv.1609.02907)

<a id="ref-LHW2018a"></a>Li, Q., Han, Z. and Wu, X.-M. (2018). Deeper insights into graph convolutional networks for semi-supervised learning. *Proceedings of the AAAI Conference on Artificial Intelligence* 32(1). [doi:10.1609/aaai.v32i1.11604](https://doi.org/10.1609/aaai.v32i1.11604)

## See Also

- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Heterogeneous Graphs](heterogeneous.md)
