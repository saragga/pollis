# Apriori

Apriori (Agrawal and Srikant 1994) mines frequent itemsets level by level, and is the classic way to generate association rules. In the Rule-Based Methods panel it is used by the Association Rules model.

## The Apriori Property
Every subset of a frequent itemset is frequent; so if an itemset is infrequent, so are all its supersets. Apriori uses this to prune the search.

## How It Works
1. Count every single item and keep those with support >= min_support.
2. Join the frequent itemsets of size k into candidates of size k + 1, and drop any candidate that has an infrequent subset of size k.
3. Count the candidates in the data and keep the frequent ones.
4. Repeat until no candidate is frequent.
5. From each frequent itemset, form rules A => C with one item C on the right, and compute their confidence, coverage and lift.

## In RuleMiner
`apriori(txns, min_support, min_confidence)` returns one row per rule, with columns LHS, RHS, Support, Confidence, Coverage, Lift, N and Length. RuleMiner prunes by confidence while it grows the rules, so a high min_confidence can lose strong long rules whose shorter parents are weak. The panel therefore mines every rule of the frequent itemsets with min_confidence 0 and keeps those at or above min_confidence afterwards.

## Cost
Apriori scans the data once per level and can generate many candidates when frequent items are numerous. On large or dense data, ECLAT or FP-Growth find the itemsets faster.

## See Also
- [Association Rules](association-rules.md) · [ECLAT](eclat.md) · [FP-Growth](fpgrowth.md)
