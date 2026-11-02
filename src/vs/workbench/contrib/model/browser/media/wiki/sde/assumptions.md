# Assumptions

A simulated diffusion is only as sound as the equation behind it and the scheme that discretises it. Some conditions belong to the mathematics of the equation, and others to the choices the panel makes for you.

## What Makes a Stochastic Differential Equation Well Posed

The standard theorem asks that f and g be Lipschitz in X and grow at most linearly, which gives one solution with finite moments ([Øksendal (2003)](#ref-Oks2003a)). A **Drift f(X,t)** such as `X^2` can blow up in finite time, and the panel has no guard against it. Coefficients that grow faster than linearly can also defeat the scheme when the equation itself is fine: Euler's method can diverge for them, in both the strong and the weak sense ([Hutzenthaler, Jentzen and Kloeden (2011)](#ref-HJK2011a)). Signs of trouble are `Inf` or `NaN` values, a run of runaway paths in **Ensemble Paths**, and sample moments that change sharply with the step.

## What the Brownian Driver Assumes About Noise

The driver W has continuous paths and independent Gaussian increments. A diffusion therefore has no sudden jumps and its noise has no memory. Real shocks with heavy tails or discontinuities are outside the model, and the Jump-Diffusion Processes panel is the place for them. A real noise with a short correlation time is not white either, and it is usually better described by the Stratonovich form than by the Itô form.

## Which Noise Structures the Diffusion Panel Can Express

With a vector **Initial state X0**, the call `SDEProblem(f, g, X0, tspan)` sets up diagonal noise: each component receives its own independent Brownian motion, and g must return one value per component. Correlated noises need a `noise_rate_prototype` matrix, which the panel does not pass, and SRIW1 and RKMil accept diagonal noise only. The closed forms in **Mean and Variance** and the histogram in **Stationary Distribution** assume a scalar state.

## What the Choice of Itô or Stratonovich Assumes

With a g that depends on X, the two calculi define two different equations, and the mathematics does not say which one describes a given system ([van Kampen (1981)](#ref-Kam1981a)). The choice is part of the model and rests on how the noise arises. A wrong choice shifts the drift by 0.5 g dg/dX, and no test inside the panel can reveal it, as both are valid simulations of their own equations.

## What Happens When a Diffusion Leaves Its Allowed Range

Many models need X above zero, and the discretised path need not respect that even where the exact solution does. Geometric Brownian motion stays positive, yet an EM step can cross zero when the noise draw is large against the step. A g such as `sqrt(X)` then raises a `DomainError`, as the panel adds no boundary treatment. Smaller steps make crossings rarer. Writing the equation for log X removes them, and `solve` also accepts an `isoutofdomain` function, which makes adaptive solvers reject such steps.

## What the Solver Settings Assume About Accuracy

Every solver in the menus is explicit. For f = a X with a < 0, a fixed step must keep the factor 1 + a dt inside (-1, 1), which requires dt under 2/|a|, and strongly mean-reverting systems need many small steps. Adaptive solvers run at tolerances of 0.01, which suit a quick look more than careful statistics. SRA1 and SOSRA2 assume that g does not depend on X, so **Noise sigma** must stay free of X when either is selected.

## References

<a id="ref-HJK2011a"></a>Hutzenthaler, M., Jentzen, A. and Kloeden, P. E. (2011). Strong and weak divergence in finite time of Euler's method for stochastic differential equations with non-globally Lipschitz continuous coefficients. *Proceedings of the Royal Society A: Mathematical, Physical and Engineering Sciences* 467(2130), 1563–1576. [doi:10.1098/rspa.2010.0348](https://doi.org/10.1098/rspa.2010.0348)

<a id="ref-Kam1981a"></a>van Kampen, N. G. (1981). Itô versus Stratonovich. *Journal of Statistical Physics* 24(1), 175–187. [doi:10.1007/BF01007642](https://doi.org/10.1007/BF01007642)

<a id="ref-Oks2003a"></a>Øksendal, B. (2003). *Stochastic Differential Equations: An Introduction with Applications*, 6th edition. Springer. [doi:10.1007/978-3-642-14394-6](https://doi.org/10.1007/978-3-642-14394-6)

## See Also

- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Stratonovich](stratonovich.md)
