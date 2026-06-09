# Direct Methods in Trajectory Optimization

Direct methods transcribe the optimal control problem (OCP) into a finite-dimensional nonlinear program (NLP).

## Approach

1. Discretize time into N stages
2. Discretize state x(k) and control u(k) at each stage
3. Enforce dynamics constraints at collocation points
4. Formulate as constrained NLP: minimize cost, subject to equality (dynamics, boundary) and inequality (path) constraints
5. Solve with NLP solver (Ipopt, SNOPT, etc.)

## Advantages

- Straightforward: reformulates as standard NLP
- Handles complex constraints naturally
- Robust for long horizons
- NLP solver maturity and availability

## Disadvantages

- Grid resolution matters: coarse grid loses accuracy
- Curse of dimensionality: large number of decision variables
- Requires good NLP solver

## References

- Betts, J. T. (2010). Practical Methods for Optimal Control Using Nonlinear Programming
