# Closed Itemsets

A frequent itemset is **closed** if no superset has the same support (Pasquier and others 1999). If {A, B} is in exactly the same transactions as {A, B, C}, then {A, B} is not closed: C is always there when A and B are, and {A, B} adds nothing.

## Why Use Them
- They summarise the frequent itemsets **without loss**: the support of any frequent itemset equals the largest support among the closed itemsets that contain it.
- There are often far fewer closed itemsets than frequent ones, especially in dense data where items come in groups.
- Rules built from closed itemsets avoid many redundant rules.

## Reading Them
Each closed itemset is the largest set of items shared by a group of transactions. A closed itemset with high support is a "bundle" whose items almost always occur together.

## In RuleMiner
`fpclose(txns, min_support)` (FP-Close; Grahne and Zhu 2005) returns one row per closed itemset, with columns Itemset, Support, N and Length. **All vs Closed vs Maximal** shows how much they shrink the output.

## See Also
- [Maximal Itemsets](maximal-itemsets.md) · [FP-Growth](fpgrowth.md) · [Decision Guide](decision-guide.md)
