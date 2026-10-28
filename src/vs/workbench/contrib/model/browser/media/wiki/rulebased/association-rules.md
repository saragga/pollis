# Association Rules

An **association rule** A => C says that transactions containing the itemset A (the antecedent, LHS) tend to contain the item C (the consequent, RHS). A and C share no items. Rules are built from frequent itemsets: each frequent itemset S gives the rules (S without C) => C, one for each item C in S.

## Measures
For n transactions:

- **Support** = (transactions with A and C) / n
- **Coverage** = (transactions with A) / n
- **Confidence** = support / coverage, an estimate of P(C given A)
- **Lift** = confidence / (transactions with C / n)
- **N** = transactions with A and C; **Length** = number of items in A and C together

## Filtering
min_support decides which itemsets, and so which rules, exist. min_confidence then drops rules that are rarely right. Neither removes uninformative rules: a rule towards a very common item can have high confidence and lift near 1. Rank by lift, and check the count N, before reading a rule.

## Other Measures
Leverage (support minus the product of the supports of A and C) and conviction are sometimes used instead of lift; both can be computed from the columns above.

## Redundant Rules
If {A} => C and {A, B} => C have the same confidence, the longer rule adds nothing. Mining from closed itemsets, or keeping only rules whose confidence beats that of all their shorter versions, removes many such rules.

## In the Panel
The Association Rules model mines with Apriori; see [Apriori](apriori.md) for why min_confidence is applied after mining. **Support vs Confidence**, **Uninformative Rules**, **Strongest Rules** and **Recommend Items** work on the rules.

## See Also
- [Interpretation](interpretation.md) · [Apriori](apriori.md) · [Diagnostics](diagnostics.md)
