# Maximal Itemsets

A frequent itemset is **maximal** if none of its supersets is frequent. The maximal itemsets mark the border between what is frequent and what is not: every frequent itemset is a subset of one of them.

## Maximal, Closed and All
Every maximal itemset is closed, and every closed itemset is frequent, so

maximal <= closed <= all frequent itemsets.

Maximal itemsets are the most compact summary, but they lose the supports: from them you know which itemsets are frequent, not how frequent each one is.

## When to Use Them
- When the question is "which combinations are frequent at all", not "how often".
- To see the longest patterns in the data at a glance.
- When even the closed itemsets are too many to read.

## In RuleMiner
`fpmax(txns, min_support)` (FP-Max; Grahne and Zhu 2005) returns one row per maximal itemset, with columns Itemset, Support, N and Length.

## See Also
- [Closed Itemsets](closed-itemsets.md) · [FP-Growth](fpgrowth.md) · [Decision Guide](decision-guide.md)
