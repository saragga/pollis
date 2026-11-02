# Basin-Hopping

Basin-hopping makes a random walk over local minima, in which every proposed point is first brought to the bottom of its valley. Worse valleys can be accepted, so the walk can cross a higher minimum to reach a lower one.

## A staircase in place of a landscape

The method was introduced for finding the lowest-energy structures of Lennard-Jones atomic clusters, with their enormous numbers of minima ([David J. Wales and Jonathan P. K. Doye (1997)](#ref-WD1997a)). Replacing each point's value by the value of the minimum it descends to turns the surface into a staircase of flat steps, and the barriers between neighbouring valleys disappear from view.

That transformation is why the method is so natural on funnel-shaped landscapes. A walk that moves between adjacent steps gets to the bottom of the funnel, however high the original ridges between the valleys are.

## The acceptance rule

A hop adds a Gaussian kick to the current minimum and descends. The new minimum is accepted if it is lower, and otherwise with probability exp(−(f_new − f_current) / T). The rule is the one [Nicholas Metropolis, Arianna W. Rosenbluth, Marshall N. Rosenbluth, Augusta H. Teller and Edward Teller (1953)](#ref-MRRTT1953a) used for sampling physical states.

The code tracks the current minimum separately from the best one, so a walk that drifts upwards never loses its best value. At **Temperature** 1.0, a minimum worse by 1 is accepted with probability exp(−1) ≈ 0.37, and one worse by 3 with exp(−3) ≈ 0.05.

## Setting the temperature

The rule compares minima after descent, so the useful scale is the typical gap in value between neighbouring minima, not the height of the ridges between them. On Rastrigin those two differ by a factor of about 20: moving from the origin to the next minimum raises the value by about 1, while the ridge in between stands at about 20. A temperature of 1 suits the gaps.

**Parameter Sensitivity** tries 0, 0.3, 1, 3 and 10. At 0 the code accepts only improvements, which makes the method **ILS**, so that grid point serves as a direct test of whether accepting worse moves helps. At 10 almost every move is accepted, and the walk wanders.

## Reading hops_accepted

**Algorithm Properties** reports `hops_accepted`. A count near zero means a walk that rarely moves, so the temperature is low or the kick lands in valleys that are much worse. A count close to the number of hops means a walk with no pressure downhill, and the best point then owes more to chance than to the rule.

The count is not given as a rate, since the number of hops depends on the evaluations each descent used. Estimate it by dividing `evaluations` by the rough cost of a descent, or compare the counts as temperature changes, which is usually enough.

## The kick and the budget

**Perturbation Scale** works as it does in **ILS**, and the same advice about one valley's width applies. The sensitivity grid does not vary it on this tab, so try other values by hand with **Temperature** held fixed.

Each hop costs a full descent, and a walk that accepts worse minima spends a share of its hops above the best value. **BH** therefore needs a larger budget than a greedy method needs to reach the same depth on an easy problem, and it repays that on landscapes where greedy methods stall. If both reach the same value across seeds, the simpler **ILS** is enough.

## References

<a id="ref-MRRTT1953a"></a>Metropolis, N., Rosenbluth, A. W., Rosenbluth, M. N., Teller, A. H., & Teller, E. (1953). Equation of State Calculations by Fast Computing Machines. *The Journal of Chemical Physics* 21(6), 1087-1092. [doi:10.1063/1.1699114](https://doi.org/10.1063/1.1699114)

<a id="ref-WD1997a"></a>Wales, D. J., & Doye, J. P. K. (1997). Global Optimization by Basin-Hopping and the Lowest Energy Structures of Lennard-Jones Clusters Containing up to 110 Atoms. *Journal of Physical Chemistry A* 101(28), 5111-5116. [doi:10.1021/jp970984n](https://doi.org/10.1021/jp970984n)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CRS](crs.md) · [ILS](ils.md) · [LNS](lns.md) · [ALNS](alns.md) · [Simulated Annealing](sa.md)
