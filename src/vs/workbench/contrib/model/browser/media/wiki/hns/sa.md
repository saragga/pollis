# Simulated Annealing

Simulated annealing takes single random steps and sometimes accepts a worse point. As a temperature falls, worse moves become rarer, and the search shifts from wandering to refining.

## The analogy with cooling metal

Slowly cooling a metal lets its atoms settle into a low-energy state, whereas fast cooling freezes in defects. [Scott Kirkpatrick, C. Daniel Gelatt and Mario P. Vecchi (1983)](#ref-KGV1983a) carried that picture to optimisation, treating the objective as energy and using a temperature to control acceptance.

A worse move with increase d is accepted with probability exp(−d / T). At high T nearly everything passes and the search crosses ridges freely. At low T almost nothing worse passes and the search behaves like a random descent. No gradient appears anywhere, so the objective may have kinks, jumps or other features that would stop a descent.

## The version used here

**SA** runs `SAMIN` from `Optim`, written for continuous variables inside box bounds ([Patrick Kofod Mogensen and Asbjørn Nilsen Riseth (2018)](#ref-MR2018a)). Continuous annealing needs a step size as well as a temperature, because the same step that works when the search is hot is far too long once it has settled.

Schemes in this family therefore adapt a step length for each variable, widening it when many moves are accepted and narrowing it when few are. [William L. Goffe, Gary D. Ferrier and John Rogers (1994)](#ref-GFR1994a) tested such an algorithm on statistical functions, including econometric estimation problems, which is the setting closest to awkward likelihoods.

## Cooling rate by hand

**Cooling Rate (rt)** multiplies the temperature at each reduction, so after k reductions T = T₀ × rt^k. To halve the temperature, k = ln 0.5 / ln rt: one reduction at 0.5, about 2 at 0.7, about 4 at 0.85, about 7 at 0.9 and about 14 at 0.95.

Cooling that is too fast freezes the search in the first decent valley it meets, while cooling that is too slow spends the budget hot, and the run may end before it has refined anything. **Parameter Sensitivity** tries 0.5, 0.7, 0.85, 0.9 and 0.95. Change the budget along with the rate, since a slower schedule needs more evaluations to reach the same final temperature.

## What the guarantee does not cover

Convergence to the global optimum in probability holds only for very slow cooling schedules, slower than any run can use. The geometric schedule here is much faster than that, so **Algorithm Properties** states the condition rather than claiming the result.

In practice annealing is a heuristic, and its quality comes from repeated runs and tuning. Run **Seed Robustness** before trusting one result, and treat a spread across seeds as a sign that cooling may be too quick for the budget. A low spread is good evidence of repeatability but does not change the status of the answer.

## Finishing the job

Without a local solver, **SA** ends near a minimum and not at it. **Local Polish** is therefore a natural last step when the surface is smooth around the answer, and a large `improvement` there is normal rather than a concern.

The search also spends many evaluations on rejected moves. It suits cheap objectives where thousands of evaluations cost little, and rugged surfaces where a descent cannot get a foothold. With a smooth objective, a descent-based tab usually gets further on the same budget, which **Compare vs CRS and SA** shows on your own function.

## References

<a id="ref-GFR1994a"></a>Goffe, W. L., Ferrier, G. D., & Rogers, J. (1994). Global Optimization of Statistical Functions with Simulated Annealing. *Journal of Econometrics* 60(1-2), 65-99. [doi:10.1016/0304-4076(94)90038-8](https://doi.org/10.1016/0304-4076(94)90038-8)

<a id="ref-KGV1983a"></a>Kirkpatrick, S., Gelatt, C. D., & Vecchi, M. P. (1983). Optimization by Simulated Annealing. *Science* 220(4598), 671-680. [doi:10.1126/science.220.4598.671](https://doi.org/10.1126/science.220.4598.671)

<a id="ref-MR2018a"></a>Mogensen, P. K., & Riseth, A. N. (2018). Optim: A Mathematical Optimization Package for Julia. *Journal of Open Source Software* 3(24), 615. [doi:10.21105/joss.00615](https://doi.org/10.21105/joss.00615)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CRS](crs.md) · [ILS](ils.md) · [LNS](lns.md) · [ALNS](alns.md) · [Basin-Hopping](bh.md)
