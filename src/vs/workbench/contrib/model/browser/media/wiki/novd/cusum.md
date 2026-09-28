# CUSUM

The **cumulative sum control chart** (Page, 1954) monitors a series for a sustained shift in its mean. It adds up small deviations from the baseline, so a persistent change that is too small to see in any single observation still triggers an alarm.

## Construction
```julia
using Statistics

mu0, sigma0 = mean(x_baseline), std(x_baseline)
z = (x_new .- mu0) ./ sigma0
k, h = 0.5, 5

S_up, S_down = zeros(length(z)), zeros(length(z))
for t in eachindex(z)
	S_up[t]   = max(0.0, (t == 1 ? 0.0 : S_up[t-1]) + z[t] - k)
	S_down[t] = max(0.0, (t == 1 ? 0.0 : S_down[t-1]) - z[t] - k)
end
alarms = findall((S_up .> h) .| (S_down .> h))
```

## How It Works
Each step adds the standardised deviation minus an allowance k. While the process is in control the deviations are small and the sum keeps resetting to 0. After an upward shift it climbs steadily, and an alarm is raised when it exceeds h. The lower statistic does the same for downward shifts.

## Choosing k and h
- **k**: half the shift to detect, in standard deviations. k = 0.5 targets a one-sigma shift.
- **h**: sets the in-control average run length (ARL0), the mean time between false alarms. Larger h means fewer false alarms but slower detection.

Pairs with an ARL0 of about 370 steps (the same as a three-sigma Shewhart chart): k = 0.25, h = 8; k = 0.5, h = 4.77; k = 1, h = 2.5.

## Limits
- Assumes independent observations; monitor model residuals for autocorrelated series.
- The baseline mean and standard deviation must be estimated from enough clean data.
- It detects mean shifts, not changes in variance.

## See Also
- [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
