# Decision Guide

Choices here are about which model form to use, and how much mechanism to include. Small counts, mixed time scales and available data do most to settle the matter.

## Which Form Fits the Problem

| Situation | Form | Why |
|---|---|---|
| Large numbers, smooth averages | Differential equations | Fast and simple to analyse |
| Small numbers, extinction possible | Gillespie jump process | Exact for the stochastic model |
| Large numbers, noise still of interest | Stochastic differential equations or tau-leaping | Cheaper than each event |
| Long-run balance only | Steady-state solve | No time simulation |
| Fast and slow reactions together | Stiff solver, or hybrid | Avoids tiny steps |

## When Chance Matters Enough to Simulate It

Use stochastic runs when a species can fall to low counts, and when extinction or a first event is the focus. A rule of thumb is to worry below some hundreds of copies. Use the equations when counts stay large, and only mean behaviour matters. [Gillespie (2007)](#ref-Gil2007a) reviews faster approximate methods such as tau-leaping, for cases in which exact simulation is too slow. If in doubt, run both, as **ODE vs Gillespie** does for SIR, and see whether the difference matters to the question.

## How Much Mechanism to Include

Start with the fewest reactions that can give the behaviour of interest. Add a species or reaction to answer a clear question. A rate law such as Michaelis-Menten or `hillr` shortens the list by hiding fast steps, which is fine if the time scales separate well, and misleading otherwise. Keep the elementary steps when the fast dynamics or the noise matter. Every added reaction needs a rate, and many rates will not be identifiable from data, so a large model may look precise without being so.

## When to Use Structural Analysis

Use **Stoichiometry Matrix** and **Conservation Laws** for any model, as a first check. Use deficiency when rates are unknown and a claim is needed for all values, which often holds for chemical systems early in modelling. Use sweeps and simulations when rates are known. Structural results need mass action for most of their force. Read [Feinberg (1987)](#ref-Fei1987a) for the exact hypotheses before citing the theorem for a network with other rate laws.

## Which Rates and Starts to Use

Measure rates where possible. Otherwise, fit them to time-series data, and report uncertainty. Set **T (time)** from the slowest rate, as several times its inverse is a reasonable minimum. Check units: k1 for a bimolecular reaction has different units from k2 for a unimolecular one, even in the same input box. Change one rate at a time, as **Rate Sweep** does, and look for sharp changes in behaviour. For a new network, replace the block inside `@reaction_network`, and adapt `ps` and `u0`.

## What to Report from a Network Model

Report the full list of reactions, rates with units and their sources, starting amounts and the time span. Say whether the form is deterministic or stochastic, with the solver, the tolerances and the number of runs. State any conservation laws, and which rate laws go beyond mass action. Give sensitivity to the main rates. Name assumptions on mixing. State clearly whether rates were fitted to data, or chosen for illustration, as in this panel, because that decides how far a conclusion can be taken.

## References

<a id="ref-Fei1987a"></a>Feinberg, M. (1987). Chemical reaction network structure and the stability of complex isothermal reactors, I: the deficiency zero and deficiency one theorems. *Chemical Engineering Science* 42(10), 2229–2268. [doi:10.1016/0009-2509(87)80099-4](https://doi.org/10.1016/0009-2509(87)80099-4)

<a id="ref-Gil2007a"></a>Gillespie, D. T. (2007). Stochastic simulation of chemical kinetics. *Annual Review of Physical Chemistry* 58(1), 35–55. [doi:10.1146/annurev.physchem.58.032806.104637](https://doi.org/10.1146/annurev.physchem.58.032806.104637)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Assumptions](assumptions.md)
