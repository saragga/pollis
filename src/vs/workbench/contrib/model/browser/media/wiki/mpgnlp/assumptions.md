# Assumptions

## Finite and Tight Bounds on Every Variable
Global solvers build convex relaxations of the problem over a **box** of variable bounds, and a relaxation over an unbounded box gives no useful bound. Every variable that appears nonlinearly needs finite bounds, and the tighter they are, the tighter the relaxations and the fewer boxes to split. Bounds implied by the constraints, as -2 and 2 are by the panel's default ball, cost nothing and help a great deal. **Wider Bounds** shows the cost of loose ones.

## Expressions a Global Solver Can Relax
A global solver relaxes the expression itself, term by term, so the objective and constraints must be built from operations it knows how to bound: sums, products, powers, exp, log and, for EAGO and SCIP, trigonometric functions. EAGO can also relax functions defined in Julia, as its McCormick arithmetic runs through ordinary Julia code. Alpine is built for problems whose nonconvexity comes from products of variables, the multilinear terms of pooling and blending problems among them. Black-box functions, whose formula the solver cannot see, belong to the Global Optimisation methods of the Optimise menu instead.

## What a Global Solver Guarantees
With status OPTIMAL, the best solution found is within the solver's **tolerance** of the true global optimum: the gap between it and the lowest bound of all remaining boxes is below the tolerance. The guarantee holds for the problem as written, with its bounds; a bound that cuts off the true optimum changes the problem.

## Size of the Problem
The work of spatial branch and bound grows quickly with the number of variables in nonconvex terms. The panel's default, five variables, solves in seconds; a few dozen is routine for well-bounded problems, and hundreds may take far longer, depending on the structure more than on the count.

## One Constraint in the Panel
The panel generates one constraint from **Constraint**; further ones are added as @constraint lines in the generated code.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Spatial Branch and Bound](gnlp.md)
