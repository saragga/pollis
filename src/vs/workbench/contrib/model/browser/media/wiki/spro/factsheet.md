# Stochastic Programming: Factsheet

The panel's problem, formulations, inputs and actions at a glance.

## The problem

| Item | Setting |
|---|---|
| Decision | Units to order before each period's demand is known |
| Recourse | Sales up to the demand; leftover stock carried to the next period |
| Prices | Sale price 5.0, order cost 2.0, holding cost 0.5 per unit carried |
| Demand | S values drawn from Uniform(50, 150) with `MersenneTwister(1)`, each with probability 1/S |
| Demand per period | The same S values in every period, independent across periods |
| Last period | No order after the last demand |
| Objective | Minimise expected total cost |

## Formulations

| Tab | Model | Size | Output |
|---|---|---|---|
| **Two-Stage** | Extensive-form LP, T = 1 | S scenarios | Order, expected cost, expected profit |
| **Multistage** | Extensive-form LP on a scenario tree | S^T paths | First order, expected cost, number of paths |
| **SDDP** | `SDDP.LinearPolicyGraph` with T + 1 stages | **SDDP Iterations** forward and backward passes | First order, lower bound, simulated cost with its 95% half-width |

The extensive form is built with JuMP, presented by [Dunning, Huchette and Lubin (2017)](#ref-DHL2017a), and solved with HiGHS ([Huangfu and Hall (2018)](#ref-HH2018a)); the SDDP tab uses SDDP.jl ([Dowson and Kapelevich (2021)](#ref-DK2021b)), which implements the algorithm of [Pereira and Pinto (1991)](#ref-PP1991a).

## Inputs

| Input | Default | Tabs | Meaning |
|---|---|---|---|
| **Scenarios per Stage (S)** | 20 | All | Equally likely demand values per period |
| **Periods (T)** | 3 | Multistage, SDDP | Number of demand periods |
| **SDDP Iterations** | 100 | SDDP | Iteration limit of `SDDP.train` |

The tooltip of **Scenarios per Stage (S)** advises keeping S^T under about 10 000; with the defaults, the tree of the **Multistage** tab has 20³ = 8 000 paths.

## Actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Cost Distribution** | Histogram of total cost over the scenario paths or the SDDP simulations, with its mean |
| Visualise | **Decision Paths** | Sales and leftovers per scenario, or orders and stock along 30 paths |
| Diagnose | **Bound Gap** | Lower bound against an estimate of the cost of the chosen policy |
| Diagnose | **Scenario Count Study** | Optimal cost and first order as S grows |
| Predict | **Out-of-Sample** | Cost distribution on fresh demand scenarios |
| Predict | **Stage Plan** | Mean order, sales and stock per period |
| Compare | **Wait-and-See** | WS, RP and EEV, with EVPI = RP − WS and VSS = EEV − RP |
| Compare | **Extensive Form vs SDDP** | Cost, first order and run time of both methods |
| Interpret | **Value of Initial Stock** | Expected cost against the initial stock, and the value of one more unit |
| Interpret | **Critical Fractile** | Order-up-to levels against the newsvendor fractiles |

## Further reading

| Topic | Source |
|---|---|
| Two-stage models | [Dantzig (1955)](#ref-Dan1955a) |
| Scenario bundling and policy aggregation | [Rockafellar and Wets (1991)](#ref-RW1991a) |
| SDDP | [Pereira and Pinto (1991)](#ref-PP1991a), [Dowson and Kapelevich (2021)](#ref-DK2021b) and the SDDP.jl documentation |
| Textbooks | [Birge and Louveaux (2011)](#ref-BL2011a), [Shapiro, Dentcheva and Ruszczyński (2021)](#ref-SDR2021a) |
| Software | [Dunning, Huchette and Lubin (2017)](#ref-DHL2017a), [Huangfu and Hall (2018)](#ref-HH2018a) |

The SDDP.jl documentation includes an introductory theory tutorial that implements a simplified version of the algorithm with JuMP and HiGHS.

## References

<a id="ref-BL2011a"></a>Birge, J. R., & Louveaux, F. (2011). *Introduction to Stochastic Programming* (2nd ed.). Springer. [doi:10.1007/978-1-4614-0237-4](https://doi.org/10.1007/978-1-4614-0237-4)

<a id="ref-Dan1955a"></a>Dantzig, G. B. (1955). Linear Programming under Uncertainty. *Management Science* 1(3-4), 197-206. [doi:10.1287/mnsc.1.3-4.197](https://doi.org/10.1287/mnsc.1.3-4.197)

<a id="ref-DK2021b"></a>Dowson, O., & Kapelevich, L. (2021). SDDP.jl: A Julia Package for Stochastic Dual Dynamic Programming. *INFORMS Journal on Computing* 33(1), 27-33. [doi:10.1287/ijoc.2020.0987](https://doi.org/10.1287/ijoc.2020.0987)

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J., & Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295-320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

<a id="ref-HH2018a"></a>Huangfu, Q., & Hall, J. A. J. (2018). Parallelizing the Dual Revised Simplex Method. *Mathematical Programming Computation* 10(1), 119-142. [doi:10.1007/s12532-017-0130-5](https://doi.org/10.1007/s12532-017-0130-5)

<a id="ref-PP1991a"></a>Pereira, M. V. F., & Pinto, L. M. V. G. (1991). Multi-stage Stochastic Optimization Applied to Energy Planning. *Mathematical Programming* 52(1-3), 359-375. [doi:10.1007/BF01582895](https://doi.org/10.1007/BF01582895)

<a id="ref-RW1991a"></a>Rockafellar, R. T., & Wets, R. J-B. (1991). Scenarios and Policy Aggregation in Optimization Under Uncertainty. *Mathematics of Operations Research* 16(1), 119-147. [doi:10.1287/moor.16.1.119](https://doi.org/10.1287/moor.16.1.119)

<a id="ref-SDR2021a"></a>Shapiro, A., Dentcheva, D., & Ruszczyński, A. (2021). *Lectures on Stochastic Programming: Modeling and Theory* (3rd ed.). SIAM. [doi:10.1137/1.9781611976595](https://doi.org/10.1137/1.9781611976595)

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Two-Stage SP](two-stage.md) · [Multistage SP](multistage.md) · [SDDP](sddp.md)
