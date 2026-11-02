# ForwardDiff Backend

`ForwardDiff.jl` carries each derivative along with its value, using dual numbers. It is simple and reliable, and its cost grows with the number of parameters.

## How Dual Numbers Compute a Derivative

A dual number holds a value and a partial derivative: a + b e, with the rule e² = 0. Arithmetic on duals applies the chain rule by itself, since (a + b e)(c + d e) = ac + (ad + bc) e, and f(a + b e) = f(a) + f'(a) b e. Julia's multiple dispatch lets any generic function accept a dual in place of a number. [Revels, Lubin and Papamarkou (2016)](#ref-RLP2016a) describe the implementation, which carries several partial derivatives per number, in chunks, to reduce the number of passes.

## What the ForwardDiff Call in the Panel Means

`grad!(G, p) = ForwardDiff.gradient!(G, negloglik, p)` differentiates the closure, which fixes the data, and overwrites `G` with the gradient. The data are plain numbers, so they carry no derivative. There is no activity label to set and no need to zero `G`. **Estimates With Standard Errors** calls `ForwardDiff.hessian(negloglik, p_hat)`, which nests forward mode inside itself, and it does so whichever **AD Backend** is chosen.

## What ForwardDiff Requires of a Likelihood

The code must accept numbers of any type. A signature limited to `Float64`, or an array created with `zeros(n)` and then filled with values depending on `p`, raises a conversion error. The usual fix is to create arrays with the element type of the input, as in `zeros(eltype(p), n)`. Calls into compiled C or Fortran libraries generally fail, as duals cannot pass into them. Function code is otherwise unchanged, and the panel's `nll` functions already meet these conditions, as they use only generic operations.

## Where ForwardDiff Is Strong

A gradient with a handful of parameters often costs less than a reverse pass, as there is no record to build and no second pass to run, and memory use stays low. The panel's **AD Backend** tooltip calls it fastest for a handful of parameters. It handles higher derivatives easily, through nesting. The Hessian is the natural use, and with few parameters it gives standard errors cheaply. It also compiles and works reliably, which makes it a good first check of a new likelihood.

## Where ForwardDiff Becomes Costly

Cost grows in proportion to the number of parameters, since each chunk's pass evaluates the whole likelihood. A model with thousands of parameters is impractical for the gradient, and a Hessian is worse. A likelihood with an expensive step, such as a large matrix factorisation, multiplies that expense, and duals can miss the fast paths of specialised numerical libraries. In these cases, a reverse-mode backend is preferable, as [Baydin, Pearlmutter, Radul and Siskind (2018)](#ref-BPRS2018a) explain for functions with many inputs and one output.

## How to Check ForwardDiff's Output

**AD Against Finite Differences** runs with either backend selected. **Enzyme Against ForwardDiff** computes both gradients at the optimum, so the figure `max_difference` should be close to zero, up to rounding. Mean times can be compared, but only for the model at hand, as the gap changes with parameter count. To see that scaling, simulate a design matrix with many more columns in the regression tabs and run the comparison again.

## References

<a id="ref-BPRS2018a"></a>Baydin, A. G., Pearlmutter, B. A., Radul, A. A. and Siskind, J. M. (2018). Automatic differentiation in machine learning: a survey. *Journal of Machine Learning Research* 18(153), 1–43. [jmlr.org/papers/v18/17-468](https://jmlr.org/papers/v18/17-468.html)

<a id="ref-RLP2016a"></a>Revels, J., Lubin, M. and Papamarkou, T. (2016). Forward-mode automatic differentiation in Julia. [arXiv:1607.07892](https://arxiv.org/abs/1607.07892)

## See Also

- [Automatic Differentiation](autodiff.md) · [Enzyme Backend](enzyme.md) · [ChainRules Integration](chainrules.md) · [Unconstrained Optimisation](unconstrained.md)
