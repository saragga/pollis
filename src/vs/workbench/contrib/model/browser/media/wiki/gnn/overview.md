# Graph Neural Networks — Overview

Some data lies on a network: firms linked by supply chains, assets linked by correlation, people linked by contact. A graph neural network predicts for each node using both that node's features and those of its neighbours, so the structure of the links shapes the prediction.

## How Message Passing Works

In each layer, every node collects messages from its neighbours, combines them, and updates its own representation. The same weights are used at all nodes, so the number of parameters does not grow with the size of the graph, and the result does not depend on the order in which nodes are numbered. After k layers, a node's representation depends on nodes up to k hops away. This count of hops is the analogue of the receptive field in a convolutional network.

## How the GCN Averages Neighbours

The graph convolution of [Kipf and Welling (2017)](#ref-KW2017a) multiplies the hidden features by the adjacency matrix with self-loops, normalised by node degrees, and then by a learned weight matrix. The effect is a local weighted average followed by a linear map and a nonlinearity. It has few parameters, trains quickly and sets a strong baseline. Each neighbour's weight depends only on the degrees and not on its features, so a **GCN** cannot learn to favour some neighbours over others.

## How GAT Learns Which Neighbours Matter

The graph attention network of [Veličković, Cucurull, Casanova, Romero, Liò and Bengio (2018)](#ref-VCCRL...2018a) computes a score for every edge from the features at its two ends, and turns the scores into weights across each node's neighbours. Several heads run in parallel and their outputs are joined, which steadies training. This suits graphs where neighbours differ widely in relevance. The extra parameters make **GAT** more prone to overfitting a small graph.

## How GraphSAGE Generalises to New Nodes

[Hamilton, Ying and Leskovec (2017)](#ref-HYL2017a) learn a function that combines a node's features with an aggregate of its neighbours' features, rather than one tied to a fixed graph. This inductive view suits graphs that grow, or prediction on nodes unseen in training. The **aggr** input selects **mean**, **max** or **sum**. The original article also samples a fixed number of neighbours for scaling to large graphs, which the **GraphSAGE** tab does not do, as it uses all neighbours.

## How the Temporal Tab Handles Changing Graphs

EvolveGCN of [Pareja, Domeniconi, Chen, Ma, Suzumura, Kanezashi, Kaler, Schardl and Leiserson (2020)](#ref-PDCMS...2020a) handles a sequence of graph snapshots by making the convolution weights themselves change over time. The **Temporal GNN** tab uses the variant in which a recurrent cell evolves these weights from one snapshot to the next. The network processes snapshots in order, and the prediction reads the node embedding after the final one, so the target should belong to that final time.

## A Common Workflow for Graph Neural Networks

1. Build the graph, and scale **Node features**.
2. Fit **GCN** first, as the baseline with graph structure.
3. Check that the graph helps with **vs Graph-Free MLP**.
4. Try **GAT** or **GraphSAGE** if the baseline falls short, and **Heterogeneous** if edges have several meanings.
5. Run **Over-Smoothing Check** before adding layers.

## References

<a id="ref-HYL2017a"></a>Hamilton, W. L., Ying, R. and Leskovec, J. (2017). Inductive representation learning on large graphs. arXiv:1706.02216. [doi:10.48550/arXiv.1706.02216](https://doi.org/10.48550/arXiv.1706.02216)

<a id="ref-KW2017a"></a>Kipf, T. N. and Welling, M. (2017). Semi-supervised classification with graph convolutional networks. *International Conference on Learning Representations*. arXiv:1609.02907. [doi:10.48550/arXiv.1609.02907](https://doi.org/10.48550/arXiv.1609.02907)

<a id="ref-PDCMS...2020a"></a>Pareja, A., Domeniconi, G., Chen, J., Ma, T., Suzumura, T., Kanezashi, H., Kaler, T., Schardl, T. and Leiserson, C. (2020). EvolveGCN: evolving graph convolutional networks for dynamic graphs. *Proceedings of the AAAI Conference on Artificial Intelligence* 34(04), 5363–5370. [doi:10.1609/aaai.v34i04.5984](https://doi.org/10.1609/aaai.v34i04.5984)

<a id="ref-VCCRL...2018a"></a>Veličković, P., Cucurull, G., Casanova, A., Romero, A., Liò, P. and Bengio, Y. (2018). Graph attention networks. *International Conference on Learning Representations*. arXiv:1710.10903. [doi:10.48550/arXiv.1710.10903](https://doi.org/10.48550/arXiv.1710.10903)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md) · [Heterogeneous Graphs](heterogeneous.md)
