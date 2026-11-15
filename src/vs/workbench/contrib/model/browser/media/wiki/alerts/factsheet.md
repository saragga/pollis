# Alerts — Factsheet

**Alerts** watch a quote at Yahoo Finance, filings at the SEC's EDGAR, or an economic series, and tell you when a condition is met.

| | |
|---|---|
| **Purpose** | Be told when a price, a filing or a published value meets a condition |
| **Alert On** | A Quote (Yahoo Finance), SEC Filings (EDGAR), Economic Data (FRED, ECB, IMF, World Bank) |
| **Looked up** | Quotes every minute, filings every 15 minutes, series every hour, while Pollis is open |
| **Conditions on a quote** | Crosses Above, Crosses Below, Is Above, Is Below, Moves By, Moves Unusually, Leaves Its Band, Moves Beyond a Quantile, Makes a New High or Low |
| **Shows As** | Information, Warning or Error |
| **Fires** | Every Time or Once |
| **Pages** | Add Alert, Alerts (Your Alerts and Fired Alerts), Quote |
| **Powered by** | OnlineStats.jl, for the conditions computed in Julia |
| **Menu** | Explore > Alerts; the plus and the gear of the Alerts box on the welcome page |

## When to Use Alerts
- Knowing when an index crosses a level, or a share moves by more than a percentage in a day.
- Being told of an unusual move in a currency, judged against its own recent moves.
- Reading a company's 8-K as soon as EDGAR publishes it, or every filing that mentions a phrase.
- Following the release of a new value of an economic series, such as unemployment or a policy rate.

## What Alerts Do Not Do
Pollis looks the values up only while it is open: an alert does not fire while Pollis is closed, and filings made while it is closed for more than about a day are missed. The quotes of Yahoo Finance are delayed, so an alert on a quote is not suited to trading on the minute. An alert does not trade, and it sends no email or message outside Pollis.

## See Also
- [Overview](overview.md) · [Alert Conditions](conditions.md) · [Alerts on SEC Filings](sec-filings.md) · [Alerts on Economic Series](economic-series.md)
