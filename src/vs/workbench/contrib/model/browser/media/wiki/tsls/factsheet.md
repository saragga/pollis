# Two-Stage Least Squares (2SLS) — Factsheet

In the structural equation y = X beta + e, some columns of X are correlated with e. Given instruments Z, uncorrelated with e and correlated with X, **2SLS** estimates beta = (X'P_Z X)^-1 X'P_Z y, where P_Z = Z(Z'Z)^-1 Z' projects onto the instruments: least squares on the part of X that the instruments explain.

| | |
|---|---|
| **Purpose** | Estimate causal (structural) coefficients when a regressor is endogenous |
| **Input** | A Tables.jl table, the names of the response, the exogenous and endogenous regressors and the excluded instruments; a cluster column for clustered errors |
| **Core packages** | [FixedEffectModels.jl](https://github.com/FixedEffects/FixedEffectModels.jl), [Distributions.jl](https://github.com/JuliaStats/Distributions.jl), [Tables.jl](https://github.com/JuliaData/Tables.jl) |
| **Standard errors** | Robust (HC1), Classical (Homoskedastic), Clustered |
| **Output** | Coefficients, standard errors, t statistics, p-values, confidence intervals, the Kleibergen-Paap first-stage F |
| **Key choice** | The instruments: they must be relevant (strong first stage) and excluded (no direct effect on the response) |

## When to Use

- **Omitted variables** affect both a regressor and the response (ability in the return to schooling, demand in the effect of advertising).
- **Simultaneity**: the response feeds back into the regressor (price and quantity, police and crime).
- **Measurement error** in a regressor, which biases OLS toward zero; a second measurement can instrument the first.
- **Natural experiments** and **encouragement designs**: a lottery, a rule or a distance that shifts treatment.

## What It Is Not

2SLS is only as good as its instruments. Exclusion cannot be tested when the model is just identified, and weak instruments make 2SLS biased toward OLS with misleading standard errors. With heterogeneous effects it estimates a **local average treatment effect**, for the units whose treatment the instrument moves. For efficient estimation with many instruments and heteroskedasticity, see Generalized Method of Moments; for instruments with fixed effects, Linear Mixed-Effects Models (IV / 2SLS).

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
