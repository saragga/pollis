# Decision Guide

| Situation | Model |
|---|---|
| A required return, minimise risk | **Quadratic Programming (QP)** |
| A risk budget, maximise return | **Quadratic Constraints QP (QCQP)** |
| A limit on the number of holdings, or on/off decisions | **Mixed-Integer QP (MIQP)** |
| Large sparse QP, moderate accuracy enough | QP with OSQP |
| General nonlinear objective or constraints | A nonlinear solver (Ipopt), not a QP |
| Smooth objective with no constraints | Quasi-Newton Methods |

## Decision Flow

1. **Write the problem**: what is minimised or maximised, and what must hold.
2. **Is it convex?** A positive semidefinite matrix in every quadratic term that is minimised or bounded above. If not, repair the inputs, or use a global solver.
3. **Objective or constraint?** Put a quantity in the constraints when a hard limit exists (a regulatory risk cap), in the objective when it is traded off.
4. **Discrete choices?** Add binary variables only when they are needed: they turn a convex problem into a much harder one.
5. **Solve and check the status** before reading the solution.
6. **Read the duals** to see which constraints cost the most.

## Rules of Thumb

- **Check feasibility first**: the target return must lie between the smallest and largest expected return in a long-only portfolio.
- **Clarabel** for accuracy on small and medium problems; **OSQP** when the problem is large and sparse and warm starts matter; **Ipopt** for nonlinear extensions.
- **QP and QCQP trace the same frontier**: for each target return there is a volatility cap that gives the same portfolio.
- **Keep k loose** in the MIQP unless the limit is real: each binary variable doubles the worst-case search.
- **Mistrust extreme weights**: they usually reflect estimation error in the inputs.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
