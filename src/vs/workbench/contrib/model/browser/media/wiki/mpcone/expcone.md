# Exponential Cone

The **exponential cone** is the closure of {(x, y, z): y > 0, y exp(x / y) <= z}. It represents the exponential, the logarithm, the **entropy** -x log x, the relative entropy, log-sum-exp and the logistic loss: the atoms of maximum entropy, logistic regression, geometric programming and Poisson likelihoods.

## The Panel's Model
The **Exponential Cone** model finds the **maximum-entropy distribution** on the values 1, ..., n with a given mean:

    maximise   - sum x_i log x_i   subject to   sum x_i = 1,   sum i x_i = mu,   x >= 0.

Each entropy term is written with a variable u_i and the cone constraint [u_i; x_i; 1] in MOI.ExponentialCone(), which says x_i exp(u_i / x_i) <= 1, that is, u_i <= -x_i log x_i. Maximising sum(u) then maximises the entropy.

## The Solution
Maximum entropy under a mean constraint gives a **Gibbs distribution**, x_i proportional to exp(lambda i), where lambda is the dual variable of the mean constraint. With the **Target Mean** at the centre (n + 1) / 2, the solution is uniform; below it, the probabilities decrease geometrically with i; above it, they increase. The **Solution Profile** plots them with the mean marked.

## vs Baseline
**vs Baseline** compares the entropy with log(n), the entropy of the uniform distribution, the maximum without the mean constraint: the difference is the information the mean adds.

## The Parametric Sweep
The sweep varies the mean from 1.1 to n - 0.1. The maximum entropy is concave in the mean, highest at (n + 1) / 2 and falling towards the ends, where the distribution concentrates on 1 or on n.

## Solvers
Clarabel, SCS and ECOS support the exponential cone; it is harder than the second-order cone, and solves take more iterations.

## See Also
- [Power Cone](powcone.md) · [Duality](duality.md) · [Interior Point](ipm.md)
