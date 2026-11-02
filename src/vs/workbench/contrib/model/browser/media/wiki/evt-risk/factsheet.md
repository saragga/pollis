# Factsheet

The Extreme Value Risk Measures panel turns a fitted tail model into risk figures: return levels from block maxima, the quantile of losses above a threshold, and Value at Risk (VaR) with Expected Shortfall (ES). Every figure is unconditional, so it describes the series as a whole and not the current state of the market or system.

## What the Extreme Value Risk Measures Panel Does

| Item | Description |
|---|---|
| **Purpose** | Estimating the size of rare losses from a generalised extreme value (GEV) or generalised Pareto (GP) fit |
| **Julia stack** | Extremes.jl for the fits; Distributions.jl for the GP quantile; Plots.jl for the exceedance plot |
| **Models** | **Return Levels**, **Peaks-Over-Threshold** and **Tail Risk** tabs |
| **Input shape** | **Data series** is a vector of losses as positive numbers; for **Return Levels** it holds block maxima |
| **Key choice** | The block length or threshold that defines the tail, and how far to extrapolate |
| **Status** | Under Extremes.jl 1.0.5 the three tabs stop with an error; the Diagnostics wiki of this panel lists the calls concerned |

## How the Tabs of the Extreme Value Risk Measures Panel Differ

| Tab | Fit | Formula | Printed values |
|---|---|---|---|
| **Return Levels** | GEV on the series | `returnlevel(fm, T)` for each T | Return level for each T |
| **Peaks-Over-Threshold** | GP on excesses over **Threshold u** | Quantile 0.99 of a GP located at u | **sigma_hat**, **xi_hat**, **Exceedance rate**, **99th pct above u** |
| **Tail Risk** | GP on excesses over **Threshold u** | VaR and ES from the GP tail | **VaR (Extreme Value)**, **ES (Extreme Value)** |

## Which Inputs the Tabs of the Extreme Value Risk Measures Panel Use

| Input | Tab | Default | Meaning |
|---|---|---|---|
| **Data series** | All | `losses` | Losses as positive numbers |
| **Estimation method** | All | **Maximum Likelihood** | Or **Probability-Weighted Moments**, or **Bayesian Estimation** |
| **Return periods** | **Return Levels** | 10 50 100 | Periods T, counted in blocks |
| **Threshold u** | **Peaks-Over-Threshold**, **Tail Risk** | `quantile(losses, 0.9)` | Each tab keeps its own value |
| **alpha (level)** | **Tail Risk** | 0.05 | Tail probability, so 0.05 gives the 95 percent VaR |

## Which Next Steps the Extreme Value Risk Measures Panel Offers

| Group | Next Step | What it does |
|---|---|---|
| Diagnose | **Exceedance Rate Analysis** | Plots the share of losses above a threshold across 50 thresholds |
| Diagnose | **Return Level Uncertainty** | Asks for 95 percent intervals on the return levels at T = 10, 50 and 100 |
| Interpret | **Empirical vs Extreme Value Risk** | Prints the empirical VaR and ES beside the Extreme Value ones |

Run the Diagnose steps before relying on any risk figure from the panel.

## See Also

- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
