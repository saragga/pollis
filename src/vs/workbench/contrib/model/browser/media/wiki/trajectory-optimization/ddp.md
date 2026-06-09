# Differential Dynamic Programming (DDP)

DDP is a second-order indirect method combining iLQR with a second-order Taylor expansion of the cost.

## Approach

Like iLQR, but computes second-order (Hessian) information during backward pass.

1. Backward pass: expand cost to second order, solve resulting quadratic subproblem
2. Forward pass: integrate trajectory with optional line-search

## Backward Pass (Second-Order)

Value function expansion includes curvature (Q_xx matrix). Yields optimal gains with curvature information.

## Advantages

- Second-order convergence: faster than iLQR for highly nonlinear problems
- More accurate quadratic approximation than iLQR
- Locally quadratically convergent

## Disadvantages

- Requires Hessian computation (more complex than iLQR)
- Still local method: needs good initialization
- Sensitivity to discretization and time-step size

## References

Tassa, Y., Erez, T., & Todorov, E. (2012). Synthesis and Stabilization of Complex Behaviors using Differential Dynamic Programming.
