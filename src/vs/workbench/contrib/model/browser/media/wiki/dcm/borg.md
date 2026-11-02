# Borg MOEA

Borg is a many-objective framework built around an epsilon-box archive, with adaptive operators and restarts. The panel's **Epsilon-Dominance Archive** tab implements only the archive idea, on top of NSGA-II.

## What Epsilon-Dominance Means

Divide objective space into boxes of size eps in each objective. A solution's box is floor((f − lo) / eps). One box dominates another if it is no worse in all objectives and differs in at least one. Archive rules then give at most one solution per box. [Laumanns, Thiele, Deb and Zitzler (2002)](#ref-LTDZ2002a) showed that this combines convergence with diversity, and gives a bounded archive with stated guarantees. A set size no longer depends on the population, since **Epsilon** sets the resolution.

## How the Tab Builds Its Archive

The code runs `NSGA2`, then calls `nondominated(r)`:

1. Collect every feasible solution from every generation.
2. Take the lowest objective values as the origin.
3. Skip a solution if an archived box dominates its box.
4. Inside a box, keep the solution closest to the box corner.
5. Otherwise add the box, and remove any boxes that it dominates.

The archive is built after the run, and it does not steer the search, unlike an archive inside the algorithm. It needs `store_convergence=true`, which uses more memory on long runs.

## What the Full Borg Algorithm Adds

[Hadka and Reed (2013)](#ref-HR2013a) add three parts around the archive:

| Part | Purpose |
|---|---|
| Epsilon-progress | Detects a stall, as no new box has been filled |
| Restarts with resized population | Injects diversity after a stall, using archive members |
| Adaptive operator choice | Favours the recombination operators that feed the archive |

A steady-state design updates the archive at each evaluation. None of those parts is in the tab, so it shows how the archive behaves, and it does not represent the performance of Borg. Published claims about Borg do not transfer to this simpler setup.

## How to Choose Epsilon

Set each eps to the smallest difference that a decision maker would care about, in that objective's units. A large eps gives few solutions and a coarse picture, while a small eps gives many solutions and a finer one. Set it per objective, as ranges differ: the default CONSTR has f2 varying over a much wider range than f1, so the default **Epsilon** is 10 times greater for f2. The front's size is then roughly the range divided by eps along the longest objective, for two objectives.

## What the Archive Guarantees and Does Not

The archive holds only mutually non-dominated boxes, and its size is bounded by the number of boxes along the front. Because each box holds one, a real difference smaller than eps can be lost. The rule of keeping the solution closest to the corner favours good values within each box. It cannot add quality that the search did not find: a run of NSGA-II that missed part of the front leaves a gap in the archive. [Deb, Mohan and Mishra (2005)](#ref-DMM2005a) evaluated an algorithm that uses the archive during the search, and that is a different method.

## Where the Archive Is Strong and Weak

A bounded, evenly spaced set is easy to present and to choose from, and its density matches what the user asked for. Its hypervolume, however, may be lower than that of a larger set, since the set is deliberately thin. So comparing `hypervolume` with **MOEA/D** at unlike sizes must be done with care. Very small eps leaves a large set, and the archive step becomes slower. Boxes near the extremes can be lost, so that the true end of the front may be missed by up to one box.

## References

<a id="ref-DMM2005a"></a>Deb, K., Mohan, M. and Mishra, S. (2005). Evaluating the ε-domination based multi-objective evolutionary algorithm for a quick computation of Pareto-optimal solutions. *Evolutionary Computation* 13(4), 501–525. [doi:10.1162/106365605774666895](https://doi.org/10.1162/106365605774666895)

<a id="ref-HR2013a"></a>Hadka, D. and Reed, P. (2013). Borg: an auto-adaptive many-objective evolutionary computing framework. *Evolutionary Computation* 21(2), 231–259. [doi:10.1162/EVCO_a_00075](https://doi.org/10.1162/EVCO_a_00075)

<a id="ref-LTDZ2002a"></a>Laumanns, M., Thiele, L., Deb, K. and Zitzler, E. (2002). Combining convergence and diversity in evolutionary multiobjective optimization. *Evolutionary Computation* 10(3), 263–282. [doi:10.1162/106365602760234108](https://doi.org/10.1162/106365602760234108)

## See Also

- [Factsheet](factsheet.md) · [MOEA/D](moead.md) · [CCMO](ccmo.md) · [Interpretation](interpretation.md)
