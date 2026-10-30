# Decision Guide

| Question | Method | Why |
|---|---|---|
| How deadly is the disease, compared across countries, periods or groups? | **Net Survival**, Pohar-Perme ([Estimators](estimators.md)) | Removes the background mortality, which differs between groups |
| What are a patient's chances of dying from the disease, and from other causes? | **Crude Mortality** ([Crude Mortality](crude-mortality.md)) | Real-world probabilities, both causes competing |
| Do groups differ in net survival? | **Log-Rank Test** ([Graffeo's Test](graffeo-test.md)) | A test made for net survival |
| Which covariates matter? | **Log-Rank Test for Each Covariate** | Screens every column with 2 to 10 values |
| How much of the mortality does the disease explain? | **Deaths Attributable to the Disease** | Disease deaths as a share of all deaths |
| Causes of death recorded and reliable? | Aalen-Johansen, in the Survival Analysis panel | Cause-specific cumulative incidence, no rate table needed |

## Decision Flow

1. **Are causes of death reliable?** If yes, cause-specific methods are simpler. If not, use the Net Survival & Competing Risks panel.
2. **Is there a rate table** for the patients' country and period, with their sex? If not, these methods cannot be used.
3. **Comparing populations or periods?** Use net survival, with Pohar-Perme.
4. **Informing patients or planning care?** Use crude mortality.
5. **Comparing groups?** Use Graffeo's test, and show the net survival curves per group.

## Rules of Thumb
- **Use Pohar-Perme** for net survival; report an older estimator only to compare with published figures.
- **Do not report net survival beyond the follow-up**, and be wary of the last years, where few patients remain and the Pohar-Perme weights are large.
- **Age-standardise** before comparing groups with different age structures.
- **Report the rate table** with every result.

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md)
