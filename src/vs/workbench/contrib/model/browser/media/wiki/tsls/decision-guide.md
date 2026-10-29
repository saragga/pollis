# Decision Guide

| Situation | Choice |
|---|---|
| Independent observations | **Robust (HC1)** standard errors |
| Constant error variance, for textbook comparison | **Classical (Homoskedastic)** |
| Observations grouped (firms, regions) | **Clustered**, by the group |
| First-stage F below 10 | Report the **Anderson-Rubin** interval; look for stronger instruments |
| Many instruments, heteroskedastic errors | Two-step efficient GMM (see Generalized Method of Moments) |
| Instruments with entity fixed effects | IV / 2SLS in Linear Mixed-Effects Models |

## Decision Flow

1. **Is there a reason to think the regressor is endogenous?** Name it: an omitted variable, simultaneity, measurement error.
2. **Is there an instrument with a credible exclusion argument?** Without one, 2SLS adds nothing; consider bounds or another design.
3. **Is the first stage strong?** Check First-Stage Strength; if weak, rely on Anderson-Rubin.
4. **Is 2SLS needed?** If the Endogeneity Test does not reject, and the estimates are close, OLS is more precise.
5. **Overidentified?** Run the Sargan test; if it rejects, drop the least credible instruments, or accept that they identify different effects.

## Choosing Instruments
Fewer, stronger instruments are better than many weak ones: each weak instrument adds bias toward OLS. Every instrument needs its own exclusion argument.

## Rules of Thumb
- **Robust or clustered errors by default.**
- **Always report the first stage**: its coefficients, signs and F.
- **Be suspicious** of a 2SLS estimate far larger than OLS with a modest first stage.
- **Do not pick instruments** by whether they pass the Sargan test.

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
