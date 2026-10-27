# SIRUS

**SIRUS** (Stable and Interpretable RUle Sets; Benard, Biau, Da Veiga and Scornet, 2021) turns a random forest into a short list of if-then rules, such as "if feature 7 > 2.3 then 0.8 else 0.1". The prediction is a weighted sum of the rules that fire.

## How It Works
1. Each feature is cut at a few **quantiles**, so that every tree in the forest can only split at the same few points.
2. A random forest of shallow trees is grown with those splits.
3. The paths that appear in **many trees** become candidate rules: with shared split points, the same rule recurs across trees.
4. The most frequent rules are kept, redundant ones removed, and their weights fitted.

Because the rules are those the forest finds again and again, they barely change when the data are resampled: that **stability** is what distinguishes SIRUS from reading off a single tree, which can change completely with a few rows.

## In the Panel
The **Stable Rules (SIRUS)** action fits `StableRulesClassifier` or `StableRulesRegressor` from SIRUS.jl on the same training data, through MLJ, with at most 10 rules (`max_rules`) and 10 quantile cuts per feature (`q`), and prints the rule list. It fits its own forest; it does not explain the model of the panel's other tabs.

## When to Use
- When the model must be **read in full** and checked by people, as in medicine or credit decisions.
- To see whether a few rules come close to the ensemble: compare their test metric with the ensemble's. If the loss is small, the rules may be the better model to report.

## See Also
- [Random Forests](random-forests.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
