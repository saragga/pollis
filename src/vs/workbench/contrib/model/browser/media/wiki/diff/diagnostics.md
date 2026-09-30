# Differentiation — Diagnostics

## Step-Size Error

For a finite difference with step $h$ the error has two parts:

$$\text{error} \approx \underbrace{C_1 h^p}_{\text{truncation}} + \underbrace{C_2\,\epsilon / h}_{\text{rounding}},$$

where $\epsilon \approx 2.2 \times 10^{-16}$ is machine precision and $p = 1$ (forward) or $2$ (central). Shrinking $h$ reduces truncation but amplifies rounding, so there is a best step:

| Formula | Order | Best step | Best error |
|---|---|---|---|
| Forward $\frac{f(x+h) - f(x)}{h}$ | 1 | $\sqrt{\epsilon} \approx 10^{-8}$ | $\approx 10^{-8}$ |
| Central $\frac{f(x+h) - f(x-h)}{2h}$ | 2 | $\epsilon^{1/3} \approx 6 \times 10^{-6}$ | $\approx 10^{-11}$ |
| Complex step $\frac{\operatorname{Im} f(x + ih)}{h}$ | 2 | any tiny $h$, e.g. $10^{-20}$ | $\approx \epsilon$ |

On the log-log plot the error falls with slope $p$, reaches a minimum, then rises with slope $-1$. The complex step has no subtraction and so no rounding error. AD has neither error, which is why the plot uses the AD value as the reference.

## Check Against Exact

The Check Against Exact action compares the selected backend with Symbolics (exact) and FiniteDiff:

- AD against Symbolics: differences of about $10^{-15}$ relative are rounding and can be ignored.
- FiniteDiff against Symbolics: $10^{-7}$ to $10^{-10}$ is normal.
- A large AD error usually means a kink, a branch, or a point outside the domain.

## Warning Signs

| Symptom | Likely cause |
|---|---|
| `NaN` or `Inf` in the gradient | $x_0$ on the boundary of the domain (e.g. $x^{0.3}$ at 0) |
| AD and finite differences disagree strongly | Kink or discontinuity near $x_0$; or $f$ is noisy |
| `MethodError` with `Dual` in it | ForwardDiff: $f$ forces `Float64` somewhere |
| Enzyme or Mooncake error on the first call | Unsupported construct: try another backend in Compare Backends |
| Hessian not symmetric | Finite-difference Hessian; use an AD backend |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
