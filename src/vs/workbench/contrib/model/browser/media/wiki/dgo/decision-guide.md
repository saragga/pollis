# Decision Guide

Choose among these methods by dimension, smoothness and evaluation cost. Then decide how to divide a limited budget between global search and local refinement.

## Which Tab Fits the Problem

| Situation | Tab | Why |
|---|---|---|
| Black box, up to about 10 variables, no prior view | **DIRECT** | Balanced search, no settings |
| Few local minima, costly evaluations | **DIRECT-L** | Fewer splits per round |
| Smooth objective | **QuadDirect** | Uses curvature |
| Up to about 5 variables, Lipschitz | **AGS** | One-dimensional theory, sound in low dimensions |

## When to Use Another Kind of Method

| Situation | Better choice |
|---|---|
| Very costly evaluations, few of them | Bayesian optimisation |
| Gradients available and few minima | Local solvers from many starts |
| Many variables | Population methods, or a local method |
| Certified bound needed | Branch-and-bound on a known form |
| Noisy objective | A method for noise |

[Jones, Schonlau and Welch (1998)](#ref-JSW1998a) developed the response-surface route for costly evaluations. The panel's methods sit in the middle: they suit moderately cheap functions in a few variables.

## How to Set the Budget

Start with **Max Evaluations** at a few hundred per variable, and raise it until **Budget Study** flattens. Budgets needed grow steeply with dimension. If evaluations are cheap, spend them freely, as no stopping test is present. If they are expensive, use **DIRECT-L** with a modest budget, and then polish. Keep some budget back for polishing, since it often gains much for little. Note that a larger budget does not add a stopping test, so decide on the target before running.

## How to Combine Global and Local Steps

A common pattern is to run a global method to locate the basin, and then to run a local method to reach full precision, as **Local Refinement** does. To go further, polish from several entries of **Candidate Minima**. For smooth functions, a gradient-based local method is faster if gradients exist. Because local methods need very few evaluations once in the right basin, they make up for the slow end of DIRECT, and the combination usually beats either part alone.

## How to Set the Box

Make the box as tight as is honest. Narrowing it by half in each variable saves far more than doubling the budget does. Use knowledge about the problem to rule out regions. Check **Boundary Check** afterwards: if a coordinate lies on a bound, widen the box, unless that bound is a real limit. **Box Perturbation Study** tests how much a chosen box matters. Rescale variables, if ranges differ greatly, and make use of the rescaling built into DIRECT.

## What to Report from a Global Search

Report the objective, the box, the method and its implementation, and the budget. Give the best value and point, with any polish stated separately, and the budget at which it was first reached. Say how the result changed under other boxes and budgets. Report any other basins found. Do not call a value the global minimum, unless it is known from elsewhere. Use **Summary** as a record of the run, and include the version of the package, as implementations of DIRECT differ in details.

## References

<a id="ref-JSW1998a"></a>Jones, D. R., Schonlau, M. and Welch, W. J. (1998). Efficient global optimization of expensive black-box functions. *Journal of Global Optimization* 13(4), 455–492. [doi:10.1023/A:1008306431147](https://doi.org/10.1023/A:1008306431147)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [DIRECT & DIRECT-L](direct.md) · [AGS](ags.md)
