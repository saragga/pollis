# Event Studies — Overview

## What an Event Study Measures
An event study asks whether something changed at a known moment, by comparing what happened with what would have been expected. The design goes back to [Fama, Fisher, Jensen and Roll (1969)](#ref-FFJR1969a), on how stock prices adjust to new information. [MacKinlay (1997)](#ref-Mac1997a) gives the usual procedure: define the event and the period around it, model the normal return, and test whether the abnormal returns differ from zero. [Brown and Warner (1985)](#ref-BW1985a) showed that with daily returns simple models of the normal return work well, and shorter windows reduce further what the model has to explain.

## Market Event Studies and Panel Event Studies
A **Market Event Study** works with prices in the minutes around each event, comparing them with a benchmark, so the moment of the event identifies the effect. A **Panel Event Study** works with an outcome over the times after units are treated, comparing them with units not yet or never treated, so the comparison group identifies the effect. Both report effects by time relative to the event, but the assumptions differ: the first needs no other news at that moment, and the second needs parallel trends.

## The Sources of Events in a Market Event Study
Filings an alert fires become events, and Pollis captures minute prices of the filer's stock and a benchmark while it is open. News from Google News and PR Newswire's feeds is attached to each filing, since a press release on the newswire often comes before the 8-K reaches EDGAR. **FOMC releases** are a source of their own, with instruments in place of a filer's stock.

## Early Event Studies of Earnings and the Econometrics of Event Studies
[Ball and Brown (1968)](#ref-BB1968a) is often described as the first published event study using earnings data: abnormal returns rise before the announcement when the news is good. Four decades on, [Kothari and Warner (2007)](#ref-KW2007a) survey the econometrics of the method and find the statistical properties of short-horizon studies well known, while those of long horizons remain harder. Market Event Studies of Pollis work at the short end, in minutes around each event, where the method rests on the firmest ground.

## References

<a id="ref-BB1968a"></a>Ball, R. and Brown, P. (1968). An empirical evaluation of accounting income numbers. *Journal of Accounting Research* 6(2), 159–178. [doi:10.2307/2490232](https://doi.org/10.2307/2490232)

<a id="ref-BW1985a"></a>Brown, S. J. and Warner, J. B. (1985). Using daily stock returns. *Journal of Financial Economics* 14(1), 3–31. [doi:10.1016/0304-405X(85)90042-X](https://doi.org/10.1016/0304-405X(85)90042-X)

<a id="ref-FFJR1969a"></a>Fama, E. F., Fisher, L., Jensen, M. C. and Roll, R. (1969). The adjustment of stock prices to new information. *International Economic Review* 10(1), 1–21. [doi:10.2307/2525569](https://doi.org/10.2307/2525569)

<a id="ref-KW2007a"></a>Kothari, S. P. and Warner, J. B. (2007). Econometrics of event studies. In *Handbook of Empirical Corporate Finance*, 3–36. [doi:10.1016/b978-0-444-53265-7.50015-9](https://doi.org/10.1016/b978-0-444-53265-7.50015-9)

<a id="ref-Mac1997a"></a>MacKinlay, A. C. (1997). Event studies in economics and finance. *Journal of Economic Literature* 35(1), 13–39. [jstor.org/stable/2729691](https://www.jstor.org/stable/2729691)

## See Also
- [Factsheet](factsheet.md) · [Market Event Studies](market-event-studies.md) · [Panel Event Studies](panel-event-studies.md) · [Stepped Wedge](stepped-wedge.md) · [FOMC Releases](fomc-releases.md)
