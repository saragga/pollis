# ALTRO: Augmented Lagrangian Trajectory Optimizer

ALTRO combines DDP with augmented Lagrangian (AL) framework for constrained trajectory optimization.

## Approach

Solves constrained trajectory problem:
- minimize cost
- subject to: dynamics constraints, general equality/inequality path constraints

Uses augmented Lagrangian method to handle constraints:

1. Form augmented Lagrangian with constraint penalties and multipliers
2. Inner loop: DDP on augmented problem (subproblem with only dynamics constraints)
3. Outer loop: update Lagrange multipliers and penalties

## Key Features

- Handles general constraints (state bounds, control limits, nonlinear path constraints)
- Inner DDP solver inherits fast convergence properties
- Outer AL iteration increases penalty until constraint satisfaction

## Advantages

- First method solving general nonlinear trajectory problems with constraints
- Combines global convergence (AL) with fast local convergence (DDP)
- State-of-the-art for robotics applications

## Disadvantages

- More complex than direct or basic indirect methods
- Tuning of AL parameters required
- Less standard compared to NLP solvers

## References

Howell, T. A., et al. (2019). ALTRO: A Fast Solver for Constrained Trajectory Optimization. IROS.
