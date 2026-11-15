# Alerts — Alerts on SEC Filings

## Which Companies an Alert on SEC Filings Watches
An alert on SEC Filings watches the filings published at the SEC's EDGAR, every 15 minutes while Pollis is open, and fires when a new one is published. **For** chooses whose filings: **One Company**, by its ticker (AAPL) or the SEC's CIK (320193); **Several Companies**, tickers or CIKs separated by commas; **An Industry**, by the SEC's SIC code, such as 2834 for pharmaceuticals, which takes every company the SEC files under it, listed or not; or **Every Company**, only with Contains, as there are thousands of filings a day. Pollis looks for them in EDGAR's latest filings, which go back about a day, so filings made while Pollis is closed for longer are missed. The SEC asks for a name and an email with every request; **Set Contact** gives them, as on the EDGAR panel.

## Forms, 8-K Items and Contains
**Forms** lists the forms to be alerted of, separated by commas, such as 10-K, 10-Q, 8-K; an amendment, such as 10-K/A, counts as its form, and an empty list takes every filing. **8-K Items** narrows an 8-K to the items ticked, so that it fires only when it reports one of them; with none ticked, every 8-K fires. Most 8-Ks also have item 9.01, their exhibits. **Contains** gives words the filing must contain, in EDGAR's full-text search: an exact phrase in quotes, such as "going concern", and OR between alternatives. **Search** lists the filings of the last 30 days that contain them, newest first, a guide to how often the alert would fire.

## Starting an Event Study When an Alert Fires
An alert on filings can start an event study. **Start One When It Fires**, under Event Study, starts a study when the alert fires and has none yet: benchmark ^GSPC, market-adjusted, from 30 minutes before to 2 hours after the filing and the next open, with the filings of the 30 days before among its events. On the Alerts page, **Start Event Study** opens Event Studies with the alert chosen for a new study of its filings, and **Open Event Study** opens the one it has.

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md) · [Alert Conditions](conditions.md) · [Alerts on Economic Series](economic-series.md)
