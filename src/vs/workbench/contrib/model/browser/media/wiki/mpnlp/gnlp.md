# Global NLP

**Global nonlinear programming** finds the best of all local optima of a nonconvex problem and **proves** it is the best, within a tolerance. The default problem, with its bilinear term 3 x[1] x[2] and two local minima, is a small example: a local solver may return the minimum at about 1.69, a global one returns the one at about -0.54.

## Spatial Branch and Bound
Global solvers use **spatial branch and bound**:
1. Over the current box of variable bounds, build a **convex relaxation** of the problem, a convex problem whose optimum is a lower bound on the true one.
2. Find a feasible point, often with a local solver, giving an upper bound.
3. If the bounds are not close enough, **split the box** along a variable and repeat on both halves.
4. Prune boxes whose lower bound exceeds the best feasible value.
The relaxations get tighter as the boxes shrink, and the gap closes.

## EAGO
**EAGO** (Wilhelm and Stuber) is a pure-Julia deterministic global optimiser built on **McCormick relaxations**, convex and concave envelopes composed through the expression, with bound tightening and a local solver for upper bounds.

## SCIP
**SCIP** handles nonconvex terms by spatial branching with relaxations of the expression graph, together with its MIP machinery of cuts and presolve, and integer variables. **Couenne**, another open-source global solver, is reachable through AmplNLWriter.jl and Couenne_jll.

## Bounds Matter
Relaxations over large boxes are weak: **finite and tight bounds** on every variable that appears nonlinearly are essential, and the run time grows quickly with the number of such variables.

## Results
The termination status OPTIMAL means the gap between the best solution and the bound is within tolerance; **Solver Statistics** gives the nodes, the gap and the bound. Global solvers usually return no duals.

## See Also
- [NLP](nlp.md) · [MINLP](minlp.md) · [Decision Guide](decision-guide.md)
