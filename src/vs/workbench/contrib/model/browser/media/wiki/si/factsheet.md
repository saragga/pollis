# System Identification Methods: Factsheet

The panel's model structures, inputs, default data and actions at a glance.

## Model structures

| Tab | Model | Julia call | Estimator in the documentation |
|---|---|---|---|
| **ARX** | A(q)y = B(q)u + e | `arx(d, na, nb; inputdelay = nk)` | Least squares, equation error minimisation, closed-form solution |
| **ARMAX** | A(q)y = B(q)u + C(q)e | `armax(d, na, nb, nc)` | Pseudo-linear regression; `armax` is an alias for `plr` |
| **N4SID** | x⁺ = Ax + Bu + Ke, y = Cx + Du + e | `n4sid(d, nx)` | Simplified algorithm (alg 2) of [Van Overschee and De Moor (1994)](#ref-OM1994b) |
| **OE** | y = [B(q)/F(q)]u + e | `newpem(d, nf; focus = :simulation)` | Prediction-error method, simulation focus |

The package is ControlSystemIdentification.jl, built on ControlSystems.jl of [Bagge Carlson, Fält, Heimerson and Troeng (2021)](#ref-CFHT2021a).

## Inputs

| Input | Default | Tabs | Meaning |
|---|---|---|---|
| **Output data (y)** | y | All | Measured output, sampled at a constant rate |
| **Input data (u)** | u | All | Measured input, n × 1 or n × m |
| **h** | 0.01 | All | Sample time in seconds |
| **na** | 2 | ARX, ARMAX | Order of A(q) |
| **nb** | 2 | ARX, ARMAX | Order of B(q) |
| **nc** | 1 | ARMAX | Order of C(q) |
| **nk** | 1 | ARX, ARMAX | Input delay in samples |
| **nx** | 4 | N4SID | Number of states |
| **l (horizon)** | blank | N4SID | Future horizon, passed as `i`; blank for the default |
| **nf** | 2 | OE | Order of F(q), the number of poles |

## Default data

When **Output data (y)** and **Input data (u)** keep their defaults, the code simulates 1 000 samples with seed 1:

| Item | Setting |
|---|---|
| Input | u = sign(randn), a random binary signal of +1 and −1 |
| Plant | y(t) = 1.5 y(t−1) − 0.7 y(t−2) + u(t−1) + 0.5 u(t−2) + e(t) |
| Noise | White, standard deviation 0.1 |
| Poles | 0.75 ± 0.37i |
| Split | First 700 samples for estimation, last 300 for validation |

The tooltip of **Output data (y)** notes that ARX with na = nb = 2 should recover these coefficients.

## Actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Bode Plot** | Magnitude and phase of the model |
| Visualise | **Predicted Output** | One-step-ahead prediction on the validation data |
| Visualise | **Pole-Zero Map** | Poles and zeros |
| Diagnose | **Residual Analysis** | Residual autocorrelation and input-residual correlation |
| Diagnose | **Fit Percentage** | Validation and estimation fit of the simulated output |
| Predict | **Simulate** | Response to a new random input, and simulation on the validation data |
| Predict | **k-Step Prediction** | Five-step-ahead prediction on the validation data |
| Compare | **Order Selection** | Orders ranked by validation fit |
| Compare | **Compare Structures** | The four structures by validation fit and Bode plot |
| Interpret | **Transfer Function** | Transfer function, poles and transmission zeros |
| Interpret | **Parameter Uncertainty** | ARX coefficients with standard deviations; Bode plots of refits on the two halves |

## Further reading

| Topic | Source |
|---|---|
| Model structures, least squares, prediction error methods, validation | [Söderström and Stoica (1989)](#ref-SS1989a) |
| N4SID | [Van Overschee and De Moor (1994)](#ref-OM1994b) |
| N4SID, MOESP and CVA in one theorem | [Van Overschee and De Moor (1995)](#ref-OM1995a) |
| ControlSystems.jl | [Bagge Carlson, Fält, Heimerson and Troeng (2021)](#ref-CFHT2021a) |

The ControlSystemIdentification.jl documentation describes the estimators, `iddata`, the validation plots and `modelfit`.

## References

<a id="ref-CFHT2021a"></a>Bagge Carlson, F., Fält, M., Heimerson, A., & Troeng, O. (2021). ControlSystems.jl: A Control Toolbox in Julia. *2021 60th IEEE Conference on Decision and Control (CDC)*. [doi:10.1109/CDC45484.2021.9683403](https://doi.org/10.1109/CDC45484.2021.9683403)

<a id="ref-SS1989a"></a>Söderström, T., & Stoica, P. (1989). *System Identification*. Prentice Hall. [user.it.uu.se](http://user.it.uu.se/~ts/sysidbook.pdf)

<a id="ref-OM1994b"></a>Van Overschee, P., & De Moor, B. (1994). N4SID: Subspace Algorithms for the Identification of Combined Deterministic-Stochastic Systems. *Automatica* 30(1), 75-93. [doi:10.1016/0005-1098(94)90230-5](https://doi.org/10.1016/0005-1098(94)90230-5)

<a id="ref-OM1995a"></a>Van Overschee, P., & De Moor, B. (1995). A Unifying Theorem for Three Subspace System Identification Algorithms. *Automatica* 31(12), 1853-1864. [doi:10.1016/0005-1098(95)00072-0](https://doi.org/10.1016/0005-1098(95)00072-0)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [ARX / ARMAX](arx-armax.md) · [Subspace (N4SID)](n4sid.md) · [Output Error](output-error.md)
