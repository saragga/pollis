# Decision Guide

| Situation | Method |
|---|---|
| Exploring the shape of the trend | **LOESS** |
| No trend, no season, a drifting level | **Local Level**, or ETS with no trend |
| A drifting level and slope | **Local Linear Trend**, or ETS Additive |
| A trend that should flatten | **ETS** Damped |
| Monthly or quarterly seasonality | **Seasonal Model**, or ETS with a Period |
| Autocorrelation after differencing | **ARIMA** |
| Choosing each component's form | **Unobserved Components** |
| A seasonal pattern that changes | Stochastic seasonality |

## Decision Flow

1. **Plot the series and a LOESS trend**: trend, seasonality, changes in spread?
2. **Take logs** if the variation grows with the level.
3. **Fit two or three candidate models** with the right components.
4. **Check the residuals** of each: white noise is the minimum.
5. **Compare by backtest error** at the horizon that matters, and by information criteria where comparable.
6. **Forecast with intervals** from the chosen model.

## Rules of Thumb

- **Damped trends** usually forecast better than straight ones beyond a few steps.
- **Simple models win** surprisingly often: compare against the local level.
- **Backtest at the horizon used**, not only one step ahead.
- **Two full seasons** of data at least for a seasonal model.
- **Report the intervals**: a point forecast alone overstates certainty.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
