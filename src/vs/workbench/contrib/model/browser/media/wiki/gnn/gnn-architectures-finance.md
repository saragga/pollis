# GNN Architectures in Finance

Financial data is relational by nature. Stocks share sectors and ETF memberships. Banks lend to each other. Transactions form directed networks of payments. While tabular models treat each entity in isolation, Graph Neural Networks (GNNs) exploit these connections directly — propagating information along edges so that a node's representation is shaped by its neighbourhood.

This reference compares the four architectures in this webview, explains when each is the right choice, and bridges to related work in the RNN and CNN webviews.

---

## At-a-Glance Comparison

| Architecture | Aggregation | Key Strength | Main Limitation |
|:---|:---|:---|:---|
| **GCN** | Symmetric-normalised mean | Simple, fast, strong baseline | Sensitive to degree imbalance; fixed graph at inference |
| **GAT** | Learned attention weights | Differentiates neighbour importance | Higher memory cost; attention can saturate on dense graphs |
| **GraphSAGE** | Sampled mean / max / sum | Inductive — scores unseen nodes without retraining | Sample size trades off accuracy for speed |
| **Temporal GNN** (EvolveGCN-O) | GRU-evolved GCN weights | Models topology that changes over time | Requires discrete snapshots; no continuous-time support |

---

## GCN — The Baseline

GCN (Kipf & Welling, 2017) computes each layer as:

**H⁽ˡ⁺¹⁾ = σ(D̃⁻½ Ã D̃⁻½ H⁽ˡ⁾ W⁽ˡ⁾)**

where Ã = A + I adds self-loops and D̃ is its degree matrix. Every neighbour contributes equally, weighted only by degree normalisation.

**Financial applications:**
- **Fraud and AML detection** — transaction graphs where fraudulent accounts cluster. GCN propagates suspicion scores across the neighbourhood efficiently.
- **Credit risk** — corporate borrowing networks where a counterparty's distress signal reaches connected lenders within two hops.
- **Systemic risk** — interbank exposure graphs. GCN identifies nodes whose removal would most damage network connectivity.

**When to prefer GCN:** the graph is relatively homogeneous, edge weights are not meaningful, and you need a fast, interpretable baseline before committing to a more complex architecture.

---

## GAT — Attention-Weighted Aggregation

GAT (Veličković et al., 2018) learns a scalar attention weight α_{ij} for each edge before aggregating:

**α_{ij} = softmax_j( LeakyReLU( aᵀ [Wh_i ‖ Wh_j] ) )**

**h_i⁽ˡ⁺¹⁾ = σ( Σ_{j∈N(i)} α_{ij} W h_j⁽ˡ⁾ )**

Multi-head attention runs K independent attention functions in parallel and concatenates (all layers except the last) or averages (last layer) the results.

**Financial applications:**
- **Noisy correlation graphs** — stock return correlations are dense and partially spurious. GAT down-weights weak or unstable correlations automatically without manual thresholding.
- **Supply-chain risk** — a tier-1 supplier failure matters more than a tier-3 one; GAT can learn this asymmetry from labelled disruption data.
- **Earnings call networks** — analyst–company coverage graphs where some analysts are more informative than others for a given stock.

**When to prefer GAT over GCN:** neighbour relevance varies and you have enough labelled data to train the attention parameters reliably. On small or very sparse graphs the extra parameters may overfit; GCN or GraphSAGE is safer.

---

## GraphSAGE — Inductive Learning

GraphSAGE (Hamilton et al., 2017) differs from GCN in two important ways. First, it **samples** a fixed-size neighbourhood rather than using all neighbours, making it scalable to graphs with millions of nodes. Second, it concatenates the node's own embedding with the aggregated neighbourhood signal before the linear transformation:

**h_i⁽ˡ⁺¹⁾ = σ( W · CONCAT(h_i⁽ˡ⁾, AGG({h_j⁽ˡ⁾ : j ∈ N(i)})) )**

Crucially, once trained, GraphSAGE can embed nodes that did not exist during training — new merchants, newly listed stocks, or new borrowers — without any retraining. This is the **inductive** property that GCN and GAT lack (both require the full adjacency matrix at inference time).

**Financial applications:**
- **Real-time fraud scoring** — new payment accounts appear continuously. GraphSAGE embeds them immediately using the connections they form, without a retrain cycle.
- **Portfolio expansion** — when a new stock is added to the universe, GraphSAGE assigns it an embedding based on its sector memberships and co-movement correlations with existing stocks.
- **Regulatory reporting** — large graphs grow over fiscal years; GraphSAGE scales where GCN would require rebuilding the full normalised adjacency.

**Aggregation choice:**

| Function | Julia | Use when |
|:---|:---|:---|
| mean | `mean` | Smooth neighbourhood signal; most common |
| max | `maximum` | Detect extreme events; useful for anomaly tasks |
| sum | `sum` | Node degree matters (hub nodes should dominate) |

