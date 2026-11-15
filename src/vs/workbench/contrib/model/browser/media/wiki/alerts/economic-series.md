# Alerts — Alerts on Economic Series

## The Sources of an Economic Series
An alert on Economic Data watches a series of one of four sources, looked up every hour while Pollis is open. Each source names its series in its own way:

| Source | Series |
|---|---|
| FRED | A series ID, such as UNRATE, GDPC1 or FEDFUNDS; FRED asks for a free API key, set with Set FRED Key as on the FRED panel |
| ECB | A dataset and series key of the ECB Data Portal |
| IMF | A dataflow and series key |
| World Bank | A country and an indicator |

**Look Up** checks the series and shows its latest value and period, and the chart beside the form shows its recent values. A series that the source does not know, or a source that cannot be reached, is said so.

## Conditions on a New Value of a Series
An economic series publishes a value for each new period, so the conditions of an alert on Economic Data are judged on each new value. **Publishes a New Value** fires when the source publishes a value for a new period. **Crosses Above** and **Crosses Below** fire when a new value is above, or below, the value given and the value before was not; **Is Above** and **Is Below** when a new value is above, or below, it. **Changes By** fires when a new value is up or down from the value before by the change given or more. **Moves Unusually**, **Leaves Its Band**, **Moves Beyond a Quantile** and **Makes a New High or Low** judge a new value against the values before it, computed by OnlineStats.jl in Julia, as for a quote.

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md) · [Alert Conditions](conditions.md) · [Alerts on SEC Filings](sec-filings.md)
