# Diagnostics

The diagnostics answer two questions: is the threshold right, and are the rules better than chance?

## Support Threshold Sweep
Counts the frequent itemsets at min_support 0.2, 0.1, 0.05, 0.02 and 0.01, on a log scale. The count grows roughly exponentially as the threshold falls.
- **Too high**: only single items, or a few pairs, pass. Nothing new is learnt.
- **Too low**: tens of thousands of itemsets, most of them rare, and mining becomes slow and memory hungry.
- Pick the point where the curve starts to climb steeply, or the lowest threshold whose output can still be read, and then summarise with closed or maximal itemsets if needed.

## All vs Closed vs Maximal
Counts all, closed and maximal itemsets at the chosen threshold. A large gap between all and closed means many itemsets carry no information beyond their supersets; see [Closed Itemsets](closed-itemsets.md).

## Uninformative Rules
The share of rules with lift <= 1. Such a rule is no better than independence: C is no more common among transactions with A than among all of them. A high share is usual when min_confidence is low and C is a very common item; frequent items reach high confidence with anything.

## Strongest Rules and the Fisher Test
For each of the ten rules with the highest lift, the panel builds the 2 x 2 table of transactions with and without A against with and without C, and runs a one-sided Fisher exact test of independence. A rule with lift 5 seen in 4 transactions can have a large p-value; a rule with lift 1.3 seen in 2000 transactions can have a tiny one. Remember that the p-values are not corrected for the number of rules searched.

## Algorithm Timing
Runs ECLAT and FP-Growth on the data. Both must return the same number of itemsets. The faster one depends on the data: see the [Decision Guide](decision-guide.md).

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Association Rules](association-rules.md)
