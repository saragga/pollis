# Uncertainty-Set Robust Optimisation: Factsheet

The panel's problem, uncertainty sets, inputs, outputs and sources at a glance.

## The problem

| Item | Value |
|---|---|
| Nominal problem | Maximise cᵀx subject to Ax ≤ b and x ≥ 0 |
| Uncertain data | The coefficients aᵢⱼ of **Resource Use A**; **Profit c** and **Capacity b** are certain |
| Deviations | aᵢⱼ = a⁰ᵢⱼ + âᵢⱼ uⱼ, with âᵢⱼ = ρ ∣a⁰ᵢⱼ∣ and ρ the **Relative Deviation (rho)** |
| Robust constraint | a⁰ᵢᵀx + maxᵤ∈𝒰 Σⱼ âᵢⱼ uⱼ xⱼ ≤ bᵢ, for each row i separately |
| Default data | Two products, c = (5, 4), and four constraints |

Coefficients equal to 0 have âᵢⱼ = 0 and are therefore certain. [Bertsimas and Sim (2004)](#ref-BS2004b) model each uncertain coefficient in the same way, as a value in [aᵢⱼ − âᵢⱼ, aᵢⱼ + âᵢⱼ].

## Uncertainty sets

| Set | 𝒰 | Protection term, for x ≥ 0 | Robust counterpart | Source |
|---|---|---|---|---|
| **Box** | ‖u‖∞ ≤ 1 | Σⱼ âᵢⱼ xⱼ | LP | [Soyster (1973)](#ref-Soy1973a) |
| **Ellipsoidal** | ‖u‖₂ ≤ ω | ω ‖(âᵢⱼ xⱼ)ⱼ‖₂ | Second-order cone programme | [Ben-Tal and Nemirovski (1998)](#ref-BN1998a) |
| **Budgeted** | ‖u‖∞ ≤ 1, ‖u‖₁ ≤ Γ | The Γ largest âᵢⱼ xⱼ | LP | [Bertsimas and Sim (2004)](#ref-BS2004b) |
| **Polyhedral** | ‖u‖₁ ≤ Γ, written as W u ≤ h | Γ maxⱼ âᵢⱼ xⱼ | LP through duality | [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) |

## Inputs

| Input | Default | Sets |
|---|---|---|
| **Profit c** | [5.0, 4.0] | all |
| **Resource Use A** | [6.0 4.0; 1.0 2.0; -1.0 1.0; 0.0 1.0] | all |
| **Capacity b** | [24.0, 6.0, 1.0, 2.0] | all |
| **Relative Deviation (rho)** | 0.1 | all |
| **Ellipsoid Radius (omega)** | 1.0 | Ellipsoidal |
| **Budget (Gamma)** | 1.0 | Budgeted, Polyhedral |

## Solvers

The robust counterparts are written in JuMP, by [Dunning, Huchette and Lubin (2017)](#ref-DHL2017a), a modelling language for linear, mixed-integer, quadratic, conic-quadratic, semidefinite and nonlinear problems. The LPs go to HiGHS, whose dual revised simplex method is described by [Huangfu and Hall (2018)](#ref-HH2018a); the second-order cone programme of the **Ellipsoidal** set goes to Clarabel, the interior-point solver for conic programmes of [Goulart and Chen (2024)](#ref-GC2024a).

## Outputs

| Output | Meaning |
|---|---|
| `robust_x` | The robust optimal production plan |
| `robust_profit` | Its profit at the nominal prices, cᵀx |
| `nominal_profit` | The optimal profit of the nominal problem |
| `price_of_robustness_percent` | 100 × (1 − robust profit / nominal profit) |
| `solved` | Whether the solver returned a feasible optimal solution |

## Actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Robust Frontier**, **Feasible Region** | Robust profit for ρ from 0 to 0.5; nominal and robust feasible sets for two products |
| Diagnose | **Worst-Case Scenario**, **Nominal Suboptimality** | Use of each resource at the worst coefficients; profit given up and worst overshoot |
| Predict | **Price of Robustness**, **Violation Probability** | Profit and simulated violation against the protection level; violation per constraint |
| Compare | **Scenario Approach**, **All Sets vs Nominal** | Robust against sampled-constraint solutions; every set at the current inputs |
| Interpret | **Conservatism Analysis**, **Shadow Prices** | Slack and protection per constraint; value of one more unit of capacity |

## Further reading

| Topic | Source |
|---|---|
| Robust counterparts of uncertain linear problems, and their probabilistic guarantees | [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) |
| Robust convex optimisation with ellipsoidal sets | [Ben-Tal and Nemirovski (1998)](#ref-BN1998a) |
| The budget of uncertainty and the price of robustness | [Bertsimas and Sim (2004)](#ref-BS2004b) |
| Robust discrete optimisation and network flows | [Bertsimas and Sim (2003)](#ref-BS2003a) |
| Linear programming and duality | [Bertsimas and Tsitsiklis (1997)](#ref-BT1997a) |
| The first robust linear programme | [Soyster (1973)](#ref-Soy1973a) |

## References

<a id="ref-BGN2009a"></a>Ben-Tal, A., El Ghaoui, L., & Nemirovski, A. (2009). *Robust Optimization*. Princeton University Press. [doi:10.1515/9781400831050](https://doi.org/10.1515/9781400831050)

<a id="ref-BN1998a"></a>Ben-Tal, A., & Nemirovski, A. (1998). Robust Convex Optimization. *Mathematics of Operations Research* 23(4), 769-805. [doi:10.1287/moor.23.4.769](https://doi.org/10.1287/moor.23.4.769)

<a id="ref-BS2003a"></a>Bertsimas, D., & Sim, M. (2003). Robust Discrete Optimization and Network Flows. *Mathematical Programming* 98(1-3), 49-71. [doi:10.1007/s10107-003-0396-4](https://doi.org/10.1007/s10107-003-0396-4)

<a id="ref-BS2004b"></a>Bertsimas, D., & Sim, M. (2004). The Price of Robustness. *Operations Research* 52(1), 35-53. [doi:10.1287/opre.1030.0065](https://doi.org/10.1287/opre.1030.0065)

<a id="ref-BT1997a"></a>Bertsimas, D., & Tsitsiklis, J. N. (1997). *Introduction to Linear Optimization*. Athena Scientific. [athenasc.com](http://www.athenasc.com/linoptbook.html)

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J., & Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295-320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

<a id="ref-GC2024a"></a>Goulart, P. J., & Chen, Y. (2024). Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives. [doi:10.48550/arXiv.2405.12762](https://doi.org/10.48550/arXiv.2405.12762)

<a id="ref-HH2018a"></a>Huangfu, Q., & Hall, J. A. J. (2018). Parallelizing the Dual Revised Simplex Method. *Mathematical Programming Computation* 10(1), 119-142. [doi:10.1007/s12532-017-0130-5](https://doi.org/10.1007/s12532-017-0130-5)

<a id="ref-Soy1973a"></a>Soyster, A. L. (1973). Convex Programming with Set-Inclusive Constraints and Applications to Inexact Linear Programming. *Operations Research* 21(5), 1154-1157. [doi:10.1287/opre.21.5.1154](https://doi.org/10.1287/opre.21.5.1154)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Box Uncertainty](box.md) · [Ellipsoidal Uncertainty](ellipsoidal.md) · [Budgeted Uncertainty](budgeted.md) · [Polyhedral Uncertainty](polyhedral.md)
