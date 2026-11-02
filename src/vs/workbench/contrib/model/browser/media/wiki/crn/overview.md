# Overview

Reactions, gene regulation, predation and infection can all be written as lists of interactions between species. The panel states four such systems in one notation, and analyses them with one set of tools.

## What a Reaction Network Is

A network lists species and the reactions that convert them. Each reaction has a rate and a change in counts. Prey being eaten and a molecule binding look the same in that notation:

- k1, S + E --> SE
- b, X + Y --> 2Y

The list fixes the equations, so that the modeller states the mechanism, and the software derives the mathematics. `Catalyst.jl`, from [Loman, Ma, Ilin, Gowda, Korsbo, Yewale, Rackauckas and Isaacson (2023)](#ref-LMIGK...2023a), reads such a list from `@reaction_network`.

## What One Network Can Produce

One list yields several kinds of model:

| Form | Species are | Used when |
|---|---|---|
| Differential equations | Continuous amounts | Large numbers |
| Stochastic jump process | Whole counts | Small numbers, chance matters |
| Algebraic steady-state system | Unknowns | Long-run balance |

With mass action, each rate is the rate constant times the amounts of the reactants. **Stochastic Simulation** and **ODE vs Gillespie** use the jump form, and **Steady States** uses the algebraic form.

## How the Four Tabs Compare

| Tab | System | Typical behaviour |
|---|---|---|
| **Chemical** | Michaelis-Menten enzyme kinetics | Runs to completion |
| **Genetic** | Repressilator | Sustained oscillation |
| **Ecological** | Lotka-Volterra | Neutral cycles |
| **Epidemic** | SIR | A single outbreak |

The four show that one notation can hold very different dynamics. **k1 (forward rate)**, **k2 (reverse/decay rate)** and **u0 (initial amount)** take on a different meaning in each.

## What Structure Can Say Without Simulation

Some properties come from the list of reactions alone, whatever the rates. **Stoichiometry Matrix** shows how each reaction changes each species. **Conservation Laws** finds totals that never change. **Network Summary** reports deficiency, which can rule out oscillations for mass-action networks. That structural reasoning is the main thing gained from the notation, and it needs no parameter values at all.

## A Common Workflow for a New Network

1. Write the reactions, and read **Stoichiometry Matrix** to confirm them.
2. Run the tab, then use **Species Trajectories** and **Phase Portrait**.
3. Use **Network Summary** to see what structure guarantees.
4. Use **Stochastic Simulation** if counts are small.
5. Use **Rate Sweep** to see how a parameter changes results.

Most actions follow the selected tab, and some are fixed to one example.

## References

<a id="ref-LMIGK...2023a"></a>Loman, T. E., Ma, Y., Ilin, V., Gowda, S., Korsbo, N., Yewale, N., Rackauckas, C. and Isaacson, S. A. (2023). Catalyst: fast and flexible modeling of reaction networks. *PLOS Computational Biology* 19(10), e1011530. [doi:10.1371/journal.pcbi.1011530](https://doi.org/10.1371/journal.pcbi.1011530)

## See Also

- [Factsheet](factsheet.md) · [Chemical](chemical.md) · [Genetic](genetic.md) · [Ecological](ecological.md) · [Epidemic](epidemic.md)
