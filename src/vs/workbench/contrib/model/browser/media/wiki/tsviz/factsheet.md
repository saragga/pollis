# Time Series Plot — Factsheet

A **time series plot** displays one or more measured quantities against an ordered time axis. It is the first and most important diagnostic in any time series workflow: before fitting a model, you look at the data.

| | |
|---|---|
| **Purpose** | Visualise how one or more series evolve over time |
| **Input** | A time index (dates, timestamps, or an ordered integer sequence) and one or more numeric series |
| **Core package** | [Plots.jl](https://github.com/JuliaPlots/Plots.jl) |
| **Complementary** | StatsBase.jl (lags, autocorrelation), StatsPlots.jl (statistical recipes) |
| **Plot types** | Line plot, multi-series overlay, ribbon (uncertainty band) |
| **Typical use** | Exploratory data analysis, trend and seasonality inspection, forecast presentation |

## When to Use

- Inspecting raw data for **trend**, **seasonality**, **level shifts**, and **outliers** before modelling.
- Overlaying several series to compare scale, co-movement, and timing.
- Communicating a forecast together with its uncertainty using a shaded **ribbon**.

## What It Is Not

A time series plot is a *descriptive* tool. It does not test hypotheses, estimate parameters, or quantify dependence. For formal autocorrelation structure, stationarity tests, or model fitting, use the dedicated Econometrics and Forecasting toolboxes.
