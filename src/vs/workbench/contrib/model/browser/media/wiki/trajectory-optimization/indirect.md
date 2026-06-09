# Indirect Methods: Iterative Linear Quadratic Regulator (iLQR)

Indirect methods solve trajectory optimization via successive quadratic approximation around a nominal trajectory.

## Iterative LQR (iLQR) Approach

1. Start with initial trajectory estimate (x_traj, u_traj)
2. Linearize dynamics around trajectory
3. Quadraticize cost around trajectory
4. Solve resulting linear-quadratic problem via backward pass: compute optimal gains K(t)
5. Forward pass: apply gains to integrate improved trajectory
6. Iterate until convergence

## Backward Pass

Compute cost-to-go value function V(x,t) backwards in time. Yields linear feedback: u_opt(t) = K(t) x(t) + k(t)

## Forward Pass

Integrate dynamics forward with new controls, typically with line-search to ensure cost decrease.

## Advantages

- Fast local convergence (quadratic with second-order terms)
- Uses problem structure (linear-quadratic subproblems)
- No explicit grid: works with continuous dynamics

## Disadvantages

- Local method only: converges to nearby local minimum
- Requires smooth, differentiable dynamics and cost

## References

Li, Y., & Todorov, E. (2004). Iterative Linear Quadratic Regulator Design for Nonlinear Biological Movement Systems.
