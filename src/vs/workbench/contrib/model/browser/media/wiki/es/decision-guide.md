# Decision Guide

Choose by constraints, the availability of a gradient, and the landscape, and then set the budget and population to match.

## Which Tab Fits the Problem

| Situation | Tab |
|---|---|
| Continuous black box, unknown shape | **CMA-ES** |
| Same setting, smooth | **xNES** |
| Plateaus or multimodal, **xNES** shrinks too early | **dxNES** |
| Many variables, cheap gradient | **GCMAES** |
| Nonlinear constraints | **ISRES** |
| Box only, quick first attempt | **ESCH** |

When no row stands out, begin with **CMA-ES**, which is the panel's default choice and needs the fewest decisions.

## When to Use Another Kind of Method

| Situation | Better choice |
|---|---|
| Few evaluations, each very costly | Bayesian optimisation |
| Smooth, gradient known, few minima | Local solvers from many starts |
| Very many variables | Gradient methods, or diagonal versions of an ES |
| Low dimension, need determinism | DIRECT-type methods |
| Discrete variables | Genetic algorithms, local search |
| Population with less parameter learning | Differential evolution |

**ES vs DE** gives a direct check against the last row.

## How to Set the Budget

A rough opening is a few thousand evaluations per variable on a smooth problem, and far more on a multimodal one. Increase **Budget** until **Budget Sensitivity** levels off, and spend the rest on repeated runs if the results vary. Compare alternatives at the same budget. On a costly objective, give it what is affordable, and then do a local polish. If nothing is being gained at the end of a run, repeated shorter runs may do more than one long run.

## How to Set the Population and Step Size

Start with the defaults. For a multimodal function, try doubling the population until results stop improving, as done automatically in restart schemes. For **Initial Step Size**, 0.3 covers the box and suits a global search. A small value such as 0.05 suits a local search around a known good point. A very small start can be slow, and a too-large one pushes points to the bounds, so match it to what you know about where the solution lies.

## How to Combine Global and Local Steps

A population method finds a basin, and a local method then finishes the job cheaply. After any tab, start a bound-constrained local solver from `x_best`, and record the improvement. For repeated use, restarts with a growing population spread the budget better than one long run. Be careful about comparing a polished value with an unpolished one. The combination works best when the objective is smooth near the optimum.

## What to Report from a Stochastic Search

Report the objective, box, method and package version, with every setting that differs from the defaults. State the budget, the number of seeds, the mean, and the worst and best values. Give a measure of success such as `share_at_best`, and how the result held under another budget and another box. Describe how a polish was done, if used. Only claim the global minimum when it is known from elsewhere, and keep the seeds so that others can repeat the runs.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [CMA-ES](cmaes.md) · [ISRES](isres.md)
