# Controlled Random Search

Controlled random search keeps a population of points and generates each trial by reflecting a random simplex of them. Worse members are replaced one at a time, so the population gradually gathers around good regions.

## Reflecting a random simplex

The population starts with points drawn across the box. Each step picks n + 1 members, where n is the number of variables, and reflects one through the centroid of the others: trial = 2 × centroid − last point. If the trial lies inside the box and beats the worst member, it replaces that member.

W. L. Price proposed this scheme, and the variant known as CRS2 always puts the current best point in the simplex, which pulls the search more strongly towards good regions ([Price (1983)](#ref-Pri1983a)). The step length needs no tuning. While points are spread out, reflections are long, and they shorten by themselves as the population contracts, so the search moves from exploring to refining without a schedule.

## Local mutation in the panel's variant

The code selects `:GN_CRS2_LM` in `NLopt`, which is CRS2 with local mutation. Reflection alone rejects many trial points near the end of a run. Local mutation adds a second way of producing a trial, drawn close to the best point, when a reflection fails to help ([Kaelo and Ali (2006)](#ref-KA2006a)).

The effect is a stronger refining phase that saves evaluations once the population has gathered. The price is a greater pull towards the current best, so diversity can run out sooner on a landscape with several good valleys.

## Choosing the population

**Population** 0 takes the `NLopt` default of 10(n + 1): 30 points for two variables and 110 for ten. **Parameter Sensitivity** tries 0, 20, 50, 100 and 200.

The trade-off is simple. Each initial point costs one evaluation, so a population of 200 spends 4% of a 5000 budget before the first reflection, and a large population also contracts slowly. A small population converges fast but can collapse into the wrong valley, and it cannot recover afterwards, since a simplex built from clustered points only makes short moves within the cluster. Raise the population when seeds disagree.

## Strengths and limits

**CRS** uses no gradients and assumes little beyond a box, so kinks and steps in the objective do it no harm. Each move costs one evaluation, which makes the budget go far in low dimensions.

Its limits grow with the dimension. The default population rises linearly with n, while the volume to cover rises exponentially, so reliability falls off as variables are added. Final precision is modest, since the search stops on budget and not on a tolerance, so apply **Local Polish** when the surface is smooth near the best point. In **Return Status**, a code reporting the evaluation limit is the expected ending.

## References

<a id="ref-KA2006a"></a>Kaelo, P., & Ali, M. M. (2006). Some Variants of the Controlled Random Search Algorithm for Global Optimization. *Journal of Optimization Theory and Applications* 130(2), 253-264. [doi:10.1007/s10957-006-9101-0](https://doi.org/10.1007/s10957-006-9101-0)

<a id="ref-Pri1983a"></a>Price, W. L. (1983). Global Optimization by Controlled Random Search. *Journal of Optimization Theory and Applications* 40(3), 333-348. [doi:10.1007/BF00933504](https://doi.org/10.1007/BF00933504)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [ILS](ils.md) · [LNS](lns.md) · [ALNS](alns.md) · [Basin-Hopping](bh.md) · [Simulated Annealing](sa.md)
