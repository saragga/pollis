# Duality

Every linear programme, the **primal**, has a twin, the **dual**. For the primal

    maximise c' x   subject to   A x <= b,  x >= 0

the dual is

    minimise b' y   subject to   A' y >= c,  y >= 0

with one dual variable y_i for each primal constraint, and one dual constraint for each primal variable.

## Weak Duality
For any feasible x and any feasible y, c' x <= b' y. So any feasible dual solution gives an **upper bound** on the primal optimum, and any feasible primal solution a lower bound on the dual one.

## Strong Duality
If the primal has an optimal solution, so does the dual, and their objectives are **equal**: c' x* = b' y*. A solver that returns OPTIMAL has found both. If the primal is unbounded, the dual is infeasible, which is why JuMP reports an unbounded problem as DUAL_INFEASIBLE.

## Complementary Slackness
At the optimum, for every constraint, either it is binding or its dual variable is 0: y_i (b_i - (A x)_i) = 0. And for every variable, either it is 0 or its dual constraint is binding: x_j ((A' y)_j - c_j) = 0. So a slack constraint has a zero shadow price, and a variable with a positive reduced cost stays at 0.

## Shadow Prices
The dual value y_i is the **shadow price** of constraint i: the rate at which the optimal objective changes as b_i grows. In a production problem the primal chooses quantities to maximise profit given the resources; the dual prices the resources to minimise their total value while making every product at least as valuable as its profit. The optimal prices are what the resources are worth at the margin.

## Reduced Costs
The **reduced cost** of variable j is c_j - (A' y)_j: its objective coefficient minus the value, at the shadow prices, of the resources it uses. At the optimum it is 0 for variables in the solution and of the non-improving sign for those at 0; its size says how much c_j must improve before x_j enters.

## Sign Conventions
JuMP's **shadow_price** is the change in the objective from a small relaxation of the constraint, and its **reduced_cost** the change from a small relaxation of the variable's active bound. Its **dual** follows the conic convention, whose sign can differ with the sense of the problem and the kind of constraint. The panel reports shadow_price and reduced_cost.

## See Also
- [LP](lp.md) · [Interpretation](interpretation.md) · [MILP](milp.md)
