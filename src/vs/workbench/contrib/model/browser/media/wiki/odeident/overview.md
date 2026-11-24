# Structural Identifiability of ODEs: Overview

**Structural Identifiability of ODEs** asks, before any data are fitted, whether the parameters of an ordinary differential equation model could be recovered from perfect measurements of its outputs, with StructuralIdentifiability.jl.

## Why check structural identifiability before fitting?

Structural identifiability is a diagnostic in its own right: run before any fitting, it shows which parameters no amount of noise-free data on the chosen outputs could recover. [Dong, Goodbrake, Harrington and Pogudin (2023)](#ref-DGHP2023a) describe identifiability as a natural prerequisite for meaningful parameter estimation.

A parameter labelled `:nonidentifiable` will show a profile open on at least one side in Parameter Estimation for ODEs however good the data, since structural non-identifiability implies practical non-identifiability, as [Borisov and Metelkin (2020)](#ref-BM2020a) recall. Checking first saves fitting a parameter that the outputs cannot determine, and points to the measurement or the reparametrisation that would make it determinable.

## Which software does Structural Identifiability of ODEs use?

StructuralIdentifiability.jl implements the algorithm of [Dong, Goodbrake, Harrington and Pogudin (2023)](#ref-DGHP2023a). The model is written with its `@ODEmodel` macro: one equation for the derivative of each state and one for each output, with the parameters as symbols. The panel calls four of its functions:

| Function | Answers |
|---|---|
| `assess_identifiability` | Is each parameter and state globally, locally or not identifiable? |
| `assess_local_identifiability` | Is each one locally identifiable, from one experiment or from several? |
| `find_identifiable_functions` | Which functions of the parameters are identifiable? |
| `reparametrize_global` | How can the model be rewritten in identifiable variables? |

## Which model does Structural Identifiability of ODEs check?

The Identifiability tab checks the Michaelis–Menten model that Parameter Estimation for ODEs and Bayesian Inference for ODEs fit: a substrate S binds an enzyme E into a complex SE at rate c1, the complex falls apart at rate c2, and it turns into a product P at the known rate c3 = 3. The enzyme, the complex and the product start at known values, and only the initial substrate is unknown.

**Observed Outputs** sets what is measured: S + E and P, as in the estimation panels, P only, or S + E only. The same model in all three panels lets a structural verdict be set against the practical identifiability that the profiles and the posterior show.

## How is Structural Identifiability of ODEs organised?

The Example Code prints the label of every parameter and state and the identifiable combinations. The Next Steps take the same model further:

| Group | Action | What it does |
|---|---|---|
| Diagnose | **Local Identifiability** | The local check, with every initial value unknown |
| Compare | **Known and Unknown Initial Values** | Global identifiability with E, SE and P known, and with no initial value known |
| Compare | **One and Several Experiments** | Local identifiability of the parameters from one experiment and from several |
| Interpret | **Reparametrisation** | The model in new, identifiable variables |

The model uses no data, so there is nothing to plot or predict.

## References

<a id="ref-BM2020a"></a>Borisov, I., & Metelkin, E. (2020). Confidence Intervals by Constrained Optimization—An Algorithm and Software Package for Practical Identifiability Analysis in Systems Biology. *PLOS Computational Biology* 16(12), e1008495. [doi:10.1371/journal.pcbi.1008495](https://doi.org/10.1371/journal.pcbi.1008495)

<a id="ref-DGHP2023a"></a>Dong, R., Goodbrake, C., Harrington, H. A., & Pogudin, G. (2023). Differential Elimination for Dynamical Models via Projections with Applications to Structural Identifiability. *SIAM Journal on Applied Algebra and Geometry* 7(1), 194-235. [doi:10.1137/22M1469067](https://doi.org/10.1137/22M1469067)

## See Also

- [Factsheet](factsheet.md) · [Identifiability](identifiability.md)
- Parameter Estimation for ODEs: [Overview](../ode/overview.md) · Bayesian Inference for ODEs: [Overview](../odebayes/overview.md)
