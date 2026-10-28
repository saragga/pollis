# Interpretation

## An Itemset
An itemset {A, B} with support 0.03 and N 300 was found in 3 per cent of the transactions, 300 of them. That is all it says: support does not tell whether A and B occur together more often than chance. Two very common items form a frequent pair even when they are unrelated.

## A Rule
A rule A => C reads: "in the transactions that contain A, C is also present with probability Confidence". Read its measures together:

- **Coverage**: how often the rule applies at all. A rule with high confidence but low coverage is about a rare situation.
- **Support**: how often the rule applies and is right. Low support means the confidence rests on few transactions.
- **Confidence**: how often C follows A. On its own it misleads when C is common: if 40 per cent of all transactions contain C, a confidence of 0.4 says nothing.
- **Lift**: confidence divided by the support of C. Lift 1 is independence, above 1 means A and C occur together more often than chance, below 1 less often.

A good rule has lift clearly above 1, enough support for the confidence to be stable, and a small Fisher p-value.

## Lift Is Symmetric
Lift of A => C equals lift of C => A: it measures association, not direction. Confidence is not symmetric, and the direction with the higher confidence is the more useful for prediction, but neither direction is causal.

## Recommendations
**Recommend Items** takes the rules whose LHS is contained in a basket and whose RHS is not, and ranks their RHS items by confidence. This is the simplest rule-based recommender. It gives nothing for a basket that no rule's LHS fits, and it favours common items; ranking by lift instead favours items specific to the basket.

## Reporting
State the transaction unit, the number of transactions and items, min_support, min_confidence, the algorithm, and how many itemsets or rules were found. For each rule reported, give support (or N), confidence and lift.

## See Also
- [Association Rules](association-rules.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
