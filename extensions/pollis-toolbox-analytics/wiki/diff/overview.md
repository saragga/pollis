# Differentiation — Overview

## The Derivative

The derivative of $f$ at $x_0$ is the limit of the difference quotient

$$f'(x_0) = \lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h},$$

the slope of the tangent line at $x_0$. The tangent is the best **linear approximation** of $f$ near $x_0$:

$$f(x_0 + \Delta x) \approx f(x_0) + f'(x_0)\,\Delta x.$$

The second derivative $f''(x_0)$ is the rate of change of the slope: positive where $f$ bends up (convex), negative where it bends down (concave). Adding it gives the quadratic (second-order Taylor) approximation

$$f(x_0 + \Delta x) \approx f(x_0) + f'(x_0)\,\Delta x + \tfrac{1}{2} f''(x_0)\,\Delta x^2.$$

## Several Variables

For $f : \mathbb{R}^n \to \mathbb{R}$ the **gradient** collects the partial derivatives,

$$\nabla f(x_0) = \left(\frac{\partial f}{\partial x_1}, \dots, \frac{\partial f}{\partial x_n}\right),$$

and points in the direction of steepest ascent, perpendicular to the level curve through $x_0$. The **Hessian** $\nabla^2 f(x_0)$ is the symmetric matrix of second partials $\partial^2 f / \partial x_i \partial x_j$.

For $F : \mathbb{R}^n \to \mathbb{R}^m$ the **Jacobian** is the $m \times n$ matrix $J_{ij} = \partial F_i / \partial x_j$; row $i$ is the gradient of output $i$.

## Three Ways to Compute a Derivative

| Approach | How | Accuracy | Cost |
|---|---|---|---|
| **Symbolic** | Apply differentiation rules to the formula | Exact | Expressions can grow very large |
| **Numerical** (finite differences) | $\bigl(f(x+h) - f(x)\bigr)/h$ for a small $h$ | About 8 digits forward, 10 central | $n + 1$ or $2n$ evaluations per gradient |
| **Automatic** (AD) | Apply the chain rule to every elementary operation as the program runs | Machine precision | Forward: about $n$ passes; reverse: a few passes |

## Forward and Reverse Mode

Automatic differentiation propagates derivatives through the program with the chain rule.

- **Forward mode** (ForwardDiff) carries a derivative alongside each value, using *dual numbers* $a + b\,\varepsilon$ with $\varepsilon^2 = 0$. One pass gives the derivative along one input direction, so a gradient of $n$ inputs needs about $n$ passes (ForwardDiff groups them into chunks).
- **Reverse mode** (Enzyme, Mooncake) runs the program forward, records it, then propagates sensitivities backwards from the output. One backward pass gives the whole gradient of a scalar output, whatever $n$ is. This is *backpropagation* in machine learning.

Rule of thumb: forward mode for few inputs or many outputs, reverse mode for many inputs and one output (likelihoods, loss functions). The [Automatic Differentiation](automatic-differentiation.md) page works both modes by hand and tells the history.

## DifferentiationInterface

`DifferentiationInterface.jl` gives one set of functions (`derivative`, `gradient`, `jacobian`, `hessian`, ...) and chooses the implementation from a backend object: `AutoForwardDiff()`, `AutoEnzyme()`, `AutoMooncake(; config=nothing)`, `AutoFiniteDiff()`, `AutoSymbolics()`. Code written once can be benchmarked on every backend. For repeated calls at different points, `prepare_gradient` (and friends) does the one-off setup once.

## See Also
- [Factsheet](factsheet.md) · [Automatic Differentiation](automatic-differentiation.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
