# System Identification Methods: Subspace (N4SID)

The **N4SID** tab estimates a state-space model with `n4sid(d, nx)`, the subspace algorithm of Van Overschee and De Moor, which determines the order, the states and the system matrices from the input-output data by projections and singular value decompositions.

## The model

[Van Overschee and De Moor (1995)](#ref-OM1995a) state the problem for a combined deterministic-stochastic system

x(k+1) = A x(k) + B u(k) + w(k),
y(k) = C x(k) + D u(k) + v(k),

where w(k) and v(k) are unobserved, Gaussian, zero-mean white noise sequences with covariances Q, R and cross-covariance S, {A, C} is observable and {A, [B Q^½]} is controllable. Given the inputs and outputs, the task is to find A, B, C, D, Q, R and S up to a similarity transformation.

The package returns an `N4SIDStateSpace`, which the ControlSystemIdentification.jl documentation describes as a state-space object with an observer gain matrix K, a Kalman filter, and estimated covariance matrices.

## Two steps

[Van Overschee and De Moor (1995)](#ref-OM1995a) describe subspace algorithms in two steps. In the first, the algorithm computes from the data a subspace that coincides with the column space of the extended observability matrix Γᵢ, whose dimension is the order n of the system. In the second, either A and C follow from the shift invariance of that subspace, or, as in N4SID, two state sequences are determined and combined with the data, so that all the system matrices follow from a set of equations solved by least squares.

The package documentation states that `n4sid` implements the simplified algorithm, alg 2, from the N4SID paper of [Van Overschee and De Moor (1994)](#ref-OM1994b). [Van Overschee and De Moor (1995)](#ref-OM1995a) count MOESP and N4SID as the two algorithms based on geometrical and linear algebra concepts, while CVA rests on statistical arguments and principal angles and directions.

## Projections and singular values

In the unifying theorem of [Van Overschee and De Moor (1995)](#ref-OM1995a), the basic matrix is the oblique projection of the future outputs along the future inputs on the past inputs and outputs. The goal they state is to predict the future outputs as accurately as possible from the past and the future inputs, with a model as compact as possible.

The order equals the number of non-zero singular values of the weighted projection. When the singular values are all different from zero, the order is chosen equal to the number of dominant singular values, and the error induced by the reduction is given by the discarded ones. The tooltip of **nx** suggests the singular values for choosing the number of states.

## The states as Kalman filter estimates

[Van Overschee and De Moor (1995)](#ref-OM1995a) define the state sequence Xᵢ as in the N4SID paper: each column is the output of a non-steady-state Kalman filter built from the system matrices, so that the columns are the outputs of a bank of Kalman filters in parallel. The point, they write, is that the sequence can be obtained directly from the input-output data, without knowledge of the system matrices.

## Weightings: N4SID, MOESP and CVA

[Van Overschee and De Moor (1995)](#ref-OM1995a) show that N4SID, MOESP and CVA use exactly the same subspace to determine the order and the extended observability matrix, and differ only in the weighting matrices W₁ and W₂ of the theorem. N4SID has W₁ = I and W₂ = I.

| Algorithm | Name | Authors named in the paper |
|---|---|---|
| N4SID | Numerical algorithms for subspace state space system identification | Van Overschee and De Moor |
| MOESP | Multivariable output-error state space | Verhaegen |
| CVA | Canonical variate analysis | Larimore |

The documentation describes `subspaceid`, the newer implementation, which chooses the weighting among `:MOESP`, `:CVA`, `:N4SID` and `:IVM`, with `:MOESP` as the default.

## The horizon

**l (horizon)** is passed to `n4sid` as the keyword `i`, which the package documentation describes as an algorithm parameter that generally needs no tuning; left blank, the package default is used. [Van Overschee and De Moor (1995)](#ref-OM1995a) call i a user-defined index that is "large enough": it is the number of block rows of the extended observability matrix Γᵢ, with i > n, and the theorem assumes an input persistently exciting of order 2i.

The tooltip of **l (horizon)** reads that larger values improve accuracy but increase computation.

## References

<a id="ref-OM1994b"></a>Van Overschee, P., & De Moor, B. (1994). N4SID: Subspace Algorithms for the Identification of Combined Deterministic-Stochastic Systems. *Automatica* 30(1), 75-93. [doi:10.1016/0005-1098(94)90230-5](https://doi.org/10.1016/0005-1098(94)90230-5)

<a id="ref-OM1995a"></a>Van Overschee, P., & De Moor, B. (1995). A Unifying Theorem for Three Subspace System Identification Algorithms. *Automatica* 31(12), 1853-1864. [doi:10.1016/0005-1098(95)00072-0](https://doi.org/10.1016/0005-1098(95)00072-0)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [ARX / ARMAX](arx-armax.md) · [Output Error](output-error.md)
