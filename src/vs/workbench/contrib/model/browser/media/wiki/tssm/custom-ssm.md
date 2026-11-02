# State Space Models — Custom SSM

The **Custom SSM** tab simulates a time-invariant linear Gaussian model whose matrices you write yourself. It covers autoregressive, seasonal and combined forms, provided there is one observed series.

## What Model the Custom SSM Tab Simulates

The tab builds `LinearUnivariateTimeInvariant` from StateSpaceModels.jl with this form:

- y[t] = Z' alpha[t] + eps[t], with Var(eps[t]) = H
- alpha[t+1] = T alpha[t] + eta[t], with Var(eta[t]) = Q

R, the matrix that scales the state noise, is the identity, and the intercepts d and c are zero. The matrices do not change with time. `simulate` draws the path with a zero mean for the first state, and `signal` is computed as `alpha * Z_vec`. Nothing is estimated and no filter runs.

## Which Inputs Set the Custom SSM Tab

| Input | Role | Default |
|---|---|---|
| **State Dim (m)** | Number of states | 2 |
| **Obs. Dim (p)** | Must be 1 for this model type | 1 |
| **T Matrix (m x m)** | Moves the state one step forward | `[1.0 1.0; 0.0 1.0]` |
| **Z Matrix (p x m)** | Reads the observation from the state | `[1.0 0.0]` |
| **Q Matrix (m x m)** | Covariance of the state noise | `diagm([0.01, 0.001])` |
| **H Matrix (p x p)** | Variance of the observation noise, a one-element matrix | `[0.04]` |
| **Time Steps (n)**, **Seed** | Path length and random draws | 200, 42 |

## Why the Custom SSM Tab Needs One Observed Series

The inputs are labelled with p, but the code calls `vec` on **Z Matrix (p x m)** and `only` on **H Matrix (p x p)**, and the model type holds one observed series. A larger H stops the run with an error at `only`. A Z with more than one row is flattened into a single long vector, so the size check in the constructor stops the run. To simulate several linear channels in this panel, write the matrix products as f and h in **Nonlinear SSM**, whose noise inputs are limited to one level per block.

## How to Write Common Models as Custom SSM Matrices

| Model | **T Matrix (m x m)** | **Z Matrix (p x m)** | **Q Matrix (m x m)** |
|---|---|---|---|
| Local linear trend | `[1.0 1.0; 0.0 1.0]` | `[1.0 0.0]` | Level and slope variances on the diagonal |
| AR(1) with coefficient phi | `[phi;;]` | `[1.0;;]` | A one-element matrix with the shock variance |
| AR(2) with phi1 and phi2 | `[phi1 1.0; phi2 0.0]` | `[1.0 0.0]` | Shock variance in the first diagonal cell, zero elsewhere |

Each row assumes that **State Dim (m)** equals the size of the matrix. The forms follow the treatment in [Durbin and Koopman (2012)](#ref-DK2012a). Set **H Matrix (p x p)** to `[0.0]` to remove the measurement error.

## What the Eigenvalues of the T Matrix Decide

The eigenvalues of **T Matrix (m x m)** set the long-run behaviour of the simulated state. All of them inside the unit circle give a stationary state whose variance settles. An eigenvalue on the unit circle gives a random walk or a trend, which keeps widening. Any eigenvalue outside it gives exponential growth, and the path soon leaves any sensible range. Complex pairs give cycles, whose period follows from their angle. Check with `eigvals(T_mat)`, as the tab itself does not test this.

## What Requirements the Q and H Matrices Must Meet

**Q Matrix (m x m)** must be symmetric and positive semi-definite, since `simulate` takes a Cholesky-type factor of it. Zeros on its diagonal are allowed, and a state then moves without noise of its own. A matrix that is not positive semi-definite leads to an error message from the package, so check the diagonal and the signs of the off-diagonal terms. **H Matrix (p x p)** must be non-negative, as its square root scales the measurement error. Dimensions that disagree stop the run with a `DimensionMismatch`.

## Strengths and Limits of the Custom SSM Tab

The tab turns any time-invariant linear form with one observed series into a simulation, which suits a check that a matrix form behaves as intended before fitting it elsewhere. It gives true states against which an estimator can be tested. It cannot hold time-varying matrices, nonzero intercepts, a state noise loading R other than the identity, or inputs. A loading can be imitated through Q alone, by writing it as R Q R'. To compare, a form with a known structural version can be checked against **Linear Gaussian**.

## References

<a id="ref-DK2012a"></a>Durbin, J. and Koopman, S. J. (2012). *Time Series Analysis by State Space Methods*, 2nd edition. Oxford University Press. [doi:10.1093/acprof:oso/9780199641178.001.0001](https://doi.org/10.1093/acprof:oso/9780199641178.001.0001)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Linear Gaussian](linear-gaussian.md) · [Nonlinear SSM](nonlinear-ssm.md)
