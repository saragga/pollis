# Assumptions

An agent-based model assumes its rules, its scheduling and its starting state, and each of them can change the result. The panel's three models are stylised, so their assumptions are stronger than those of a model fitted to a real system.

## Why the Rules of an Agent-Based Model Are Assumptions

Each rule is a claim about behaviour, and no input tests it. Residents with one threshold, particles that only align, and people with one infection probability are choices made for clarity. A pattern that the rules generate shows that they are sufficient, while other rules might generate the same pattern. [Wilensky and Rand (2015)](#ref-WR2015b) separate verification, which asks whether the code does what the rules say, from validation, which asks whether the rules match the real system. The panel supports the first through its checks, and has no data to support the second.

## How Update Order Affects an Agent-Based Model

`Schedulers.Randomly()` lets every agent act once per step in a fresh random order, and each agent sees what earlier agents just did. Sequential updating is an assumption and not a detail. A simultaneous update, where all agents read the old state, can give different dynamics, and the original flocking model works that way. **Graph Space** comes partway by making newly infected people wait for the next step. To test the assumption, change the scheduler or keep a copy of the old state in the step function, and compare the outcome.

## Why Space and Boundaries Matter in an Agent-Based Model

The space decides who can affect whom. **Grid Space** has hard edges, so residents near them have fewer neighbours. **Continuous Space** wraps around, so there is no edge but flocks can meet themselves through it. **Graph Space** fixes contacts for the whole run. Small spaces make these choices matter more. A result that holds only at one **Grid Side** or **Box Side (L)** is likely to be a finite-size effect, and repeating a run at a larger size at constant density is the direct test.

## Why Agents in the Panel Are Identical

Within each tab every agent uses the same parameters, whether **Threshold**, **Noise** or **Infection Probability (beta)**. Heterogeneity is often what makes aggregate behaviour interesting, and a population mean can hide it. Agents also do not learn, plan or remember. [Miller and Page (2007)](#ref-MP2007a) discuss how adaptation and diversity change the behaviour of such systems. Adding a field to the agent struct and using it in the step function is the way to relax this, for instance by drawing a threshold for each resident.

## Which Starting Assumptions the Agent-Based Models Panel Makes

All tabs start from a random state: a random layout of residents, random positions and headings, a random network and random first cases. Results therefore describe behaviour from disorder, and not from a state resembling a real system. Some outcomes depend on the start, and the **Scenario** of **Grid Space** shows one such case, where a sorted map stays sorted under a rule that would never have sorted it. Long-run results are valid only for the start used, unless replicates and other starts agree.

## References

<a id="ref-MP2007a"></a>Miller, J. H. and Page, S. E. (2007). *Complex Adaptive Systems: An Introduction to Computational Models of Social Life*. Princeton University Press.

<a id="ref-WR2015b"></a>Wilensky, U. and Rand, W. (2015). *An Introduction to Agent-Based Modeling: Modeling Natural, Social, and Engineered Complex Systems*. MIT Press.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
