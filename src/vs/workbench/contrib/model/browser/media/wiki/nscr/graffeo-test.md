# Graffeo's Test

**Graffeo's test** (Graffeo, Castell, Belot and Giorgi, 2016) compares net survival between groups. It is built like the log-rank test, but on the Pohar-Perme weighted excess deaths: at each time it compares the excess deaths observed in each group with those expected if all groups shared one net survival.

## Why Not the Ordinary Log-Rank Test
The ordinary log-rank test compares overall survival, which includes deaths from other causes. Two groups with the same disease but different ages or sexes differ in overall survival for reasons that have nothing to do with the disease. Graffeo's test removes the population mortality first, so it tests the disease alone, and its Pohar-Perme weights keep it valid when the excess hazard depends on age.

## Reading the Result
- The statistic follows a **chi-squared** distribution with the number of groups minus one degrees of freedom.
- A **small p-value** means net survival differs between at least two groups. It does not say which, by how much, or when: look at the curves of each group and the milestone estimates.
- Like the log-rank test, it has most power when one group is worse **throughout**; when curves cross, it can miss a real difference.

## In the Panel
- The Log-Rank Test tab compares the groups of the **Group Variable** and prints the statistic, the degrees of freedom and the p-value, and fits a Pohar-Perme curve for each group.
- **Log-Rank Test for Each Covariate** runs the test on every column with 2 to 10 distinct values and ranks them by p-value. With many columns, some will be small by chance: treat it as a screen.
- `GraffeoTest` also takes **strata**, groups within which the comparison is made, such as age bands. The panel passes a single stratum; replace `ones(Int, length(T))` with stratum codes to stratify.

## See Also
- [Net Survival Estimators](estimators.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
