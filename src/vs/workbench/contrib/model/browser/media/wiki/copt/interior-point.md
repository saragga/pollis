# Interior Point

An **interior-point** method replaces the inequality constraints by a **logarithmic barrier**: it minimises f(x) - mu * sum log(-g_i(x)), which tends to infinity as any constraint approaches its boundary. For each mu the minimiser lies inside the feasible set; as mu goes to zero, these minimisers trace the **central path** to the solution of the constrained problem.

## Ipopt
The panel uses **Ipopt** (Wachter and Biegler, 2006) through **JuMP**, a primal-dual interior-point method. Instead of minimising each barrier problem exactly, Ipopt takes Newton steps on the perturbed KKT conditions for the primal variables and the multipliers together, decreasing mu as it goes. A filter line search, which accepts a step if it improves either the objective or the constraint violation, provides global convergence.

## Derivatives and Sparsity
JuMP differentiates f and g itself and passes exact gradients, Jacobians and Hessians of the Lagrangian to Ipopt, with their sparsity. Ipopt solves its Newton systems with a sparse linear solver, which makes it suited to **large, sparse problems with many constraints**, up to hundreds of thousands of variables. It handles equality and inequality constraints and bounds.

## Multipliers
Ipopt returns the Lagrange multipliers with the solution: the **KKT Conditions** action prints them beside its own estimates.

## In This Panel
The model sets the bounds on the variables, starts them at the centre of the box, adds g(x) .<= 0 as vector constraints, and limits Ipopt to **Max Iterations** iterations. A callback records the objective and primal infeasibility at each iteration for the **Convergence Curve** and **Constraint Violation**; the iterates themselves are not recorded, so the **Solution Path** shows only the start and the solution.

## See Also
- [SLSQP](slsqp.md) · [MMA](mma.md) · [Decision Guide](decision-guide.md)
