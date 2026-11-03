# Infinite Horizon LQR

With no final time, the problem looks the same from every step, so the optimal gain does not change. Both models in the panel use that stationary gain, and the discrete algebraic Riccati equation is what produces it.

## Where does the Riccati equation come from?

The total cost from a state x under the best policy must have the form x' P x. Bellman's principle says that this equals the best stage cost plus the same form at the next state:

x' P x = min over u of [x' Q x + u' R u + (A x + B u)' P (A x + B u)]

Setting the derivative in u to zero gives u = −K x, with K = (R + B' P B)^(−1) B' P A. Substituting that back, and asking for equality at every x, leaves the equation for P:

P = Q + A' P A − A' P B (R + B' P B)^(−1) B' P A

The derivation by dynamic programming is standard, as in [Bertsekas (2017)](#ref-Ber2017a), and the equation is the fixed point of the recursion on the [Finite Horizon](finitehorizon.md) wiki.

## Why does the equation have several solutions?

An algebraic Riccati equation is quadratic in P, so it has several symmetric solutions in general. The panel needs one in particular, the stabilising solution: the one for which A − B K has all its eigenvalues inside the unit circle.

| Condition | What it guarantees |
|---|---|
| (A, B) stabilisable | A stabilising gain exists, so the optimal cost is finite |
| (A, Q^(1/2)) detectable | The solution is the unique positive semidefinite one, and it stabilises |
| R positive definite | The inverse in K exists |

**Controllability & Observability** tests the stronger forms of the first two. `ared` in **Predicted Cost** returns the stabilising solution in `riccati_solution`.

## How is P computed?

Iterating the recursion would work, but it can converge slowly, and rounding builds up when poles lie near the unit circle. Direct solvers compute P in one pass from a matrix of size 2n.

[Laub (1979)](#ref-Lau1979a) introduced the approach that uses Schur vectors of that matrix, which covers both the continuous and the discrete equation and gains substantial numerical advantages over the eigenvector method. The stable invariant subspace of the 2n problem contains P, so the solution appears as a ratio of two blocks. An R that is tiny relative to Q, or poles very near the circle, makes the problem harder for any solver.

## What does the cost prediction mean?

With P in hand, the total cost from any x0 is known without simulation: x0' P x0. **Predicted Cost** gives it as `predicted_cost`, next to `simulated_cost` over **Steps**.

The simulated figure sums only the first **Steps** terms, so on **State-Feedback LQR** it approaches the prediction from below as **Steps** grows. Two checks follow. If the two disagree after the state has settled, an input is inconsistent. And if the prediction is much larger than expected, some state is expensive to bring back, which the diagonal of `riccati_solution` can identify. Noise changes the problem, because the sum then grows without limit, so the [Output-Feedback](outputfeedback.md) wiki works with a cost per step.

## Is the closed loop always stable?

Under stabilisability and detectability, yes, for every Q and R that satisfy them. Stability comes from the optimisation and is not imposed separately, since an unstable closed loop with a detectable cost would have infinite cost.

That result holds for the design model. A real plant that differs from A and B may do something else, and the loop has only as much tolerance as **Stability Margins** reports. In discrete time, unlike in the continuous case, no large fixed margin comes with the design. The textbook background on the regulator is in [Kirk (2012)](#ref-Kir2012a).

## Why discount is not used here

The cost has no discount factor, so every step counts the same, and that is why stability is built in: a state that does not decay keeps adding to the sum.

A discount g < 1 is common in economics and in **Reinforcement Learning**. It reduces to the same equation with A and B scaled by sqrt(g), but its optimal policy need not stabilise the original system, because cost far in the future counts for little. To explore this, design with `sqrt(g) .* A` and `sqrt(g) .* B` in the code, and then check `eigvals(A - B * K)` with the original A and B.

## References

<a id="ref-Ber2017a"></a>Bertsekas, D. P. (2017). *Dynamic Programming and Optimal Control, Vol. 1* (4th ed.). Athena Scientific.

<a id="ref-Kir2012a"></a>Kirk, D. E. (2012). *Optimal Control Theory: An Introduction*. Dover Publications.

<a id="ref-Lau1979a"></a>Laub, A. J. (1979). A Schur Method for Solving Algebraic Riccati Equations. *IEEE Transactions on Automatic Control* 24(6), 913-921. [doi:10.1109/TAC.1979.1102178](https://doi.org/10.1109/TAC.1979.1102178)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [State-Feedback](statefeedback.md) · [Output-Feedback](outputfeedback.md) · [Finite Horizon](finitehorizon.md)
