# System Identification Methods: Decision Guide

The choice of structure rests on the noise model, the number of inputs and outputs, and whether the model is for prediction or for simulation. The panel's decision table, the sources and the validation actions guide it.

## The decision table

| Tab | Form | Purpose in the panel |
|---|---|---|
| **ARX** | A(q)y = B(q)u + e | Autoregressive model with exogenous input, fast linear least-squares fit via `arx` |
| **ARMAX** | A(q)y = B(q)u + C(q)e | ARX with a coloured noise model; C(q) shapes the noise spectrum independently |
| **N4SID** | x′ = Ax + Bu + Ke, y = Cx + Du | Subspace identification of state-space models; handles MIMO systems and unknown model order |
| **OE** | y = [B(q)/F(q)]u + e | Output-error model, plant dynamics decoupled from the noise model |

## ARX or ARMAX

For least squares on an ARX model, [Söderström and Stoica (1989)](#ref-SS1989a) name white equation errors as the important case of consistency, and a large signal-to-noise ratio as the case of small bias. ARMAX adds the polynomial C(q), so that the equation error C(q)e(t) may be a moving average of white noise.

`arx` has a closed-form least-squares solution. `armax`, an alias for `plr`, first estimates a high-order ARX model for the residual sequence and then includes the estimated residuals in a second estimation problem, as the ControlSystemIdentification.jl documentation describes. The orders of the ARMAX grid in **Order Selection** keep nb ≤ na, which, the code comment states, `armax` needs.

## Polynomial or state space

[Van Overschee and De Moor (1995)](#ref-OM1995a) contrast subspace algorithms with the classical algorithms of Ljung and of Söderström and Stoica: the subspace algorithms do not suffer from the problems caused by a priori parametrisations and non-linear optimisations, and identify multi-input multi-output systems in a simple way.

**N4SID** needs only the number of states **nx**, while ARX and ARMAX need the orders **na**, **nb**, **nc** and the delay **nk**. The tooltip of **nx** suggests model order selection with the singular values to choose it; [Van Overschee and De Moor (1995)](#ref-OM1995a) choose the order as the number of "dominant" singular values when none of them is exactly zero.

## Prediction or simulation

The ControlSystemIdentification.jl documentation gives the trade-off: simulation tends to require accurate low-frequency properties, especially for integrating systems, while prediction favours an accurate model for higher frequencies. If there are significant input disturbances or the system is unstable, prediction focus is generally preferred.

The **OE** tab fits with `focus = :simulation`, minimising the simulation error; the documentation of `newpem` suggests that focus when the default prediction focus produces an unstable model for a stable system or poor simulation performance. The other three tabs give predictors with a noise model, used by **Predicted Output** and **k-Step Prediction**.

## Choosing orders

**Order Selection** refits the current structure over a grid and ranks the orders by the simulation fit on the validation data:

| Tab | Grid |
|---|---|
| **ARX** | na and nb from 1 to 4 |
| **ARMAX** | na from 1 to 4, nb from 1 to na |
| **N4SID** | nx from 1 to 8 |
| **OE** | nf from 1 to 4 |

The action description states that ranking by the fit on held-out data penalises overfitting directly.

## Comparing structures

**Compare Structures** fits ARX, ARMAX, N4SID and OE to the same estimation data with the current orders, prints the validation fit of each and overlays their Bode plots. **Residual Analysis** on each tab then shows the residual autocorrelation and the input-residual correlation of that structure, the quantities of the whiteness and independence tests of [Söderström and Stoica (1989)](#ref-SS1989a).

The four structures share the estimation data, the validation data and the fit criterion, so the printed fits are on the same scale.

## References

<a id="ref-SS1989a"></a>Söderström, T., & Stoica, P. (1989). *System Identification*. Prentice Hall. [user.it.uu.se](http://user.it.uu.se/~ts/sysidbook.pdf)

<a id="ref-OM1995a"></a>Van Overschee, P., & De Moor, B. (1995). A Unifying Theorem for Three Subspace System Identification Algorithms. *Automatica* 31(12), 1853-1864. [doi:10.1016/0005-1098(95)00072-0](https://doi.org/10.1016/0005-1098(95)00072-0)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [ARX / ARMAX](arx-armax.md) · [Subspace (N4SID)](n4sid.md) · [Output Error](output-error.md)
