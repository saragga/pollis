# Power Cone

The **power cone** with exponent a in (0, 1) is {(x, y, z): x >= 0, y >= 0, x^a y^(1 - a) >= |z|}. It represents powers |z|^p for any p >= 1, **p-norms**, and **geometric means**.

## The Panel's Model
The **Power Cone** model is a **p-norm regression**:

    minimise   sum |A x - b|_i ^ p.

For each residual r_i a variable e_i is added with [e_i; 1; r_i] in MOI.PowerCone(1/p), which says e_i^(1/p) >= |r_i|, that is, e_i >= |r_i|^p; the objective is sum(e). The **p** input sets the exponent.

## Between Least Squares and Least Absolute Deviations
- **p = 2** is **least squares**: efficient under Gaussian errors, sensitive to outliers.
- **p near 1** approaches **least absolute deviations**, the median regression: robust to outliers, less efficient under Gaussian errors.
- **1 < p < 2** is a compromise: large residuals weigh less than in least squares.
**vs Baseline** gives the p-norm of the residuals of this fit, of least squares and of the near-LAD fit (p = 1.01), and the distance of the coefficients from least squares.

## Residuals
**Residuals and Slacks** shows the histogram of the residuals. As p falls towards 1, more residuals are exactly zero and the large ones grow: the fit passes through some observations and ignores the outliers.

## The Parametric Sweep
The sweep refits for p from 1.1 to 3 and plots the p-norm of the residuals, (sum |r_i|^p)^(1/p), which falls as p grows on the same data.

## Solvers
Clarabel and SCS support the power cone; COSMO supports it too. ECOS does not.

## See Also
- [SOCP](socp.md) · [Exponential Cone](expcone.md) · [Decision Guide](decision-guide.md)
