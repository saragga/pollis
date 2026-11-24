# Structural Identifiability of ODEs: Factsheet

The panel's tab, functions, inputs and sources at a glance.

## What does each function of Structural Identifiability of ODEs return?

| Function | Where | Output | Initial values |
|---|---|---|---|
| `assess_identifiability` | Example Code; **Known and Unknown Initial Values** | `:globally`, `:locally` or `:nonidentifiable` for every parameter and state | E, SE and P known, or none |
| `find_identifiable_functions` | Example Code | The identifiable functions of the parameters | E, SE and P known |
| `assess_local_identifiability` | **Local Identifiability**; **One and Several Experiments** | `true` or `false` for every function checked; for several experiments, also their number | None known |
| `reparametrize_global` | **Reparametrisation** | The new model, the meaning of its variables, and any relations among them | None known |

## What are the inputs of Structural Identifiability of ODEs?

| Input | Default | Options |
|---|---|---|
| **Observed Outputs** | S + E and P | S + E and P; P Only; S + E Only |

The probability of correctness, `prob_threshold`, is left at its default of 0.99 in every call. **Observed Outputs** changes the output equations of `@ODEmodel`: P Only leaves out y1 = S + E, and S + E Only leaves out y2 = P. The Next Steps take the model as the Example Code last built it, so they follow the same choice.

## Which model does Structural Identifiability of ODEs check?

| Item | Value |
|---|---|
| Reactions | S + E → SE (c1), SE → S + E (c2), SE → P + E (c3 = 3, substituted) |
| Unknown parameters | c1, c2 |
| Initial values | S unknown; E, SE and P known (50, 0 and 0 in the estimation panels) |
| Outputs | y1 = S + E and y2 = P, as **Observed Outputs** sets |

## Which results does Structural Identifiability of ODEs build on?

| Result | Source |
|---|---|
| A randomised algorithm for structural identifiability by differential elimination | [Dong, Goodbrake, Harrington and Pogudin (2023)](#ref-DGHP2023a) |
| Profile likelihood detects structural and practical non-identifiability | [Raue, Kreutz, Maiwald, Bachmann, Schilling, Klingmüller and Timmer (2009)](#ref-RKMBS...2009a) |
| Structural and practical identifiability as two approaches, the first independent of data | [Borisov and Metelkin (2020)](#ref-BM2020a) |

## References

<a id="ref-BM2020a"></a>Borisov, I., & Metelkin, E. (2020). Confidence Intervals by Constrained Optimization—An Algorithm and Software Package for Practical Identifiability Analysis in Systems Biology. *PLOS Computational Biology* 16(12), e1008495. [doi:10.1371/journal.pcbi.1008495](https://doi.org/10.1371/journal.pcbi.1008495)

<a id="ref-DGHP2023a"></a>Dong, R., Goodbrake, C., Harrington, H. A., & Pogudin, G. (2023). Differential Elimination for Dynamical Models via Projections with Applications to Structural Identifiability. *SIAM Journal on Applied Algebra and Geometry* 7(1), 194-235. [doi:10.1137/22M1469067](https://doi.org/10.1137/22M1469067)

<a id="ref-RKMBS...2009a"></a>Raue, A., Kreutz, C., Maiwald, T., Bachmann, J., Schilling, M., Klingmüller, U., & Timmer, J. (2009). Structural and Practical Identifiability Analysis of Partially Observed Dynamical Models by Exploiting the Profile Likelihood. *Bioinformatics* 25(15), 1923-1929. [doi:10.1093/bioinformatics/btp358](https://doi.org/10.1093/bioinformatics/btp358)

## See Also

- [Overview](overview.md) · [Identifiability](identifiability.md)
