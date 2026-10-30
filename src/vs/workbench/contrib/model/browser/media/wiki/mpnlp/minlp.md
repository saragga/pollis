# MINLP

A **mixed-integer nonlinear program** adds integer or binary variables to an NLP. They model discrete decisions: open a plant or not, include an asset or not, choose one of several configurations.

## The Panel's Formulation
Each continuous x[i] gets a **binary switch** z[i]:
- lb z[i] <= x[i] <= ub z[i]: when z[i] = 0, x[i] is forced to 0; when z[i] = 1 it ranges over its bounds;
- sum(z) <= **Max Nonzeros**: at most that many variables may be nonzero.
This is a **cardinality constraint**, the nonlinear analogue of best-subset selection, written with the bounds as big-M constants: tight bounds make the continuous relaxation tight.

## Branch and Bound
Both solvers use branch and bound. The binaries are relaxed to [0, 1] and the continuous problem is solved; if a binary is fractional, the problem is split into two, with it fixed to 0 and to 1, and the process repeats. A relaxation's value bounds what its branch can achieve, so branches that cannot beat the best solution so far are **pruned**.

## SCIP and Juniper
- **SCIP** is a branch-and-cut framework: it adds cutting planes and, for nonconvex terms, **spatial branching** on continuous variables, with convex relaxations. It handles nonconvex MINLPs to global optimality.
- **Juniper** solves the relaxation at each node with **Ipopt**, a local solver. For convex MINLPs that is exact; for nonconvex ones a node's relaxation may not be a valid bound, and the result is a good feasible solution without a guarantee.

## What the Panel Shows
The **Optimality Gap Check** compares the integer optimum with the continuous relaxation, z free in [0, 1]. MINLP solvers usually return no duals, so **KKT Conditions** and **Constraint Sensitivity** report an error; **Solver Statistics** gives the nodes and the gap.

## See Also
- [NLP](nlp.md) · [Global NLP](gnlp.md) · [Decision Guide](decision-guide.md)
