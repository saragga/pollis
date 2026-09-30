# Integration — Overview

## Area and Accumulation

The definite integral is the limit of Riemann sums: split $[a, b]$ into $n$ pieces of width $h = (b - a)/n$ and add up rectangles,

$$\int_a^b f(x)\,dx = \lim_{n \to \infty} \sum_{i=1}^{n} f(x_i^*)\,h.$$

Area above the axis counts as positive and area below as negative. The **accumulation function** $F(x) = \int_a^x f(t)\,dt$ is the running total, and the **fundamental theorem of calculus** says $F'(x) = f(x)$: integration undoes differentiation. So if $G$ is any antiderivative of $f$, $\int_a^b f = G(b) - G(a)$.

Most integrals met in practice have no closed-form antiderivative ($e^{-x^2}$, for example), so they are computed numerically as a weighted sum of function values,

$$\int_a^b f(x)\,dx \approx \sum_{i} w_i\, f(x_i).$$

A **quadrature rule** is a choice of nodes $x_i$ and weights $w_i$.

## Fixed Rules

| Rule | Idea | Error for smooth $f$ |
|---|---|---|
| Midpoint | Rectangles at the midpoints | $O(h^2)$ |
| Trapezoid | Straight lines between the points | $O(h^2)$ |
| Simpson | Parabolas through each three points | $O(h^4)$ |
| Gauss-Legendre | $n$ optimally placed nodes, exact for polynomials of degree $2n - 1$ | Faster than any power of $1/n$ for analytic $f$ |

Halving $h$ divides the trapezoid error by about 4 and Simpson's by about 16.

## Adaptive Quadrature

**Gauss-Kronrod** (QuadGK, and QUADPACK before it) applies a Gauss rule and a Kronrod extension on each subinterval; their difference estimates the error. The subinterval with the largest error is split in two, and so on, until the total estimated error is below the tolerance. Effort goes where the integrand is difficult. Infinite limits are handled by a change of variables that maps $[0, \infty)$ to a finite interval.

## Several Variables

**Adaptive cubature** (HCubature, Genz-Malik) does the same on boxes in $\mathbb{R}^n$, splitting along the dimension with the largest error. It is very accurate in low dimensions, but its cost grows quickly with $n$.

**Monte Carlo** estimates the integral as the volume times the average of $f$ at random points:

$$\int_{\Omega} f \approx \frac{|\Omega|}{N}\sum_{i=1}^{N} f(X_i), \qquad \text{standard error} = \frac{|\Omega|\,s_f}{\sqrt{N}}.$$

The error falls like $N^{-1/2}$ whatever the dimension, so Monte Carlo wins in high dimensions and loses in low ones.

## Sampled Data

When $f$ is known only at points, the trapezoid rule joins them with straight lines and works for any spacing. Simpson's rule needs equal spacing and an even number of intervals.

## See Also
- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
