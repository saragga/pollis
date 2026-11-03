# Neural ODEs for System Identification: Training

How the panel fits the network to the data: the loss, the gradient by adjoint sensitivity, the Adam optimiser, and the solver tolerances.

## The loss

Every model integrates its ODE from the first observation, u0 = obs_data[:, 1], and saves the solution at **Time points**. The loss is the squared error against the observed trajectory, summed over states and times:

L(θ) = Σᵢ Σⱼ (ûᵢ(tⱼ; θ) − yᵢⱼ)²

[Rackauckas, Ma, Martensen, Warner, Zubov, Supekar, Skinner, Ramadhan and Edelman (2020)](#ref-RMMWZ...2020a) describe training a universal differential equation in the same way, as minimising a cost function defined on the current solution, with the Euclidean distance to the data points as one choice. With a local derivative-based optimiser, the training reduces to computing the gradient of the ODE solution with respect to the parameters.

## Gradients by adjoint sensitivity

[Chen, Rubanova, Bettencourt and Duvenaud (2018)](#ref-CRBD2018a) treat the solver as a black box and compute the gradient with the adjoint sensitivity method. The adjoint a(t) = ∂L/∂z(t) follows its own ODE, solved backwards in time,

da/dt = −a(t)ᵀ ∂f/∂z,  dL/dθ = −∫ from t₁ to t₀ of a(t)ᵀ ∂f/∂θ dt

and the vector–Jacobian products in both are evaluated by automatic differentiation at a cost similar to that of evaluating f. When the loss depends on the state at several observation times, the adjoint is updated at each of them.

## The adjoint in the panel

The code passes `sensealg=InterpolatingAdjoint(autojacvec=EnzymeVJP())` to the solver. In the appendix of [Rackauckas, Ma, Martensen, Warner, Zubov, Supekar, Skinner, Ramadhan and Edelman (2020)](#ref-RMMWZ...2020a), `InterpolatingAdjoint` solves the adjoint ODE in reverse using an interpolation of the forward solution, with optional checkpoints; the authors describe it as tending to be both stable and economical in memory.

The SciMLSensitivity.jl documentation describes `EnzymeVJP` as computing the vector–Jacobian products with Enzyme.jl, and as the fastest choice whenever it applies. The optimiser receives the gradient of the whole loss through `Optimization.AutoEnzyme()`, so reverse-mode differentiation by Enzyme.jl runs from the loss down to the network.

## Adam

[Kingma and Ba (2015)](#ref-KB2015a) introduce Adam, a first-order method for stochastic objectives based on adaptive estimates of the first two moments of the gradient. At step t, with gradient gₜ,

mₜ = β₁mₜ₋₁ + (1 − β₁)gₜ,  vₜ = β₂vₜ₋₁ + (1 − β₂)gₜ²

θₜ = θₜ₋₁ − α · m̂ₜ / (√v̂ₜ + ε)

where m̂ₜ and v̂ₜ are the bias-corrected moments and all operations are element-wise. The authors suggest α = 0.001, β₁ = 0.9, β₂ = 0.999 and ε = 10⁻⁸ as good defaults for the problems they tested, and note that the effective step is approximately bounded by α.

The panel runs `OptimizationOptimisers.Adam(lr)` through Optimization.jl for **Iterations** steps, with **Learning rate** as α. The tooltip suggests 1e-3 to 1e-2 and a smaller value if the loss diverges.

## Following the loss

A callback records the loss at every iteration in `losses`, which **Loss Curve** plots on a logarithmic scale. The tooltip of **Iterations** suggests starting with 300 and increasing the number if the loss has not converged.

The DiffEqFlux.jl tutorial on neural ODEs starts with Adam to approach a minimum quickly and then continues from where Adam stopped with BFGS, halting when the loss no longer falls. [Goodfellow, Bengio and Courville (2016)](#ref-GBC2016a) devote a chapter to optimisation for training deep models.

## Solver and tolerances

All models integrate with `Tsit5()` at relative and absolute tolerances of 10⁻³. [Chen, Rubanova, Bettencourt and Duvenaud (2018)](#ref-CRBD2018a) point out that ODE solvers monitor their error and adapt their steps to the accuracy requested, so the cost of evaluating the model scales with the complexity of the problem, and that the user must choose a tolerance for both the forward and the reverse pass. In their classification and density estimation experiments, tolerances of 10⁻³ and 10⁻⁵ did not degrade performance.

**Lyapunov Estimate** tightens the tolerances to 10⁻⁶ and 10⁻⁷ for its own integration, as its comment explains, because the solver's error must stay well under the size of its perturbation.

## References

<a id="ref-CRBD2018a"></a>Chen, R. T. Q., Rubanova, Y., Bettencourt, J., & Duvenaud, D. (2018). Neural Ordinary Differential Equations. [doi:10.48550/arXiv.1806.07366](https://doi.org/10.48550/arXiv.1806.07366)

<a id="ref-GBC2016a"></a>Goodfellow, I., Bengio, Y., & Courville, A. (2016). *Deep Learning*. MIT Press. [deeplearningbook.org](https://www.deeplearningbook.org/)

<a id="ref-KB2015a"></a>Kingma, D. P., & Ba, J. L. (2015). Adam: A Method for Stochastic Optimization. *International Conference on Learning Representations*. [doi:10.48550/arXiv.1412.6980](https://doi.org/10.48550/arXiv.1412.6980)

<a id="ref-RMMWZ...2020a"></a>Rackauckas, C., Ma, Y., Martensen, J., Warner, C., Zubov, K., Supekar, R., Skinner, D., Ramadhan, A., & Edelman, A. (2020). Universal Differential Equations for Scientific Machine Learning. [doi:10.48550/arXiv.2001.04385](https://doi.org/10.48550/arXiv.2001.04385)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Architecture](architecture.md)
