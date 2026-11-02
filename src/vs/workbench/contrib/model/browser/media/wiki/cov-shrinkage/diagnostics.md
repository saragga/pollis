# Diagnostics

The checks ask three things of an estimate: whether it can be inverted safely, how far it moved from the sample covariance, and whether it describes rows it did not see. The third matters most.

## How Conditioning Shows Whether an Estimate Is Safe to Invert

**Conditioning** reports the condition number, the smallest eigenvalue and positive definiteness, for both the sample covariance and the estimate.

| Result | Reading | What to do |
|---|---|---|
| Condition number well under that of the sample | The estimator stabilised the matrix | Go on to the held-out check |
| Condition number about the same | Little regularisation, as with n much greater than p | Check whether any regularisation is needed |
| `posdef` false, or a smallest eigenvalue near zero | Inverse unsafe, or impossible | Move to a shrinkage tab, as **Biweight** carries no guarantee here |

Low conditioning is not accuracy, because an identity matrix is perfectly conditioned too.

## How Distance from Sample Covariance Measures the Change

**Distance from Sample Covariance** gives the relative Frobenius distance and the largest change in any correlation. A value near zero means that the estimator did little, which is normal if n is much greater than p. A large relative distance means that the estimate leans mainly on its structure, so the structure must be credible. A large change in one correlation deserves attention, as a real relationship may have been pulled away. Use **Correlation Changes** to find which pair it is. No specific value is right, so read this step together with the held-out score.

## How Held-Out Log-Likelihood Scores an Estimate

**Held-Out Log-Likelihood** fits on a random half of the rows, scores the other half under a Gaussian density, and averages over 10 splits, for the estimate and for the sample covariance. Higher is better. A clear gain over the sample covariance says that regularisation helps on these data. A sample score of `-Inf` means that its matrix was singular on the fitting half in at least one split. A loss against the sample covariance suggests that the structure is wrong, or that regularisation is not needed. Because fits use half the rows, the score favours regularisation somewhat more than a fit on all rows would need.

## How Compare Estimators Ranks the Choices

**Compare Estimators** reports held-out log-likelihood and condition number for the sample covariance, Ledoit-Wolf with a constant correlation target, OAS with a common variance target, analytical nonlinear shrinkage, biweight and the current estimate. Look at the likelihood first, then at conditioning among those close to the best. Small gaps may not matter, since the score depends on the splits. **Woodbury** appears only as the current estimate, so run the step from that tab to include it.

## How Eigenvalue Spectrum Shows What Shrinkage Did

**Eigenvalue Spectrum** plots sorted eigenvalues of both matrices on a log scale. Good behaviour is a lift at the small end and a modest fall at the large end, with the order kept. A spectrum much flatter than the sample's means strong shrinkage, which can hide real factors. Zero or negative eigenvalues cannot be drawn on the log scale, so missing points are a warning in themselves. Under **Woodbury**, expect a few values standing above a flat level, and check that **Rank** fits the clear gap in the sample curve.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
