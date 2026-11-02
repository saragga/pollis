# MOEA/D

MOEA/D splits a multi-objective problem into many scalar subproblems, one per weight vector, and solves them together. Neighbouring subproblems help each other, since their best solutions are usually alike.

## How Decomposition Works

A weight vector w turns the objectives into one scalar goal. The tab uses the Tchebycheff form:

- g(x | w, z) = max over i of w_i |f_i(x) − z_i|

Here z is the ideal point, the best value seen for each objective. Each weight vector asks for a different balance, and its optimum is one point on the front. [Zhang and Li (2007)](#ref-ZL2007a) introduced the framework. Each subproblem keeps one solution. New solutions can replace the current solution of a neighbouring subproblem if they do better on it.

## Why Tchebycheff and Not a Weighted Sum

A weighted sum reaches only convex parts of a front, as every optimum of a linear goal lies on the convex hull. Tchebycheff has no such limit: for each point on the front, including those in non-convex parts, some weight vector makes it optimal. The cost is that its contours have corners, which makes it less smooth. The other common choice, penalty boundary intersection, uses a distance along a reference direction and a penalty off it. The bullet in the panel names both forms, and the code uses Tchebycheff.

## How the Weight Vectors Are Set

`gen_ref_dirs(nobj, p)` builds evenly spaced vectors on the unit simplex, as in the systematic design of [Das and Dennis (1998)](#ref-DD1998a). With p partitions, the number of vectors is binomial(p + m − 1, m − 1), for m objectives. The code raises p until the count is as large as possible without passing **Population**. With two objectives, any count can be reached, but with many objectives, the possible counts are sparse, and the actual number may be well below **Population**.

## How the Differential Evolution Variant Works

`MOEAD_DE` makes new solutions by differential evolution, drawing parents mostly from the neighbours of a subproblem and sometimes from the whole population. [Li and Zhang (2009)](#ref-LZ2009a) gave that design, and also limited how many neighbours one new solution can replace, which guards diversity. Differential evolution suits real-valued variables with related components. Each generation produces about one candidate per subproblem, so that a run costs about the number of weights times **Iterations** in evaluations.

## How Constraints Affect MOEA/D

The original framework addresses unconstrained problems. Weight vectors know nothing about constraints, and a subproblem whose ideal direction points to an infeasible region may have no useful solution. Solutions can then pile up at a few points, and part of a cut front may stay thin. Always read `all_feasible`, and run **Constraint Check**, on a constrained problem. If the front is cut by constraints or if feasibility is rare, the **CCMO** tab is usually a better starting point.

## Where MOEA/D Is Strong and Weak

MOEA/D handles many objectives better than dominance-based methods, because comparison is by a scalar and not by dominance. A regular and smooth front is well served. Uniform weights do not suit all shapes, however: [Ishibuchi, Setoguchi, Masuda and Nojima (2017)](#ref-ISMN2017a) show that performance depends strongly on the front's shape. Disconnected or badly scaled fronts leave some weights without a distinct solution. **Weight Vectors** shows this for two objectives. Scale objectives first, as the weights assume comparable ranges.

## References

<a id="ref-DD1998a"></a>Das, I. and Dennis, J. E. (1998). Normal-boundary intersection: a new method for generating the Pareto surface in nonlinear multicriteria optimization problems. *SIAM Journal on Optimization* 8(3), 631–657. [doi:10.1137/S1052623496307510](https://doi.org/10.1137/S1052623496307510)

<a id="ref-ISMN2017a"></a>Ishibuchi, H., Setoguchi, Y., Masuda, H. and Nojima, Y. (2017). Performance of decomposition-based many-objective algorithms strongly depends on Pareto front shapes. *IEEE Transactions on Evolutionary Computation* 21(2), 169–190. [doi:10.1109/TEVC.2016.2587749](https://doi.org/10.1109/TEVC.2016.2587749)

<a id="ref-LZ2009a"></a>Li, H. and Zhang, Q. (2009). Multiobjective optimization problems with complicated Pareto sets, MOEA/D and NSGA-II. *IEEE Transactions on Evolutionary Computation* 13(2), 284–302. [doi:10.1109/TEVC.2008.925798](https://doi.org/10.1109/TEVC.2008.925798)

<a id="ref-ZL2007a"></a>Zhang, Q. and Li, H. (2007). MOEA/D: a multiobjective evolutionary algorithm based on decomposition. *IEEE Transactions on Evolutionary Computation* 11(6), 712–731. [doi:10.1109/TEVC.2007.892759](https://doi.org/10.1109/TEVC.2007.892759)

## See Also

- [Factsheet](factsheet.md) · [CCMO](ccmo.md) · [Borg MOEA](borg.md) · [Decision Guide](decision-guide.md)
