# Overview

This webview analyses the survival of patients with a disease, usually a cancer, from a population-based registry, **without knowing the cause of death**. Registries record who died and when, but causes of death are often missing or unreliable. Instead, each patient's risk of dying from other causes is taken from a **population rate table**: the mortality of the general population of the same age, sex and calendar year. What the patients die of beyond that is the **excess hazard**, attributed to the disease.

    observed hazard = expected (population) hazard + excess hazard

## Crude Mortality
The **real-world** view, a competing-risks analysis: of all patients, how many have died by time t from the disease, and how many from other causes. The two add up to all deaths. Cronin and Feuer's method, from NetSurvival.jl.

## Net Survival
The **hypothetical** view: the survival patients would have if the disease were the only possible cause of death. It does not depend on the background mortality of the population, so it compares registries, countries and periods. The Pohar-Perme estimator, or the older Ederer I, Ederer II and Hakulinen, from NetSurvival.jl.

## Log-Rank Test
**Graffeo's test**: do groups (sex, stage, tumour site) differ in net survival? A log-rank-type test built on the Pohar-Perme weights.

## Common Workflow

1. Run the **Cohort Summary**: enough deaths and follow-up, and ages and years that the rate table covers.
2. Estimate **Net Survival** with Pohar-Perme, and check **Negative Excess Hazard** for a mismatched rate table.
3. Compare groups with the **Log-Rank Test**, or screen every candidate with **Log-Rank Test for Each Covariate**.
4. For what patients actually face, switch to **Crude Mortality**: the probability of dying from the disease, and from other causes.
5. Report **Milestone Estimates** at 1, 5 and 10 years.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Rate Tables](rate-tables.md)
