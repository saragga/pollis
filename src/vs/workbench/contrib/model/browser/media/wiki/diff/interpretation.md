# Differentiation — Interpretation

## Slope and Curvature

| Sign | Meaning at $x_0$ |
|---|---|
| $f'(x_0) > 0$ | $f$ increasing: a small rise in $x$ raises $f$ by about $f'(x_0)\,\Delta x$ |
| $f'(x_0) = 0$ | Stationary point: candidate maximum, minimum or inflection |
| $f''(x_0) > 0$ | Convex: the slope is rising (e.g. increasing marginal cost) |
| $f''(x_0) < 0$ | Concave: the slope is falling (diminishing marginal returns) |

## Gradient and Hessian

- Each gradient entry is a **marginal** effect holding the other variables fixed; for a production function these are the marginal products.
- The ratio $\frac{\partial f / \partial x_1}{\partial f / \partial x_2}$ is the **marginal rate of substitution** (utility) or of technical substitution (production).
- At a stationary point ($\nabla f = 0$) the Hessian's eigenvalues classify it: all positive, a local minimum; all negative, a local maximum; mixed signs, a saddle; a zero eigenvalue, the test is inconclusive.
- Away from a stationary point the same pattern describes local convexity or concavity.

## Elasticities

The elasticity is the percentage change in $f$ per 1% change in $x$:

$$\varepsilon = \frac{\partial f}{\partial x}\,\frac{x}{f}.$$

It has no units, so it can be compared across goods and countries. For $f = x_1^{\alpha} x_2^{\beta}$ the elasticities are exactly $\alpha$ and $\beta$, and their sum $\alpha + \beta$ is the **returns to scale** (1: constant, above 1: increasing).

## Jacobian

- Entry $J_{ij}$: the effect of $x_j$ on output $i$. In a demand system the off-diagonal entries are cross-price effects.
- A square Jacobian with nonzero determinant means $F$ is locally invertible (**inverse function theorem**); this is also what makes comparative statics well defined (**implicit function theorem**) and Newton's method work.
- The rank tells how many independent directions the outputs can move in.

## Taylor Polynomials

The Taylor coefficient of $\Delta x^k$ is $f^{(k)}(x_0)/k!$. The polynomial is a good approximation near $x_0$; how far "near" extends depends on how fast the higher derivatives grow. Compare the approximation and the exact value that the Taylor Polynomial action reports.

## See Also
- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
