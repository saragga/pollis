# Rule-Based Methods — Factsheet

**Frequent itemset mining** and **association rule mining** describe which items occur together in a collection of transactions. They were introduced for market-basket analysis (Agrawal, Imielinski and Swami 1993; Agrawal and Srikant 1994) and are used wherever data are sets: diagnoses, symptoms and drugs in medicine, words in text, clicks in web logs, products and services in firms. They are descriptive methods: they count, they do not fit a model.

| | |
|---|---|
| **Purpose** | Find frequent sets of items and if-then rules between them |
| **Input** | A table in long format with columns Transaction and Item; min_support, and min_confidence for rules |
| **Core package** | [RuleMiner.jl](https://github.com/JaredSchwartz/RuleMiner.jl) |
| **Algorithms** | Apriori (Agrawal and Srikant 1994), ECLAT (Zaki and others 1997), FP-Growth (Han, Pei and Yin 2000), FP-Close and FP-Max (Grahne and Zhu 2005) |
| **Output** | Itemsets with Support, N and Length; rules with LHS, RHS, Support, Confidence, Coverage, Lift, N and Length |
| **Key choices** | min_support; min_confidence; all, closed or maximal itemsets |

## Measures

| Measure | Of | Meaning |
|---|---|---|
| **Support** | Itemset or rule | Share of transactions that contain all its items |
| **N** | Itemset or rule | Number of transactions that contain all its items |
| **Coverage** | Rule A => C | Support of A: how often the rule applies |
| **Confidence** | Rule A => C | Support of A and C / support of A: an estimate of P(C given A) |
| **Lift** | Rule A => C | Confidence / support of C: how many times more often C occurs with A than overall |

## When to Use

- **Market baskets**: products bought together, for placement, bundles and recommendations.
- **Co-occurrence** in any set-valued data: comorbidities, adverse drug reactions, skills in job adverts, keywords in papers.
- **Exploring** a large categorical data set before modelling it.

## What It Is Not

A rule is a co-occurrence, not a cause: A => C says that C is common among the transactions with A, not that A brings C about. Because the methods search thousands of patterns, some strong-looking rules are chance; and they ignore the order and the quantity of the items in a transaction.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
