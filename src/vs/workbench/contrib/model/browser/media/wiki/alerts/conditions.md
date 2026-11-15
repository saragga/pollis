# Alerts — Alert Conditions

## Conditions on a Level or a Move
The simplest conditions of an alert on a quote compare its value with a level, or its move with a percentage.

| Condition | Fires |
|---|---|
| Crosses Above | When it goes from below the value to above it |
| Crosses Below | When it goes from above the value to below it |
| Is Above | While it is above the value: once, until it is back below |
| Is Below | While it is below the value: once, until it is back above |
| Moves By | When it moves up or down by more than a percentage since the previous close |

## Conditions Judged Against Recent Moves
Four conditions judge a value against the values before it, computed by OnlineStats.jl in Julia, so they need Julia.

| Condition | Fires |
|---|---|
| Moves Unusually | When its move since the minute before is larger than this many standard deviations of the moves before it |
| Leaves Its Band | When it leaves the band of this many standard deviations around its mean: once, until it is back within |
| Moves Beyond a Quantile | When its move is beyond this quantile of the moves before it: above 50 a rise, below 50 a fall |
| Makes a New High or Low | When it goes above the highest or below the lowest of this many minutes before it |

The first three take a **Half-Life, in Values**: after how many values a value weighs half as much in the mean and the standard deviation, so that recent moves count more. The first time one of these conditions is needed, Julia installs OnlineStats.jl.

## What an Alert Would Have Done
For a condition computed in Julia, the Add Alert page computes what the alert would have done over recent values, before it is added: for a quote, each minute of the regular sessions of the last five days. The chart marks the times it would have fired, and a line says how many there were, a guide to how often it would fire. **Open Notebook** computes the same in a Julia notebook with OnlineStats.jl, over the same values, to check it and to try other settings.

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md) · [Alerts on SEC Filings](sec-filings.md) · [Alerts on Economic Series](economic-series.md)
