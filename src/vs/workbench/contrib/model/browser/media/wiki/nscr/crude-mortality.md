# Crude Mortality

**Crude probabilities of death** (Cronin and Feuer, 2000) answer the real-world question: of the patients diagnosed, what share have died by time t from the disease, and what share from other causes? It is a **competing-risks** analysis: a patient who dies of another cause can no longer die of the disease.

## How It Is Computed
From the estimator chosen in the panel, the observed survival S(t) and the two hazard increments at each time step:

- **From the disease**: the sum, over time steps, of the survival so far times the excess hazard of the step.
- **From other causes**: the same with the expected (population) hazard.
- **All causes**: their sum, which equals one minus the observed survival.

No cause of death is needed: the population rate table supplies the other-cause share. With **Ederer II** these are the classical Cronin-Feuer probabilities; with **Pohar-Perme** they rest on the consistent excess hazard.

## Crude Mortality and Net Survival

| | Net survival | Crude mortality |
|---|---|---|
| World | Hypothetical: the disease is the only cause | Real: all causes compete |
| Depends on the background mortality | No | Yes |
| Use | Comparing populations, periods, treatments | Informing patients, planning care |

For a young patient the two views are close; for an old one, the crude probability of dying from the disease is much lower than one minus net survival, because other causes come first.

## In the Panel
The Crude Mortality tab prints the three probabilities at 5 years. **Curves** plots them over time, **Milestone Estimates** gives them at 1, 3, 5 and 10 years, and **Deaths Attributable to the Disease** divides the disease deaths by all deaths.

## See Also
- [Net Survival Estimators](estimators.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
