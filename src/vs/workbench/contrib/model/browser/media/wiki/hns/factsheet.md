# Neighbourhood Search: Factsheet

A quick reference for **Neighbourhood Search**: six gradient-free or descent-based global searches on a box, with their settings and outputs. The code calls `Optim` and `NLopt` from Julia.

## Tabs, moves and acceptance

| Tab | Move | Local descent | Acceptance | Main setting |
|---|---|---|---|---|
| **CRS** | Reflect a simplex of population members | No | Replace the worst member | **Population** |
| **ILS** | Gaussian kick of the incumbent | Yes | Improvements only | **Perturbation Scale** |
| **LNS** | Re-sample some variables | Yes | Improvements only | **Destroy Fraction** |
| **ALNS** | Re-sample at a learned fraction | Yes | Improvements only | **Reaction Factor** |
| **BH** | Gaussian kick of the current basin | Yes | Metropolis | **Temperature**, **Perturbation Scale** |
| **SA** | Random step | No | Metropolis with cooling | **Cooling Rate (rt)** |

## Inputs and defaults

| Input | Default | Tabs | Effect |
|---|---|---|---|
| **Objective f(x)** | Rastrigin in two variables | All | Function to minimise |
| **Lower Bounds** | `[-5.12, -5.12]` | All | Length sets the dimension |
| **Upper Bounds** | `[5.12, 5.12]` | All | Upper edge of the box |
| **Budget** | 5000 | All | Objective evaluations |
| **Population** | 0 | **CRS** | 0 means 10(n + 1) |
| **Perturbation Scale** | 0.15 | **ILS**, **BH** | Kick as a fraction of box width |
| **Destroy Fraction** | 0.5 | **LNS** | Share of variables re-sampled |
| **Reaction Factor** | 0.2 | **ALNS** | Speed of the weight update |
| **Temperature** | 1.0 | **BH** | Worse by T accepted with probability exp(-1) |
| **Cooling Rate (rt)** | 0.9 | **SA** | Temperature multiplier per reduction |

## Settings worked out by hand

The default box is 10.24 wide in each direction. **Perturbation Scale** 0.15 therefore gives a kick with standard deviation 0.15 × 10.24 ≈ 1.54. The default **Population** is 10 × 3 = 30 for two variables.

Every search starts from the same point, `lb .+ 0.85 .* (ub .- lb)`, which is 3.584 in each coordinate on the default box. The starting point sits off centre on purpose, because the centre of that box is the optimum of the default objective.

## Results and actions

| Group | Action | Output |
|---|---|---|
| Visualise | **Objective Landscape** | Heatmap of the first two variables, every evaluated point, the best point |
| Visualise | **Convergence Curve** | Best value so far against evaluations |
| Diagnose | **Return Status** | `return_code`, `used`, `best_first_reached_at`, `improvements` |
| Diagnose | **Parameter Sensitivity** | `mean_best`, `worst_best` along the tab's grid |
| Predict | **Solution** | `best_point`, `best_value`, `gradient_norm`, `evaluations` |
| Predict | **Local Polish** | `polished_value`, `improvement` |
| Compare | **Compare vs CRS and SA** | `mean_best`, `worst_best`, `seconds_per_run` over 5 seeds |
| Compare | **Seed Robustness** | `mean`, `spread`, `share_within_1e_4_of_best` over 10 seeds |
| Interpret | **Algorithm Properties** | Tab-specific facts, such as `final_weights` or `hops_accepted` |
| Interpret | **Solution Summary** | `relative_position` and the bounds |

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [CRS](crs.md) · [ILS](ils.md) · [LNS](lns.md) · [ALNS](alns.md) · [Basin-Hopping](bh.md) · [Simulated Annealing](sa.md)
