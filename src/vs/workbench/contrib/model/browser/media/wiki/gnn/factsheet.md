# Graph Neural Networks — Factsheet

The Graph Neural Networks panel trains networks on one graph to predict a value for each node, in Flux.jl and GraphNeuralNetworks.jl. Each node updates its representation from its neighbours, and a dense layer reads the prediction from the result.

## What the Graph Neural Networks Panel Does

| Item | Description |
|---|---|
| **Purpose** | Node-level regression on a graph with node features |
| **Julia stack** | GraphNeuralNetworks.jl for the graph layers; Flux.jl for the dense layer and training |
| **Models** | **GCN**, **GAT**, **GraphSAGE** and **Temporal GNN** tabs |
| **Inputs** | **Graph**, **Node features** as in_channels × nodes, **Target variable** as out_channels × nodes |
| **Split** | Random 60% of nodes for training, 20% for validation and 20% for test |
| **Layers** | **num_layers** rounds of message passing, then a dropout and a dense readout |
| **Training** | Whole graph at each step, Adam with learning rate 0.001, 200 epochs, with the epoch chosen by validation error |

## How Each Graph Neural Network Tab Combines Neighbours

| Tab | Layer | How neighbours are combined | Specific inputs |
|---|---|---|---|
| **GCN** | `GCNConv` with relu | Average with symmetric degree normalisation | None |
| **GAT** | `GATConv` with elu | Weighted by learned attention, over several heads | **num_heads** |
| **GraphSAGE** | `SAGEConv` with relu | Node combined with an aggregate of neighbours | **aggr** |
| **Temporal GNN** | `EvolveGCNO` | GCN whose weights evolve across snapshots | None |

## Which Inputs Change the Structure of the Network

**hidden_channels** sets the width of each layer, and **num_layers** the number of hops that information travels. For **GAT**, **num_heads** should divide **hidden_channels**, as each head has hidden_channels ÷ num_heads outputs before they are joined. **Graph type** set to **Heterogeneous** builds one convolution per edge type, in the number given by **num_relations**, and sums them for each node. **dropout** acts once, after the last graph layer.

## See Also

- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Heterogeneous Graphs](heterogeneous.md) · [GNN Architectures in Finance](gnn-architectures-finance.md)
