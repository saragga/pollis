# Decision Guide

| Question | Model | Solver | Why |
|---|---|---|---|
| Best plan with continuous quantities | **LP** | **HiGHS** | Fast and reliable, simplex and interior point |
| A very large LP | **LP** | **HiGHS** or **Clp** | Both handle large sparse problems |
| Whole units, yes-or-no decisions, fixed costs | **MILP** | **HiGHS** | Branch-and-bound with cuts and heuristics |
| Teaching, small problems, a second opinion | **LP** or **MILP** | **GLPK** | Simple, widely known |
| What is a resource worth? | **LP** | Any | Shadow prices from the dual |
| How stable is the plan? | **LP** | Any | Sensitivity and parametric analysis |

## LP or MILP?

1. **Can the variables be fractional?** If the quantities are large (tonnes, hours), an LP is usually enough, and its rounded solution close to optimal.
2. **Are there logical conditions** (either-or, at most k of these, a fixed cost if used)? Model them with binary variables: MILP.
3. **Is the MILP slow?** Look at the LP Relaxation Gap: tighter constraints (smaller big-M values, stronger bounds) make it smaller and the solve faster.

## Decision Flow

1. Write the objective and constraints; check that every one is linear.
2. Solve as an LP first, even if integers are needed: it gives a bound and shows whether the model is feasible.
3. Add integrality if the LP solution is fractional where it must not be.
4. Read the status, then the slacks, shadow prices and reduced costs.
5. Run the sensitivity analysis before acting on the plan.

## Rules of Thumb
- **Check the status first**, always.
- **HiGHS is the default** for both LP and MILP.
- **Shadow prices hold only within their ranges.**

## See Also
- [Overview](overview.md) · [LP](lp.md) · [MILP](milp.md)
