# Automatic Differentiation

Automatic differentiation computes the exact derivative of a program, operation by operation. It is neither a symbolic algebra system nor a numerical approximation.

## What Automatic Differentiation Is

A program is a long composition of simple operations, each with a known derivative. Automatic differentiation applies the chain rule along that composition and carries numbers, not formulas. The result is exact up to rounding error, at a cost that is a small multiple of evaluating the function. Loops and branches pose no special problem, since only the path actually taken is differentiated. [Baydin, Pearlmutter, Radul and Siskind (2018)](#ref-BPRS2018a) give the standard survey, and clarify how it differs from symbolic and numerical methods.

## How AD Differs from Finite Differences and Symbolic Algebra

| Method | Accuracy | Cost for p parameters | Weakness |
|---|---|---|---|
| Central finite differences | About 10 digits at best | 2p evaluations | Needs a step size, loses digits to rounding |
| Symbolic algebra | Exact | Depends on expression | Expressions can swell, and code with loops is hard to handle |
| Forward-mode AD | Exact to rounding | About p passes | Slow for many parameters |
| Reverse-mode AD | Exact to rounding | A few passes, plus memory | Needs a stored record of the computation |

## How Forward and Reverse Modes Work

For a chain x → u → v → y, the chain rule is dy/dx = (dy/dv)(dv/du)(du/dx). Forward mode multiplies from the right, carrying the derivative of each quantity with respect to one input, alongside the evaluation. Reverse mode multiplies from the left, carrying the derivative of the output with respect to each intermediate, in a second pass backwards. A log-likelihood has one output and p inputs, so one reverse pass gives the whole gradient, while forward mode needs a pass per input, though `ForwardDiff.jl` groups them to save work.

## How the Panel Applies AD to a Likelihood

Each tab writes `nll(p, ...)`, with the data as further arguments, and `negloglik(p)`, which fixes the data. The tuple `data` holds what stays constant. Under Enzyme, `grad!` differentiates `nll` with the data marked `Const`. Under ForwardDiff, `grad!` differentiates `negloglik`. Each writes the gradient into `G`, and `optimize(negloglik, grad!, p0, LBFGS())` then has what it needs. Replacing `nll` in the code is usually all that changes for a new model, as the same lines build the gradient.

## How to Check a Gradient Against Finite Differences

**AD Against Finite Differences** compares the gradient at the start with a central difference: (f(p + h) − f(p − h)) / (2h), with h = 1e-6. Truncation error shrinks as h² and rounding error grows as 1 / h, so several digits should agree, and not all of them. The start is the right place to test, since the gradient near an optimum is close to zero, which makes a relative error meaningless. A large `relative_error` means a bug or a kink in the likelihood, and calls for a look before any fit is trusted.

## Where Automatic Differentiation Can Mislead

Exact derivatives of the code are not always derivatives of the mathematics. A `round`, a `floor` or a comparison makes a function flat or jumpy, and AD reports the local derivative without warning. A branch on a parameter's value gives the derivative of one branch only. Numerical shortcuts in the code, such as an iteration stopped early, get differentiated as written. Also, AD says nothing about a likelihood's shape, so a correct gradient can still lead to a poor local optimum.

## References

<a id="ref-BPRS2018a"></a>Baydin, A. G., Pearlmutter, B. A., Radul, A. A. and Siskind, J. M. (2018). Automatic differentiation in machine learning: a survey. *Journal of Machine Learning Research* 18(153), 1–43. [jmlr.org/papers/v18/17-468](https://jmlr.org/papers/v18/17-468.html)

## See Also

- [Overview](overview.md) · [Enzyme Backend](enzyme.md) · [ForwardDiff Backend](forwarddiff.md) · [ChainRules Integration](chainrules.md)
