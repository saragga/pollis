# Assumptions

## The Instruments
- **Relevance.** The excluded instruments predict the endogenous regressors, given the exogenous ones. This is testable: the first-stage F.
- **Exclusion (exogeneity).** The instruments are uncorrelated with the structural error: they affect the response only through the endogenous regressors, and are not themselves correlated with the omitted variables. This is an argument, not a test; with overidentification the Sargan test checks only whether the instruments agree with each other.
- **Order condition.** At least as many excluded instruments as endogenous regressors.

## The Model
- **Linearity** of the structural equation, and a correctly specified set of exogenous regressors: a control left out of the equation but correlated with an instrument breaks exclusion.
- **Exogenous regressors** really are exogenous; they serve as their own instruments.
- **Homogeneous effects**, or else monotonicity: with effects that differ across units, 2SLS estimates a local average treatment effect, which needs the instrument to push everyone's treatment in the same direction.

## The Errors
- **Independent** observations for classical and robust errors; **clustered** errors allow correlation within groups and need enough clusters (30 to 50 or more).
- Classical errors also assume **constant variance**; robust (HC1) errors drop it.

## Sample Size
2SLS is consistent but **biased in finite samples**, toward OLS, by an amount that grows with the number of instruments and shrinks with their strength. With a weak first stage the bias can be large even with many observations.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
