# ECLAT

ECLAT (Equivalence Class Transformation; Zaki and others 1997) finds all frequent itemsets by searching depth first over **transaction-id sets**.

## How It Works
1. For each item, keep the set of transactions that contain it (its tid-set, a column of the transactions x items matrix). Its support is the size of that set.
2. The tid-set of an itemset is the intersection of the tid-sets of its items, so the support of {A, B} is the size of tid(A) intersected with tid(B).
3. Extend each frequent itemset with one more item at a time, depth first, and stop a branch as soon as the intersection falls below min_support.

The data are read once, to build the tid-sets; after that, support is computed by intersections alone, without scanning the transactions again.

## Strengths and Limits
- Fast on **dense** data, where many items are frequent and intersections are cheap.
- Memory grows with the tid-sets along the current branch; on very large data with long transactions, FP-Growth can use less.
- Returns the same itemsets as FP-Growth.

## In RuleMiner
`eclat(txns, min_support)` returns one row per frequent itemset, with columns Itemset, Support, N and Length.

## See Also
- [FP-Growth](fpgrowth.md) · [Apriori](apriori.md) · [Decision Guide](decision-guide.md)
