# Interpretation

Each tab's plot shows amounts over time, in units set by the parameters. Reading results means naming the type of long-run behaviour, and asking which part of it comes from structure and which from rates.

## How to Read the Long-Run Behaviour

| Pattern | Name | Example |
|---|---|---|
| Single curve to a fixed end | Depletion | **Chemical**, **Epidemic** |
| Sustained swings of fixed size | Limit cycle | **Genetic** |
| Sustained swings whose size depends on the start | Neutral cycle | **Ecological** |
| Steady rise or fall with no end in span | Span too short | Any |

Extending **T (time)** separates the last row from the others. Long-run type can depend on rates, as in the **Genetic** tab with a small v/d.

## How to Read Phase Portraits

**Phase Portrait** plots the first two species against each other, with a marker at the start. A closed loop means a cycle, and a curve that ends means a steady state. A projection from more species, as in **Genetic**, can show lines that cross, which would not happen in the full space. An inward spiral means damping. Whether the first two species are the most informative depends on the network, as with S and E in **Chemical**.

## What a Conservation Law Tells You

Each row from **Conservation Laws** gives a weighted total that never changes. Such totals reduce the number of independent equations, and they show that some outcomes are impossible, as a species can never exceed its total. They also explain a dependence on starting amounts, since the totals set the compatibility class within which the system moves. Long-run results are then conditional on those totals. Saying "the steady state" is therefore loose, unless the class has been stated.

## How to Read the Structural Summary

**Network Summary** lists species, reactions, complexes, linkage classes, deficiency and weak reversibility. A complex is a left or right side of a reaction, and a linkage class is a connected group of complexes. Results from [Feinberg (1987)](#ref-Fei1987a) make deficiency useful, since a structural count can rule out oscillation for any rate values under mass action. A theorem that does not apply says nothing either way, and it is no evidence of complex behaviour. See [Diagnostics](diagnostics.md) on the message printed.

## How to Compare Across Domains

**Cross-Domain Comparison** prints maximum minus minimum of X in Lotka-Volterra, and of Px in the repressilator. The two have different units, and only the same notation unites them. With the default **u0 (initial amount)**, Px starts far above its oscillating range, so that the amplitude mostly reflects the initial decay. Remove a transient first, for a true amplitude of the cycle. The more meaningful comparison is qualitative: the first cycle is neutral, the second is a limit cycle.

## How to Read Stochastic Results

A stochastic run shows one possible history, and an ensemble shows the spread. Early extinction is a real outcome of a stochastic epidemic, which the deterministic curve cannot show, and a mean over runs mixes it with major outbreaks. Report the share of each kind. For large numbers, the stochastic runs follow the deterministic path, as [Gillespie (2007)](#ref-Gil2007a) explains, so a difference between them signals small-number effects. Any such figures describe the model and its rates, and do not describe a real system.

## References

<a id="ref-Fei1987a"></a>Feinberg, M. (1987). Chemical reaction network structure and the stability of complex isothermal reactors, I: the deficiency zero and deficiency one theorems. *Chemical Engineering Science* 42(10), 2229–2268. [doi:10.1016/0009-2509(87)80099-4](https://doi.org/10.1016/0009-2509(87)80099-4)

<a id="ref-Gil2007a"></a>Gillespie, D. T. (2007). Stochastic simulation of chemical kinetics. *Annual Review of Physical Chemistry* 58(1), 35–55. [doi:10.1146/annurev.physchem.58.032806.104637](https://doi.org/10.1146/annurev.physchem.58.032806.104637)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
