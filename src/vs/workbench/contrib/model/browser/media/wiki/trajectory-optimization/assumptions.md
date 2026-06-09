# Assumptions in Trajectory Optimization

## Differentiability

System dynamics and cost function must be sufficiently smooth for gradient-based methods.

## Time Horizons

Finite horizon problems have fixed terminal time. Infinite horizon requires discounting or asymptotic stability.

## Feasibility

Problem must be feasible — at least one trajectory satisfying all constraints must exist.

## Cost Function Form

Typical: accumulated stage cost plus terminal cost. Must be bounded below.
