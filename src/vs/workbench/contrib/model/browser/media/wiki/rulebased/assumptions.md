# Assumptions

Itemset and rule mining make few statistical assumptions, because they count rather than estimate. The assumptions are about the data and about how the counts are read.

## About the Data
- **Transactions are the unit.** Each transaction is one set of items; two rows with the same Transaction and Item count once. Choose the transaction with care: a basket, a visit, a customer over a year and a patient over a lifetime give different patterns.
- **Presence only.** Quantity, price, order and time within a transaction are ignored. Rules about sequences need sequence mining instead.
- **Items are categorical.** A numeric variable must be turned into items first, for example by binning it into "age 30-39".
- **Absence is not recorded.** An item missing from a transaction is taken as not present, which is wrong if the data are incomplete.
- **One population.** The transactions should come from one process. Pooling different stores, periods or groups can create rules that hold in none of them, or hide rules that hold in each (Simpson's paradox).

## About Reading the Results
- **Support and confidence are sample estimates.** They estimate proportions in the population the transactions come from; a rule seen in few transactions has a large sampling error.
- **Many patterns are searched.** With thousands of candidate rules, some will have high lift by chance. A p-value for one rule, such as the Fisher test in **Strongest Rules**, is not corrected for this search.
- **Co-occurrence is not causation.** A => C and C => A come from the same count; lift is symmetric in A and C.

## Checking
- **Support Threshold Sweep** shows whether the threshold leaves a readable number of itemsets.
- **Strongest Rules** reports the count n and a Fisher p-value for each rule: a high lift on a handful of transactions is often chance.
- Re-mine on a different period or a random half of the data: rules that survive are worth more.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Factsheet](factsheet.md)
