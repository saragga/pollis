# Newton Trust Region

**Newton Trust Region** uses the same quadratic model as Newton, but trusts it only within a radius Delta of the current point. At each iteration it minimises the model subject to ||d|| <= Delta, then compares the actual reduction in f with the reduction the model predicted.

## The Radius
- If the ratio of actual to predicted reduction is close to 1, the model is good: the step is accepted and Delta may grow.
- If the ratio is small or negative, the model is poor: the step is rejected and Delta shrinks.
Near the minimum the model is accurate, the radius stops binding, and the method takes full Newton steps with **quadratic convergence**.

## Indefinite Hessians
The trust-region subproblem has a solution even when H is indefinite: the constrained minimum then lies on the boundary of the region, often along a direction of **negative curvature**, which is exactly the direction that decreases f fastest. Optim.jl solves the subproblem by the Moré-Sorensen method, using an eigendecomposition of H. That makes the method robust where a modified-Hessian line search struggles, at saddle points and in regions of negative curvature.

## Global Convergence
Under mild conditions the iterates converge to a point where the gradient is zero and the Hessian positive semidefinite, from any start. **Start Robustness** typically shows a higher success rate than Newton.

## Cost
The eigendecomposition costs a little more than a Cholesky factorisation, and a rejected step costs an evaluation without progress. For small and moderate n the extra cost is minor.

## See Also
- [Newton](newton.md) · [IPNewton](ipnewton.md) · [Decision Guide](decision-guide.md)
