# LP

A linear programme in the form this panel uses:

    maximise (or minimise)   c' x
    subject to               A x <= b
                             x >= 0

with n variables and m constraints. Every point satisfying the constraints is **feasible**; the feasible set is a convex polyhedron.

## Why Vertices
The objective is linear, so its contours are parallel hyperplanes, and moving in the direction of improvement until the polyhedron ends always stops at a face of it, and in particular at a **vertex** (a basic feasible solution: n constraints holding with equality, the rest satisfied). If two vertices are optimal, the whole edge between them is. So the search can be limited to the finitely many vertices.

## The Simplex Method
Starting from a vertex, the simplex method moves along an edge to an adjacent vertex with a better objective, and stops when no edge improves it: the vertex is then optimal, because a local optimum of a linear function over a convex set is global. Each vertex corresponds to a **basis**, the set of variables allowed to be non-zero; a step swaps one variable into the basis and one out. In the worst case the number of steps grows exponentially, but in practice it is a small multiple of m. The **dual simplex** works on the dual problem and is the usual choice after a small change to the data.

## Interior-Point Methods
Interior-point (barrier) methods follow a path through the inside of the polyhedron towards the optimum, solving a linear system at each step. Their number of steps grows slowly with the size of the problem, so they are often faster on very large LPs; a final crossover step moves to a vertex. HiGHS has both simplex and interior-point solvers and chooses between them.

## Outcomes
An LP is either **infeasible** (no feasible point), **unbounded** (the objective improves without limit), or has an **optimal** solution. There is no fourth case.

## In JuMP

    @variable(model, x[1:n] >= 0)
    @objective(model, Max, dot(c, x))
    @constraint(model, cons, A * x .<= b)
    optimize!(model)

The same model runs with any solver: only the optimizer passed to Model changes.

## See Also
- [Duality](duality.md) · [MILP](milp.md) · [Overview](overview.md)
