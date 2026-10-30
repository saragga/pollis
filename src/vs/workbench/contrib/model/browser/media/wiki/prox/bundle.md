# Bundle Methods

A **bundle method** (Lemarechal, Kiwiel and others, from the 1970s) collects the function values and subgradients at past points into a **bundle**, and builds from them a **cutting-plane model**: the maximum of the linearisations F(x_i) + s_i'(x - x_i), a piecewise-linear lower bound of F.

## The Proximal Step
Minimising the cutting-plane model alone is unstable: the minimiser jumps around. The **proximal bundle** method adds a quadratic term around a **stability centre** y: it minimises model(x) + (mu / 2) ||x - y||^2, with mu = 1 / **Step Size**. The panel solves this through its dual, a quadratic program over the simplex of bundle weights, by projected gradient.

## Serious and Null Steps
The model predicts a decrease delta. If the actual decrease is at least 10% of delta, the step is **serious**: the centre moves to the new point. Otherwise it is a **null step**: the centre stays, but the new linearisation enters the bundle and improves the model where it was wrong. The centre's objective therefore never increases. **Algorithm Info** reports the number of serious steps.

## Bundle Size
The panel keeps at most 40 linearisations, dropping the oldest. Practical codes aggregate them instead, keeping convergence with a fixed memory.

## Stopping
The method stops when the predicted decrease falls below 1e-12: the model can no longer find an improvement, a certificate of approximate optimality.

## Performance
Bundle methods need far fewer iterations than the subgradient method for the same accuracy, and are the method of choice when only function values and subgradients are available, as in Lagrangian relaxation of integer programs. Each iteration costs a small QP, which grows with the bundle.

## See Also
- [Subgradient](subgradient.md) · [Proximal Point](proximal-point.md) · [Decision Guide](decision-guide.md)
