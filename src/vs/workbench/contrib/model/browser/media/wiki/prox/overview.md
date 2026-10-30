# Nonsmooth and Proximal Optimisation — Overview

This webview solves **penalised sparse regression**, min F(x) = 0.5 ||A x - b||^2 + lambda penalty(x), with a random m by n design A, a truth x_true whose first n / 5 coefficients are nonzero, and noise of standard deviation 0.1. The penalty is the **L1 norm** (lasso), the **L2 norm** (group lasso with one group) or the **max norm**; **ProximalOperators.jl** supplies its proximal map. A reference optimum F* is computed first by 5000 steps of accelerated proximal gradient (FISTA), so that every method's **gap** F(x) - F* can be measured.

## The Proximal Map
For the L1 norm, the prox is **soft thresholding**: each coordinate is shrunk towards zero by t lambda and set to zero if smaller. For the L2 norm the whole vector is shrunk; for the max norm the largest coordinates are clipped. A proximal step generalises a gradient step to nonsmooth functions.

## The Methods
- **Subgradient** steps along a subgradient of F. See [Subgradient](subgradient.md).
- **Bundle** builds a cutting-plane model from past subgradients. See [Bundle Methods](bundle.md).
- **Chambolle-Pock** splits F into g(x) + h(A x) and alternates primal and dual proximal steps. See [Chambolle-Pock](chambolle-pock.md).
- **Douglas-Rachford** alternates the proximal maps of the loss and the penalty. See [Douglas-Rachford](douglas-rachford.md).
- **Proximal Point** applies the proximal map of F itself. See [Proximal Point](proximal-point.md).

## Common Workflow

1. Set the **Variables (n)**, **Observations (m)**, **Penalty**, **Penalty Weight**, **Step Size** and **Iterations**, choose a method, and run.
2. Look at the **Convergence Curve**, the **Optimality Residual** and the **Iterate Change**.
3. Run the **Optimality Check**, the **Step Size Sensitivity** and the **Descent Check**.
4. Read the **Solution Summary**, the **Subdifferential** and the **Algorithm Info**.
5. **Evaluate at Solution**, check the **Sparsity Pattern**, try a **Warm Start**.
6. **Compare with ProximalAlgorithms**, **Compare with Subgradient**, and run the **Budget Study**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
