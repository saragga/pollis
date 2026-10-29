# Decision Guide

| Situation | Model | Setting |
|---|---|---|
| Few predictors matter, you want them named | **Lasso** | alpha = 1, lambda by BIC or the 1-SE rule |
| Groups of correlated predictors, sparsity wanted | **ElasticNet** | alpha around 0.5 |
| Many small effects, prediction only | **ElasticNet** near ridge | alpha close to 0 |
| Very many correlated predictors, a few underlying factors | **PLSR** | Components by cross-validation |
| Few predictors, many observations | Least squares | See Linear Regression |

## Decision Flow

1. **Is the goal prediction or selection?** For prediction, choose lambda by cross-validation at the minimum error; for a sparse, interpretable model, by BIC or the one-standard-error rule.
2. **Are the predictors strongly correlated?** The lasso picks among them arbitrarily: use the elastic net, or PLSR.
3. **More predictors than observations?** The lasso selects at most n of them; the elastic net can keep more.
4. **Check Selection Stability** before reporting which predictors were selected.
5. **Check the Cross-Validated RMSE against OLS**: if the penalised model does not predict better, the simpler model may do.

## Choosing Alpha
Try a few values (1, 0.75, 0.5, 0.25) and compare the cross-validated error. Results are often close; prefer the sparser model when they are.

## Rules of Thumb
- **Standardise** predictors for PLSR if their units differ; Lasso.jl does it for you.
- **Do not report p-values** from a refit on the selected predictors: they ignore the selection.
- **Refit OLS on the selected predictors** (the relaxed lasso) only to reduce shrinkage, not for inference.

## See Also
- [Overview](overview.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
