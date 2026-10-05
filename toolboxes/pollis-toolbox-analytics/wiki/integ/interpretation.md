# Integration — Interpretation

## Signed Area and Total Area

The integral is a **signed** area: parts where $f < 0$ subtract. $\int_a^b |f|$ is the total area between the curve and the axis. If the two differ a lot, positive and negative parts are cancelling; say which one the question needs (net change or total variation).

## Average Value

$$\bar f = \frac{1}{b - a}\int_a^b f(x)\,dx$$

is the height of the rectangle with the same area: the average price over a period, the average cost per unit. For a multiple integral divide by the volume of the region.

## Economic Readings

| Integral | Meaning |
|---|---|
| $\int_0^q MC(s)\,ds$ | Total variable cost of producing $q$ |
| $\int_0^{q^*} \bigl(D(q) - p^*\bigr)\,dq$ | Consumer surplus |
| $\int_0^{T} f(t)\,e^{-rt}\,dt$ | Present value of an income stream at rate $r$ |
| $\int x\,p(x)\,dx$ | Expected value of a random variable with density $p$ |
| $\int_a^b p(x)\,dx$ | Probability that it lies in $[a, b]$ |

## Moving the Limits

By the **Leibniz rule**, moving the upper limit $b$ changes the integral at rate $f(b)$ and moving the lower limit at rate $-f(a)$. In economic terms: producing one more unit adds its marginal cost to total cost. The Limit Sensitivity action compares this prediction with the exact change.

## Present Value

Discounting shrinks late flows: at 5% a payment 20 years out is worth $e^{-1} \approx 37\%$ of its face value. With $b = \infty$ a constant flow $c$ has present value $c / r$.

## See Also
- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
