# FP-Growth

FP-Growth (Han, Pei and Yin 2000) finds all frequent itemsets without generating candidates, by compressing the data into a **frequent-pattern tree** (FP-tree).

## How It Works
1. Count the items and drop the infrequent ones.
2. Sort the items of each transaction by decreasing frequency and insert the transaction into a prefix tree: transactions that share their first items share a path, and each node keeps a count.
3. For each item, from the least frequent, collect the paths that end in it (its conditional pattern base), build a smaller conditional FP-tree from them, and mine it recursively.

Because frequent items come first, many transactions share a path, and the tree is often much smaller than the data.

## Strengths and Limits
- No candidate generation and only two passes over the data.
- Usually the fastest choice on **large or sparse** data.
- The tree must fit in memory; with many distinct transactions it compresses little.
- Returns the same itemsets as ECLAT.

## In RuleMiner
`fpgrowth(txns, min_support)` returns one row per frequent itemset, with columns Itemset, Support, N and Length. It is the panel's default algorithm and is used by the Support Threshold Sweep.

## See Also
- [ECLAT](eclat.md) · [Closed Itemsets](closed-itemsets.md) · [Maximal Itemsets](maximal-itemsets.md)
