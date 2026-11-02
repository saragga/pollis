# Assumptions

Genetic algorithms need no gradients or convexity. They do rely on some structure in the problem, on an encoding that respects it, and on settings that fit the budget.

## What Recombination Assumes

Crossover helps only if parts of good solutions tend to be good elsewhere. Rastrigin is separable, so that coordinates can be improved independently and then combined: an ideal case. If variables interact strongly, a child's mix of two good parents may be poor. Then crossover acts as a large random mutation. [Whitley (1994)](#ref-Whi1994a) discusses how results depend on how an encoding groups related genes. Knowing how the variables interact should guide the choice of operator and encoding.

## What the Encoding Assumes

Encoding sets what is easy to reach. Fixed-point bits assume a resolution, and they suffer at Hamming cliffs. Floating-point bits give steps whose size depends on the exponent. Real coding assumes that a straight line between parents makes sense. Random keys assume that the decoder maps small changes to small effects. A poor encoding can defeat any search. For categorical or permutation problems, real coding has no natural meaning, and random keys fit better.

## What the Box Assumes

Finite bounds are needed on all tabs: the initial population, the bit decoding and the mutation size all rest on the range. Mutation noise is 10% of each range, so that very wide bounds cause very large steps, and small ranges cause small ones. Clamping sends out-of-range children to the face of the box, which can favour edge solutions. **Bounds Feasibility** shows which coordinates are at a limit. A solution on a limit should lead you to widen the box, unless that limit is real.

## What the Default Function Flatters

The Rastrigin function is symmetric, separable and has a known optimum at the centre of the box. All of these help some methods. Real-coded crossover pulls children to the middle of the population, which suits a central optimum. A separable function suits per-gene operators. **Evaluate New Point** starts from the centre, so that by default it reports the exact minimum. Before forming a general view, shift the optimum, for instance with x .- 1.3 in **Objective f(x)**, and rotate the coordinates.

## What Budget and Population Assume

**Population Size** must be large enough to hold useful material at the start. Too small a population converges on a poor solution, and more generations do not help after that. Too large a population spends its budget before selection has acted. **Population Size Study** tests that trade-off at equal evaluations. On smooth low-dimensional problems, a large number of evaluations is wasteful compared with a gradient method. No setting works for all problems: the theorems of [Wolpert and Macready (1997)](#ref-WM1997a) say that averaged over all objectives, no search method beats another.

## What Randomness Assumes

Each result is one draw from a distribution over runs. A fixed seed of 1 makes one run repeatable, and it does not make that run typical. Claims about a method need many seeds, and the panel gives 10 for reliability and 3 to 5 for comparison. A larger number of seeds is required for fine differences. Running time has its own variation, and it reflects the cost of the objective as well as the method's own work.

## References

<a id="ref-Whi1994a"></a>Whitley, D. (1994). A genetic algorithm tutorial. *Statistics and Computing* 4(2), 65–85. [doi:10.1007/BF00175354](https://doi.org/10.1007/BF00175354)

<a id="ref-WM1997a"></a>Wolpert, D. H. and Macready, W. G. (1997). No free lunch theorems for optimization. *IEEE Transactions on Evolutionary Computation* 1(1), 67–82. [doi:10.1109/4235.585893](https://doi.org/10.1109/4235.585893)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
