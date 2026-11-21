# Journal Metrics — Factsheet

The **Journal Metrics** page lists the sources of journal levels and metrics in Pollis, built in or imported from files you download.

| | |
|---|---|
| **Purpose** | Know the standing of the journals of your feeds, and query it with SQL |
| **Built in** | Norwegian Register (levels since 2004), OpenAlex (citedness, h-index, open access) |
| **Imported** | SCImago (SJR), CWTS (SNIP), ABDC Journal Quality List, Scopus (CiteScore), Journal Citation Reports (Impact Factor) |
| **Files read** | CSV or Excel (.xlsx) exports of the five imported sources |
| **Used by** | The tags and Journals filter of the RSS Feeds page and the welcome page; the `metrics`, `journal_metrics` and `norwegian_levels` views of PollisJournals |
| **Kept** | On your computer only, never shared |
| **Menu** | Explore > RSS > Journal Metrics; Databases view > PollisJournals |

## The Sources at a Glance

| Source | Metrics | Coverage | Access |
|---|---|---|---|
| Norwegian Register | Level 2, 1 or 0 | About 40,000 journals and series, every field | Open data (NLOD 2.0), built in |
| OpenAlex | 2-year mean citedness, h-index, open access, DOAJ, article charge | About 250,000 journals, conferences and book series | Open data (CC0), built in |
| SCImago Journal Rank | SJR, SJR quartile, h-index | About 30,000 journals, from Scopus | Free, no account |
| CWTS Journal Indicators | SNIP, IPP | Every year since 1999 | Free, no account |
| ABDC Journal Quality List | A*, A, B or C | About 2,700 journals of business and economics | Free, no account |
| Scopus | CiteScore, CiteScore quartile | Scopus subject areas | A free Elsevier account |
| Journal Citation Reports | Impact Factor, 5-year JIF, JIF quartile, Journal Citation Indicator | Web of Science categories | A Clarivate subscription |

## What Journal Metrics Do Not Tell
A journal metric describes the journal, not any one article in it: a highly cited journal publishes articles that are never cited, and the reverse. Most metrics count citations and are not adjusted for field, so they compare journals of the same field only; SNIP and the Journal Citation Indicator are the exceptions. A journal missing from a list, such as the ABDC list, is not rated by it, which says nothing about its quality.

## See Also
- [Overview](overview.md) · [The Metrics and What They Mean](metrics.md) · [Importing Metrics and Using Them](importing.md)
