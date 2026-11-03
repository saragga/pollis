# Stochastic Search with Local Refinement: Factsheet

The panel's methods, inputs, outputs and sources at a glance.

## Methods

| Method | Call | Random | Gradients | Source |
|---|---|---|---|---|
| **MLSL** | NLopt `G_MLSL_LDS` with **Local Optimiser** | Yes | Only with L-BFGS | [Rinnooy Kan and Timmer (1987)](#ref-KT1987a) |
| **StoGO-R** | NLopt `GD_STOGO_RAND` | Yes | Yes, from ForwardDiff | [Madsen and Zertchaninov (1998)](#ref-MZ1998a) |
| **TikTak** | MultistartOptimization.jl `TikTak` with an NLopt local method | No | Only with L-BFGS | [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) |

The local searches of MLSL and TikTak stop at a relative step tolerance `xtol_rel = 1e-6`. NLopt's random numbers are seeded with `NLopt.srand(seed)`, seed 1 in the main code.

## Inputs

| Input | Default | Methods |
|---|---|---|
| **Objective f(x)** | 20 + x[1]^2 + x[2]^2 - 10 * (cos(2pi * x[1]) + cos(2pi * x[2])) | all |
| **Lower Bounds** | [-5.12, -5.12] | all |
| **Upper Bounds** | [7.0, 6.0] | all |
| **Budget** | 2000 evaluations | all |
| **Local Optimiser** | BOBYQA; or Nelder-Mead, L-BFGS | MLSL, TikTak |

The length of **Lower Bounds** sets the dimension.

## TikTak in the panel

| Item | Value |
|---|---|
| Sobol points | A quarter of **Budget**, 500 by default |
| Starting points kept | The best 10% of the Sobol points |
| Local searches | Each limited to (**Budget** − Sobol points) / (`tiktak.initial_N` − 1) evaluations |
| Mixing weight | θᵢ = min(max(0.1, (i/N*)^½), 0.995), the rule of [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) |

## Outputs

| Output | Meaning |
|---|---|
| `best_point` | The best point found |
| `best_value` | f at the best point |
| `evaluations` | Number of objective evaluations recorded |
| `return_code` | NLopt's reason for stopping, `MAXEVAL_REACHED` when the budget is used up |

Every evaluation is also stored, as `res.points` and `res.values`, for **Objective Landscape**, **Convergence Curve** and **Return Status**.

## Actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Objective Landscape**, **Convergence Curve** | Heat map with all evaluations; best value against evaluations |
| Diagnose | **Return Status**, **Seed Robustness** | Meaning of the code, evaluation of the first hit; five seeds |
| Predict | **Solution**, **Local Polish** | Gradient norm at the best point; L-BFGS refinement |
| Compare | **Compare Methods**, **Budget Study** | Five or six methods over 3 seeds; budgets from 100 to 5000 |
| Interpret | **Algorithm Properties**, **Solution Summary** | What the method assumes; the solution within the box |

## Further reading

| Topic | Work |
|---|---|
| Clustering and multi-level methods | [Rinnooy Kan and Timmer (1987)](#ref-KT1987a) |
| StoGO | [Madsen and Zertchaninov (1998)](#ref-MZ1998a) |
| TikTak and a benchmark of global optimisers | [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) |
| NLopt's algorithms | [Johnson (2007)](#ref-Joh2007c) |
| ForwardDiff | [Revels, Lubin and Papamarkou (2016)](#ref-RLP2016a) |

Each method has its own page under Algorithm Details, with its global and local stages and the way the panel calls it.

## References

<a id="ref-AGK2019a"></a>Arnoud, A., Guvenen, F., & Kleineberg, T. (2019). *Benchmarking Global Optimizers*. NBER Working Paper 26340. National Bureau of Economic Research. [doi:10.3386/w26340](https://doi.org/10.3386/w26340)

<a id="ref-Joh2007c"></a>Johnson, S. G. (2007). The NLopt Nonlinear-Optimization Package. *NLopt Documentation*. [nlopt.readthedocs.io](https://nlopt.readthedocs.io/en/latest/)

<a id="ref-MZ1998a"></a>Madsen, K., & Zertchaninov, S. (1998). An Adaptive Approach to Stochastic Global Optimization. *Technical Report*.

<a id="ref-RLP2016a"></a>Revels, J., Lubin, M., & Papamarkou, T. (2016). Forward-Mode Automatic Differentiation in Julia. [arXiv:1607.07892](https://arxiv.org/abs/1607.07892)

<a id="ref-KT1987a"></a>Rinnooy Kan, A. H. G., & Timmer, G. T. (1987). Stochastic Global Optimization Methods Part I: Clustering Methods. *Mathematical Programming* 39(1), 57-78. [doi:10.1007/BF02592071](https://doi.org/10.1007/BF02592071)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MLSL](mlsl.md) · [StoGO-R](stogo-r.md) · [TikTak](tiktak.md)
