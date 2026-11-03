# Uncertainty-Set Robust Optimisation: Assumptions

What the robust counterparts assume about the data, the set and the decisions, and what the probabilistic guarantees add.

## Hard constraints and a known set

[Ben-Tal and Nemirovski (1998)](#ref-BN1998a) describe the setting of robust optimisation by two features: a crude knowledge of the data, of which all that is known is that they belong to a given uncertainty set, and constraints that must be satisfied whatever the actual realisation of the data in that set. The decision is taken before the data are known.

The panel follows that setting. A production plan x is chosen once, and each resource constraint must hold for every coefficient vector the set allows for its row. No probability distribution enters the robust counterpart; the set alone defines what the plan is protected against.

## Uncertainty in the constraint matrix

The panel's uncertain data are the coefficients of **Resource Use A**; **Profit c** and **Capacity b** are known. [Bertsimas and Sim (2004)](#ref-BS2004b) make the same assumption and note that it involves no loss of generality for the objective: an uncertain objective can be moved into the constraints by maximising z subject to z − cᵀx ≤ 0.

Each coefficient deviates around its nominal value by at most âᵢⱼ = ρ ∣a⁰ᵢⱼ∣, with ρ the **Relative Deviation (rho)**. A coefficient of 0 has no deviation and is certain, as the tooltip of **Relative Deviation (rho)** says. [Bertsimas and Sim (2004)](#ref-BS2004b) denote by Jᵢ the set of uncertain coefficients in row i and model each as a value in [aᵢⱼ − âᵢⱼ, aᵢⱼ + âᵢⱼ].

## Constraint-wise sets

The robust counterpart is taken row by row: each constraint has its own copy of the set, and its worst case is computed independently of the other rows. The protection term of row i is

maxᵤ∈𝒰 Σⱼ âᵢⱼ uⱼ xⱼ

and, since the plan satisfies x ≥ 0, depends only on the products âᵢⱼ xⱼ. [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) write an uncertain linear constraint in the same form, as a nominal constraint plus a combination of perturbations ζ from a perturbation set Z, which they assume convex.

## Tractable sets

The robust counterpart is an LP or a second-order cone programme only for certain sets. [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) give the explicit forms:

| Set | Robust counterpart of one linear constraint |
|---|---|
| Box, ‖ζ‖∞ ≤ 1 | A system of linear inequalities |
| Ball, ‖ζ‖₂ ≤ Ω | A conic quadratic inequality |
| Polyhedral | An explicit system of linear inequalities, by linear programming duality |
| Conic quadratic or semidefinite representable | An explicit system of conic inequalities, under a strict feasibility condition |

The panel's four sets fall in the first three rows.

## Random deviations

The probability bounds rest on further assumptions about the deviations. [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) assume that the perturbations ζℓ are independent, with mean 0 and ∣ζℓ∣ ≤ 1. Under that assumption, a solution of the ball robust counterpart violates the constraint with probability at most exp(−Ω²/2), and a solution of the budgeted robust counterpart with probability at most exp(−γ²/(2L)), with L the number of perturbations.

[Bertsimas and Sim (2004)](#ref-BS2004b) assume that the scaled deviations ηᵢⱼ = (ãᵢⱼ − aᵢⱼ)/âᵢⱼ are independent and symmetrically distributed in [−1, 1], and bound the probability of violating constraint i by exp(−Γᵢ²/(2∣Jᵢ∣)).

## The simulated deviations

**Violation Probability**, **Price of Robustness**, **Scenario Approach** and **All Sets vs Nominal** draw 10 000 coefficient matrices with every uncertain coefficient independent and uniform in [a⁰ᵢⱼ − âᵢⱼ, a⁰ᵢⱼ + âᵢⱼ], from a generator seeded at 7.

Uniform deviations are independent, symmetric, with mean 0 and bounded by 1 after scaling, so they meet the assumptions of both bounds. The simulated frequencies refer to this distribution; another distribution of the deviations within the same box may give other frequencies, while the worst-case guarantee of the set would stay the same.

## References

<a id="ref-BGN2009a"></a>Ben-Tal, A., El Ghaoui, L., & Nemirovski, A. (2009). *Robust Optimization*. Princeton University Press. [doi:10.1515/9781400831050](https://doi.org/10.1515/9781400831050)

<a id="ref-BN1998a"></a>Ben-Tal, A., & Nemirovski, A. (1998). Robust Convex Optimization. *Mathematics of Operations Research* 23(4), 769-805. [doi:10.1287/moor.23.4.769](https://doi.org/10.1287/moor.23.4.769)

<a id="ref-BS2004b"></a>Bertsimas, D., & Sim, M. (2004). The Price of Robustness. *Operations Research* 52(1), 35-53. [doi:10.1287/opre.1030.0065](https://doi.org/10.1287/opre.1030.0065)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Box Uncertainty](box.md) · [Ellipsoidal Uncertainty](ellipsoidal.md) · [Budgeted Uncertainty](budgeted.md) · [Polyhedral Uncertainty](polyhedral.md)