---

## Temporal GNN — EvolveGCN-O

Static GNNs assume the graph topology is fixed. Financial networks are not: correlation regimes shift, new trading relationships form, and systemic links appear and disappear. EvolveGCN-O (Pareja et al., 2020) treats each discrete snapshot as one time step and uses a GRU to update the GCN weight matrix W between snapshots:

**W⁽ᵗ⁾ = GRU(W⁽ᵗ⁻¹⁾, ĀH⁽ᵗ⁾)**

**H⁽ᵗ⁺¹⁾ = σ(ĀH⁽ᵗ⁾ W⁽ᵗ⁾)**

The GRU evolves the *weights*, not the hidden state. This means the model adapts its aggregation function over time rather than just carrying a per-node memory, which makes it well-suited to structural change.

**Financial applications:**
- **Dynamic correlation graphs** — rolling-window return correlations that shift during stress periods (e.g., crisis correlation convergence). EvolveGCN captures the regime transition.
- **Evolving transaction networks** — money-laundering rings change topology to evade detection. A temporal model trained on snapshot sequences can identify structural drift.
- **Intraday market microstructure** — order-book relationships between stocks change throughout the trading day; EvolveGCN processes hourly snapshots.

**Limitation:** EvolveGCN requires discrete, regularly-spaced snapshots. For continuous-time event graphs (e.g., individual transactions timestamped to the millisecond), TGAT or TGN are more appropriate but are not in this webview.

---

## Heterogeneous Graphs

All four architectures above assume a **homogeneous** graph — one node type, one edge type. Real financial networks are rarely this simple. A corporate ownership graph has company nodes, fund nodes, and executive nodes, connected by equity ownership, board membership, and debt issuance edges.

The **Heterogeneous checkbox** in this webview wraps any of the three static architectures (GCN, GAT, GraphSAGE) in `HeteroGraphConv`, which assigns **separate weight matrices to each relation type**:

```julia
conv = HeteroGraphConv(
    (:company, :owns,        :fund)    => GCNConv(in => h, relu),
    (:company, :co_invested, :company) => GCNConv(in => h, relu),
    (:analyst, :covers,      :company) => GCNConv(in => h, relu);
    aggr = +
)
```

This is equivalent to what the literature calls **R-GCN** (Schlichtkrull et al., 2018) or **R-GAT** depending on the base conv layer. The `num_relations` parameter controls how many relation types appear in the constructor scaffold.

**Enable Heterogeneous when:**
- Your graph has two or more semantically distinct edge types (ownership ≠ lending ≠ co-directorship).
- You have enough labelled data to train the extra parameters (roughly `num_relations ×` the homogeneous parameter count in the GNN layers).

**Keep it off when:**
- All edges represent the same relationship (e.g., all are price correlations).
- The graph is very sparse — too few edges per relation type means most relation-specific weights will be poorly trained.

---

## GNN vs RNN and CNN

Users of the RNN and CNN webviews may wonder when a GNN is the right tool instead.

| Question | Use GNN | Use RNN / CNN |
|:---|:---|:---|
| Does the data have explicit pairwise relationships? | Yes — entities connected by edges | No — each sample is independent or sequential |
| Is the primary structure a sequence (time, text)? | No | Yes — RNN for ordered sequences, CNN for local patterns |
| Do you need to propagate signals across a network? | Yes — contagion, correlation, supply chains | No |
| Is the graph topology itself a feature? | Yes — degree, centrality, community structure | No |
| Do you have both graph structure and time? | Temporal GNN (or GNN + RNN hybrid) | Pure RNN if no graph |

A common hybrid: use a GCN or GAT to embed node features at each time step, then pass the resulting embeddings into an LSTM across snapshots. This is the manual equivalent of EvolveGCN and is straightforward to implement in Flux.jl.

---

## Decision Guide

| Task | Recommended | Rationale |
|:---|:---|:---|
| Fraud / AML on a fixed graph | GCN or GAT | GCN is the fast baseline; GAT if neighbour relevance varies |
| Fraud on a growing graph (new accounts) | GraphSAGE | Inductive — no retraining when new nodes arrive |
| Credit risk with counterparty contagion | GAT | Learns which counterparties matter most |
| Portfolio construction from return correlations | GAT or GCN | Dense, noisy graph; GAT filters weak correlations |
| Systemic risk on interbank network | GCN | Propagation depth matters; GCN is interpretable |
| Evolving correlation regimes | Temporal GNN | Captures structural change between snapshots |
| Corporate knowledge graph (multi-type edges) | GCN + Heterogeneous | Separate weights per relation type |
| New stock embedding without retraining | GraphSAGE | Inductive property is essential |
