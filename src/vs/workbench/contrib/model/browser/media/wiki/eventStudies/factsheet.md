# Event Studies — Factsheet

**Event Studies** makes a study of what happens around events: prices in the minutes around filings, news and Federal Reserve releases, or an outcome over the times after units are treated.

| | |
|---|---|
| **Purpose** | Measure the effect of events on prices or outcomes |
| **Kinds** | Market Event Study, Panel Event Study |
| **Events of a market study** | SEC filings from an alert, with news; or FOMC releases |
| **Estimators of a panel study** | Two-Way Fixed Effects and Sun and Abraham; Callaway and Sant'Anna; Stepped Wedge |
| **Files** | `~/.pollis/event-studies/<folder>/study.toml`, with Open Folder, Edit study.toml, Open Notebook |
| **Actions** | Make Study, Add Alert..., Add Period |

## When to Use Event Studies
- Measuring how a stock moves in the minutes after a filing or press release.
- Measuring how futures, yields and prices respond to a Federal Reserve statement.
- Estimating the effect of a policy adopted at different times by states, firms or hospitals.
- Analysing a stepped-wedge trial, in which clusters cross over to treatment in turn.

## What Event Studies Does Not Do
The Event Studies page does not gather past filings' minute prices: Pollis captures them while it is open, and Yahoo Finance keeps minute prices only for a short time. A market study measures the reaction around an event and cannot, alone, separate it from other news at the same moment. Treatment in a panel study is taken from your table, and whether it can be treated as if random is for you to argue.

## See Also
- [Overview](overview.md) · [Market Event Studies](market-event-studies.md) · [Panel Event Studies](panel-event-studies.md) · [Stepped Wedge](stepped-wedge.md) · [FOMC Releases](fomc-releases.md)
