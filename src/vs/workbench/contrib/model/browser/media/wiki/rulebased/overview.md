# Overview

This webview finds **patterns of co-occurrence** in transaction data: sets of items that often appear together, and if-then rules between them. A transaction is any record that holds a set of items: a shopping basket, the diagnoses of a patient, the words of a document, the courses a student takes, the products a firm reports. The data come in long format, one row per (transaction, item) pair, with columns Transaction and Item.

The panel has two models:

- **Itemset Mining**: every set of items whose **support**, the share of transactions that contain it, reaches min_support. Four algorithms: ECLAT and FP-Growth return all frequent itemsets; FP-Close returns only the closed ones and FP-Max only the maximal ones ([Closed Itemsets](closed-itemsets.md), [Maximal Itemsets](maximal-itemsets.md)).
- **Association Rules**: rules of the form {A, B} => C, mined with Apriori and scored by support, confidence, coverage and lift ([Association Rules](association-rules.md)).

The panel runs [RuleMiner.jl](https://github.com/JaredSchwartz/RuleMiner.jl), which stores the transactions as a sparse transactions x items matrix of true and false.

## Common Workflow

1. Load the transactions and choose min_support; run **Support Threshold Sweep** to see how the number of itemsets grows as the threshold falls.
2. Mine the itemsets and look at the **Most Frequent Patterns**.
3. If there are too many to read, run **All vs Closed vs Maximal** and switch to FP-Close or FP-Max.
4. Mine the rules, choose min_confidence, and look at **Support vs Confidence**.
5. Drop uninformative rules (**Uninformative Rules**, lift <= 1) and read the **Strongest Rules** with their Fisher p-values.
6. Use the rules on a new basket with **Recommend Items**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
