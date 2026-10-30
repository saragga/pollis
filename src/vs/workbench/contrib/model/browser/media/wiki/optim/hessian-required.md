# Hessian Required

Second-order methods use the **Hessian** H, the matrix of second derivatives, to build a quadratic model of f at each point and step to its minimum.

## Newton
**Newton**'s step d solves H d = -g. Near a minimum with a positive-definite Hessian it converges **quadratically**: the number of correct digits roughly doubles at each iteration. Far from the minimum, H may not be positive definite and the step may not descend; Optim then modifies H to a positive-definite matrix before solving and uses a line search, so each step still decreases f.

## Newton Trust Region
**Newton Trust Region** minimises the quadratic model only within a ball, the **trust region**, whose radius grows when the model predicted the decrease well and shrinks when it did not. It handles indefinite Hessians and regions of negative curvature more robustly than a line search, and is the safer choice from a poor start.

## IPNewton
**IPNewton** is a primal-dual **interior-point** Newton method for problems with bounds: it keeps the iterates strictly inside the box by a barrier term and drives the barrier to zero as it converges. In the panel it uses the **Lower Bounds** and **Upper Bounds**; x0 must be strictly inside them.

## Cost
Each iteration needs the Hessian, n(n + 1)/2 second derivatives, and a linear solve of O(n^3) work. With automatic differentiation that is cheap for tens of variables and expensive for thousands; for large problems, quasi-Newton methods get most of the benefit from gradients only.

## The Hessian at the Solution
The same Hessian gives the **Local Optimality (Hessian)** check: its eigenvalues at the solution, and for a likelihood the observed information.

## See Also
- [Gradient Required](gradient-required.md) · [Gradient Free](gradient-free.md) · [Decision Guide](decision-guide.md)
