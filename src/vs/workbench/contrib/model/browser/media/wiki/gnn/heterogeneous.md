# Heterogeneous Graphs

## What the Checkbox Does

When you tick **Heterogeneous**, the code template switches from a single `GNNChain` over a homogeneous graph to a `HeteroGraphConv` wrapper that assigns **separate, independent weight matrices to each relation type**.

In a homogeneous graph every edge is treated identically. In a heterogeneous graph there are multiple **node types** (e.g., companies, funds, analysts) and multiple **edge types** (e.g., ownership, co-investment, analyst coverage). Sharing weights across these structurally different relations forces the model to learn a single aggregation rule that cannot distinguish them. `HeteroGraphConv` fixes this by learning one set of weights per relation and then summing (or otherwise combining) the results at each node.

> **Rule of thumb:** if your graph has more than one edge type with meaningfully different semantics, enable Heterogeneous. If all edges represent the same relationship (e.g., all are price correlations), keep it off.

---

## The num_relations Parameter

`num_relations` sets how many distinct relation types appear in the `HeteroGraphConv` constructor. The template generates one conv entry per relation as a scaffold — you must replace the placeholder names (`:rel_1`, `:rel_2`, …) with the actual relation identifiers from your graph schema.

A typical `HeteroGraphConv` call looks like:

```julia
conv1 = HeteroGraphConv(
    (:company, :owns,        :fund)    => GCNConv(in_channels => hidden_channels, relu),
    (:company, :co_invested, :company) => GCNConv(in_channels => hidden_channels, relu),
    (:analyst, :covers,      :company) => GCNConv(in_channels => hidden_channels, relu);
    aggr = +   # sum contributions from all relation types at each node
)
```

The `aggr = +` argument sums the result of each conv over all relations that point to a given node. Alternatives include `mean` (average) and `cat` (concatenate, which doubles the channel count).

---

## When Heterogeneous Graphs Are Useful

### Financial Networks

- **Corporate ownership graphs** — nodes are companies, funds, and holding vehicles; edges are equity ownership stakes, debt relationships, and board memberships. Each edge type carries different information about control and risk exposure. A homogeneous GNN treating all edges the same cannot distinguish a majority ownership link from a minor bond holding.

- **Interbank contagion networks** — nodes are banks; edges are unsecured lending, repo transactions, and derivatives exposures. The propagation dynamics differ by instrument type. A heterogeneous GNN with three relation types learns separate propagation weights for each channel.

- **Knowledge graphs for fundamental analysis** — a knowledge graph might contain company nodes, sector nodes, country nodes, and person (executive) nodes, linked by "operates in", "headquartered in", "employs as CEO", and "reports to regulator" edges. Heterogeneous GNNs naturally handle this multi-type structure.

- **Multi-layer trading networks** — a single set of stocks can be connected simultaneously by price correlation edges, short-interest edges, and ETF co-membership edges. Treating them as separate relation types prevents the model from conflating momentum signals with structural exposure.

- **ESG supply-chain graphs** — companies are linked to suppliers, customers, and ESG data providers. Propagating ESG risk from suppliers to buyers requires a directed heterogeneous model where "supplies to" and "buys from" are distinct edge types.

### Other Domains

- **Biomedical knowledge graphs** — protein–protein interaction, drug–target, and disease–gene edges all carry different biological semantics; heterogeneous GNNs underpin many drug-discovery pipelines.

- **Recommendation systems** — user–item interaction graphs with "purchased", "viewed", and "rated" edges; the model learns that a purchase signal is stronger than a view.

---

## When to Stay Homogeneous

| Situation | Recommendation |
|---|---|
| All edges represent the same relationship | Homogeneous: simpler, fewer parameters |
| Graph is very sparse and num_relations is large | Risk of under-training; reduce relations or use homogeneous |
| Temporal GNN (EvolveGCN) | Heterogeneous support is disabled: temporal models require additional architectural changes beyond a simple HeteroGraphConv wrapper |
| Prototyping or baseline | Always start homogeneous; add heterogeneity only if it measurably improves validation metrics |

---

## Implementation Notes

- **Node features must be a `Dict`** when using `HeteroGraphConv`. Instead of a single matrix `X`, you pass `Dict(:company => X_company, :fund => X_fund, …)`. The output is also a `Dict` keyed by node type; index it with `[:target_type]` to extract the embeddings you want to pass to the readout layer.
- **Feature dimensions per node type can differ.** Each conv in the `HeteroGraphConv` dict takes the input dimension of its source node type, so you can have `GCNConv(16 => 64)` for companies and `GCNConv(8 => 64)` for funds in the same layer.
- **Parameter count scales linearly with `num_relations`.** A heterogeneous model with 4 relation types has roughly 4× the parameters in the GNN layers compared to its homogeneous counterpart. Regularise accordingly (increase dropout, add weight decay).
