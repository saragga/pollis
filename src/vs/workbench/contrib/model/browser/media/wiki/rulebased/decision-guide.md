# Decision Guide

## Which Model

| You want | Use |
|---|---|
| Which items occur together | **Itemset Mining** |
| If-then statements, recommendations | **Association Rules** |
| A short summary of many itemsets | Itemset Mining with **FP-Close** or **FP-Max** |

## Which Itemset Algorithm

| Algorithm | Returns | Strategy | Suits |
|---|---|---|---|
| **ECLAT** | All frequent itemsets | Depth first; intersects lists of transaction ids | Dense data, many frequent items, data that fit in memory |
| **FP-Growth** | All frequent itemsets | Compresses the data into an FP-tree; no candidates | Large or sparse data; the usual default |
| **FP-Close** | Closed itemsets | FP-tree | Too many itemsets, but supports must be kept |
| **FP-Max** | Maximal itemsets | FP-tree | The most compact list of what is frequent |
| **Apriori** | Rules (in this panel) | Level by level, with candidate generation | Rules; small to medium data |

ECLAT and FP-Growth return the same itemsets; they differ only in speed and memory. Run **Algorithm Timing** to choose on your data.

## All, Closed or Maximal

- **All** itemsets, when the output is small enough to read.
- **Closed**, when there are too many: nothing is lost, since the support of every frequent itemset can be recovered from the closed ones.
- **Maximal**, when only the border of what is frequent matters: the most compact, but the supports of subsets are lost.

## Choosing the Thresholds
- **min_support**: start high and lower it with the **Support Threshold Sweep**. In sparse data, such as baskets from a large catalogue, useful thresholds are often 0.01 or lower.
- **min_confidence**: a filter, not a test. Keep it moderate, then rank by lift; a high value keeps only rules towards very common items.

## Rules or a Model
Rules describe; they do not adjust for other items or variables. To predict one item from the others, or to estimate the effect of A on C holding other things fixed, use a classifier or a regression. Rules are a good way to find the candidates.

## See Also
- [Apriori](apriori.md) · [ECLAT](eclat.md) · [FP-Growth](fpgrowth.md) · [Association Rules](association-rules.md)
