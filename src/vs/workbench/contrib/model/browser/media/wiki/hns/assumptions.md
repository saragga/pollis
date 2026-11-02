# Neighbourhood Search Assumptions

Neighbourhood search asks little of the objective, which is its appeal, but it still rests on a few conditions about the box, the smoothness and the cost of evaluating. When one fails, the result can look fine and be poor.

## A box that contains the answer

Every method searches inside **Lower Bounds** and **Upper Bounds**. Nothing outside the box can be found, so a best point pressed against an edge suggests that the box is too small rather than that the edge is special.

The box also sets the scale of the moves. **Perturbation Scale** is a fraction of box width, and **LNS** and **ALNS** draw new values uniformly across the box, so a box ten times too wide makes every move ten times too coarse. Variables on very different scales each get their own width, which helps, but the search still works in a rectangle. Other constraints have to enter through a penalty in the objective.

## Enough smoothness for a descent

**ILS**, **LNS**, **ALNS** and **BH** repair with bounded L-BFGS and finite-difference gradients. Those steps assume the objective is smooth around the minimum. Kinks, steps and noise can send a finite difference astray, so the descent stops early at a point that is not a minimum at all.

**CRS** and **SA** compare only objective values, so they tolerate such functions better. A noisy objective is still hard for all six, because a lucky low reading can be taken as the best point and is never re-evaluated.

## A budget that counts everything

**Budget** counts every evaluation, including those spent on gradients. In the descent-based tabs a gradient costs several evaluations that grow with the dimension, so a budget that looks generous may fund few moves in a wide problem.

Those four tabs also test the budget only before a descent starts. A descent begun just under the limit runs to its end, so `evaluations` can land above **Budget**. Treat it as a target rather than a hard ceiling when evaluations are expensive.

## No promise of the global optimum

None of these runs can prove that the best point is the global minimum. A finite budget sees a finite number of points, and any objective could hide a narrow minimum between them.

The theoretical guarantee quoted for **SA**, global convergence with infinitely slow cooling, says nothing about a run with a real budget and geometric cooling. What a run supplies is the best point it evaluated, and repeated runs give evidence about reliability, never a certificate. For a convex objective a single local descent would be cheaper and exact.

## Evaluations cheap enough to repeat

Thousands of evaluations are normal here, and **Parameter Sensitivity**, **Compare vs CRS and SA** and **Seed Robustness** each repeat the whole search. An objective that takes seconds per call makes the action set slow, and a modelling method built for few evaluations, such as Bayesian optimisation, then fits better.

The dimension matters in the same way. A fixed budget covers a two-variable box densely but a twenty-variable box only thinly, so expect reliability to fall as variables are added, unless the problem has structure the moves can exploit.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CRS](crs.md) · [ILS](ils.md) · [LNS](lns.md) · [ALNS](alns.md) · [Basin-Hopping](bh.md) · [Simulated Annealing](sa.md)
