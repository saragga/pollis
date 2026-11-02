# Power Variance Model

The power model lets the error variance scale with powers of the absolute drivers. Each exponent is an elasticity of the variance.

## What the Power Variance Model Computes

The **Power** tab estimates a mean equation and a variance that is a product of powers of abs(z), one for each driver. The log-linear form of this model appears in [Park (1966)](#ref-Par1966a). The model is the exponential form applied to log abs(z), and the fit in `HARE.jl` is built that way. So a gamma of 2 on a single driver means that the standard deviation is proportional to abs(z), and a gamma of 1 means that the variance is. The printed result labels the equation as log sigma² and 2 delta, where delta is the exponent on the standard deviation.

## What Formula the Power Variance Model Uses

The variance form is sigma_i² = exp(gamma_0) × product over j of abs(z_ij)^gamma_j. Taking logarithms gives the regression used under FWLS:

log(e_i²) + 1.2704 = gamma_0 + sum over j of gamma_j log(abs(z_ij)) + error

Inside `HARE.jl`, abs(z) is clipped at 1e-10 before the logarithm. The panel's helper `variance(Z)` computes exp.(hcat(1, log.(abs.(Z))) gamma) without that clip.

## Which Inputs the Power Tab Uses

**Power** always passes drivers to the package as `Z=Zv`, which is **Variance drivers (Z)** when given and **Regressors (X)** otherwise. **Estimation** picks `power_fwls`, `power_ifwls` or `power_mle`. Every driver should be non-zero, and the sign of a driver has no effect, since only its absolute value enters. For **Predict at New Values**, **New variance drivers** has to meet the same conditions, as a zero there gives a zero or infinite variance.

## Where the Power Variance Model Is Strong

For positive size variables such as sales or population, the elasticity reading is direct and often agrees with how such data behave. Few parameters can describe a wide range of shapes, from slowly widening spread to spread that grows faster than the driver. The fitted variance stays positive. Compared with **Exponential**, growth in an extreme driver is far slower, so very large rows keep some weight in the fit instead of being nearly discarded.

## Where the Power Variance Model Misleads

Zeros are the main hazard. A dummy variable or a value close to zero gets a very large negative logarithm, and the row then gains great leverage in the auxiliary regression. Using the default drivers on data with such columns gives meaningless exponents. Variables that cross zero produce a variance that dips at zero, which may not be intended. A driver with little relative variation makes gamma poorly determined. The FWLS coefficient standard errors carry the same dependence on the units of y as the other tabs.

## What to Compare the Power Variance Model With

**Exponential** tests whether the driver or its logarithm suits the spread better, and **Compare Variance Models** gives an approximate ranking. An exponent near 2 on one driver suggests that **Quadratic** could fit as well, with an intercept added. An exponent near 1 suggests that **Linear** could. **Remaining Heteroskedasticity** regresses on the drivers themselves, not their logarithms, so **Standardised Residuals** should be plotted too before accepting the fit.

## References

<a id="ref-Par1966a"></a>Park, R. E. (1966). Estimation with heteroscedastic error terms. *Econometrica* 34(4), 888. [doi:10.2307/1910108](https://doi.org/10.2307/1910108)

## See Also

- [Factsheet](factsheet.md) · [Exponential](exponential.md) · [Quadratic](quadratic.md) · [Linear](linear.md) · [Decision Guide](decision-guide.md)
