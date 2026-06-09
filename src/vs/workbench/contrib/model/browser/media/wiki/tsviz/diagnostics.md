# Diagnostics

A time series plot is itself a diagnostic tool. Reading one well means knowing what visual features to look for and what each implies for downstream modelling.

## Trend

A persistent upward or downward drift. A visible trend usually signals **non-stationarity** in the mean. Candidate remedies before modelling: differencing, detrending, or including a deterministic trend term.

## Seasonality

A repeating pattern with a fixed period (e.g. weekly, monthly, yearly). Look for regularly spaced peaks and troughs. Seasonality calls for seasonal differencing, seasonal dummies, or a seasonal model component.

## Level Shifts and Structural Breaks

A sudden, sustained jump in the mean. Often caused by a regime change, a policy intervention, or a measurement change. Breaks violate the constant-parameter assumption of most models.

## Changing Variance (Heteroskedasticity)

Bands of the series that are visibly more volatile than others — common in financial returns ("volatility clustering"). Suggests a variance-stabilising transform (e.g. log) or a conditional-variance model.

## Outliers

Isolated spikes far from neighbouring values. Distinguish genuine extreme events from data-entry errors. Outliers distort means, variances, and autocorrelation estimates.

## Gaps and Irregular Sampling

Visible breaks in the line indicate missing data. Confirm whether the gap is real (no observation) or an artefact of plotting `missing` values.

## Quick Checklist

| Feature | Visual cue | Implication |
|---|---|---|
| Trend | Sustained drift | Non-stationary mean |
| Seasonality | Regular repeating pattern | Seasonal component needed |
| Break | Sudden sustained jump | Parameter instability |
| Heteroskedasticity | Volatility clusters | Variance modelling / transform |
| Outliers | Isolated spikes | Clean or robustify |
