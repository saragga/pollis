# System Identification Methods: Overview

System identification builds a dynamic model of a system from measured inputs and outputs. The panel fits four linear model structures with ControlSystemIdentification.jl, ARX, ARMAX, a subspace state-space model and an output-error model, and validates each one on held-out data.

## A general model structure

[Söderström and Stoica (1989)](#ref-SS1989a) write the general linear model structure as

y(t) = G(q⁻¹; θ) u(t) + H(q⁻¹; θ) e(t),

where q⁻¹ is the backward shift operator, q⁻¹u(t) = u(t − 1), e(t) is white noise, G is the filter from the input to the output, H the filter from the noise to the output, and θ the vector of parameters.

The four tabs of the panel differ in how G and H are parametrised:

| Tab | Model | G | H |
|---|---|---|---|
| **ARX** | A(q)y = B(q)u + e | B/A | 1/A |
| **ARMAX** | A(q)y = B(q)u + C(q)e | B/A | C/A |
| **N4SID** | x⁺ = Ax + Bu + Ke, y = Cx + Du + e | State-space input path | Noise path through the gain K |
| **OE** | y = [B(q)/F(q)]u + e | B/F | 1 |

## Polynomial models

[Söderström and Stoica (1989)](#ref-SS1989a) introduce the ARMAX model, A(q⁻¹)y(t) = B(q⁻¹)u(t) + C(q⁻¹)e(t), as an ARMA model with an exogenous signal, and the ARX model as its special case with no C polynomial, which can in some sense be viewed as a linear regression.

They call least squares for the ARX model the equation error method and interpret it as the minimiser of the sum of squared prediction errors of the predictor ŷ(t) = φᵀ(t)θ. Prediction error methods and instrumental variable methods are their two modifications of least squares. The output-error method minimises the sum of squared differences between y(t) and the output of B/A driven by u(t).

## Subspace methods

The package documentation states that `n4sid` implements the simplified algorithm, alg 2, of [Van Overschee and De Moor (1994)](#ref-OM1994b). [Van Overschee and De Moor (1995)](#ref-OM1995a) spell out N4SID as "numerical algorithms for subspace state space system identification".

[Van Overschee and De Moor (1995)](#ref-OM1995a) show that N4SID, MOESP and CVA are special cases of one unifying theorem and differ only in a weighting matrix. In their simulation example, the fourth-order system is identified equally well by the three algorithms, and the second-order approximation has the smallest variance with CVA, an observation they report from other simulation studies too but could not prove.

## Validation

Every tab splits the data into the first 70% for estimation and the last 30% for validation, and prints the fit of the simulated output on the validation data. [Söderström and Stoica (1989)](#ref-SS1989a) answer the question "is a model flexible enough?" in two ways: with plots and common sense, comparing the model output with the measured output, and with statistical tests on the residuals.

The actions follow both routes. **Predicted Output**, **Simulate**, **k-Step Prediction** and **Fit Percentage** compare outputs, and **Residual Analysis** plots the correlations that the tests use. **Order Selection** and **Compare Structures** rank models by their validation fit.

## The panel in Julia

```
data = iddata(y, u, h)
ntr = round(Int, 0.7 * length(data))
dtr, dval = data[1:ntr], data[ntr+1:end]
```

`iddata` holds the output, the input and the sample time **h**. ControlSystems.jl, presented by [Bagge Carlson, Fält, Heimerson and Troeng (2021)](#ref-CFHT2021a), provides the transfer-function and state-space types and the `bodeplot`, `pzmap` and `lsim` functions of the actions. The code of the **ARX** and **ARMAX** tabs builds the innovation-form predictor in observer canonical form, because the package predicts more than one step ahead only for state-space models.

## References

<a id="ref-CFHT2021a"></a>Bagge Carlson, F., Fält, M., Heimerson, A., & Troeng, O. (2021). ControlSystems.jl: A Control Toolbox in Julia. *2021 60th IEEE Conference on Decision and Control (CDC)*. [doi:10.1109/CDC45484.2021.9683403](https://doi.org/10.1109/CDC45484.2021.9683403)

<a id="ref-SS1989a"></a>Söderström, T., & Stoica, P. (1989). *System Identification*. Prentice Hall. [user.it.uu.se](http://user.it.uu.se/~ts/sysidbook.pdf)

<a id="ref-OM1994b"></a>Van Overschee, P., & De Moor, B. (1994). N4SID: Subspace Algorithms for the Identification of Combined Deterministic-Stochastic Systems. *Automatica* 30(1), 75-93. [doi:10.1016/0005-1098(94)90230-5](https://doi.org/10.1016/0005-1098(94)90230-5)

<a id="ref-OM1995a"></a>Van Overschee, P., & De Moor, B. (1995). A Unifying Theorem for Three Subspace System Identification Algorithms. *Automatica* 31(12), 1853-1864. [doi:10.1016/0005-1098(95)00072-0](https://doi.org/10.1016/0005-1098(95)00072-0)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [ARX / ARMAX](arx-armax.md) · [Subspace (N4SID)](n4sid.md) · [Output Error](output-error.md)
