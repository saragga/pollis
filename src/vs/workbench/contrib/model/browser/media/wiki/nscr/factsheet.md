# Net Survival & Competing Risks — Factsheet

**Relative survival methods** split the mortality of a group of patients into the part the general population would have anyway, taken from a population rate table, and the **excess** due to the disease. From that split come **net survival**, the survival if the disease were the only cause of death, and **crude mortality**, the real-world probabilities of dying from the disease and from other causes. They need no cause of death, which is why cancer registries use them.

| | |
|---|---|
| **Purpose** | Measure the mortality due to a disease in a cohort, without cause-of-death data |
| **Input** | One row per patient: follow-up time and vital status, age at diagnosis and date of diagnosis (in days), and the covariates of the rate table, such as sex; plus a population rate table |
| **Core packages** | [NetSurvival.jl](https://github.com/JuliaSurv/NetSurvival.jl), [RateTables.jl](https://github.com/JuliaSurv/RateTables.jl) |
| **Methods** | Crude Mortality (Cronin-Feuer), Net Survival (Pohar-Perme, Ederer I, Ederer II, Hakulinen), Graffeo's log-rank test |
| **Output** | Curves over time since diagnosis, estimates at milestones with 95% intervals, test statistics and p-values |
| **Key choices** | The rate table, and the estimator |

## When to Use

- **Cancer registry survival**: how a disease affects survival in a population, compared across countries, regions or periods, where background mortality differs.
- **Unreliable causes of death**: death certificates misattribute causes, especially in the old and long after diagnosis.
- **Patient information**: the chance of dying from the disease, or from something else, over the coming years.

## What It Is Not

Net survival is not the survival anyone observes: patients also die of other causes. These methods are not for clinical trials, where comparison with a control arm answers the question directly. They depend on the rate table: when patients differ from the general population for reasons other than the disease (smoking, deprivation, screening), the excess hazard absorbs the difference. With reliable causes of death, cause-specific methods such as the Aalen-Johansen estimator of the Survival Analysis panel are an alternative.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
