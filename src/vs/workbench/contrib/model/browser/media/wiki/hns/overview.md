# Neighbourhood Search

Neighbourhood search improves a solution by looking near it, then adds a way to leave a local optimum when the nearby points stop helping. The six methods here differ in what near means and in when a worse point may be kept.

## The trap every local search falls into

A descent method moves downhill until nothing nearby is lower. On a landscape with many valleys, it stops at the bottom of whichever valley it started in, and the quality of the result depends on the starting point rather than on the method.

Restarting from random points is the crude cure. Each restart forgets everything learned so far, and on a wide box most restarts land in poor valleys. Neighbourhood search keeps the good part of the current solution and changes only enough to reach a new valley. That one idea, a controlled move away from what already works, connects **ILS**, **LNS**, **ALNS** and **BH** directly, while **CRS** and **SA** pursue it without any descent step.

## Six ways of searching

**CRS** keeps a population and reflects simplices of its members, replacing the worst. **ILS** kicks the best point and descends, keeping only improvements. **LNS** re-samples some of the variables and repairs by descent, and **ALNS** learns how many to re-sample. **BH** kicks and descends like **ILS** but may accept a worse valley by a Metropolis rule. **SA** takes single random steps and accepts worse ones with a probability that falls as a temperature is lowered.

The first split to notice is whether a method calls a local solver. Those that do land exactly on local minima and spend many evaluations per move. Those that do not spend one evaluation per move but finish less precisely.

## The default test problem

The default objective is the two-variable Rastrigin function, 20 + x₁² + x₂² − 10(cos 2πx₁ + cos 2πx₂). Its global minimum is 0 at the origin, and local minima sit close to the integer grid points, 121 of them in the default box.

Rastrigin is a teaching case with two special features. Its minima form a regular funnel towards the origin, and its variables separate, so a good value of one coordinate stays good whatever the other does. Real objectives usually have neither property, and a method that does well here has passed only an easy test.

## What a run gives you

A run reports `best_point`, `best_value` and `evaluations`. Each method spends the same currency, a budget of objective evaluations, so results can be set side by side fairly on the same problem.

The actions then look at the run from several sides. **Objective Landscape** and **Convergence Curve** show where the search went and how fast it improved. **Return Status** and **Parameter Sensitivity** test the run and its main setting, **Local Polish** tightens the answer, and **Seed Robustness** asks whether a different random seed would have found the same thing.

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CRS](crs.md) · [ILS](ils.md) · [LNS](lns.md) · [ALNS](alns.md) · [Basin-Hopping](bh.md) · [Simulated Annealing](sa.md)
