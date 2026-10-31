# Event Studies — Market Event Studies

## The Choices in a Market Event Study of Filings

| Choice | Options | Meaning |
|---|---|---|
| Benchmark | A Yahoo Finance symbol, such as `^GSPC` | Regular session only |
| Normal Return | Market-Adjusted; Market Model | The market model is alpha plus beta times the benchmark, fitted on minute returns of regular sessions of the days before the period |
| Group By | No Groups, Form, 8-K Item, Session, Ticker | Each group gets its own CAAR and tests |
| Event Time | First Public; EDGAR Acceptance | First Public is the earlier of the newswire release and EDGAR acceptance |
| Periods | Name, Before, After, Next Open | The windows of the report |

## Reading the Results of a Market Event Study
The chart shows the cumulative average abnormal return (CAAR), in per cent, with its 95% band, and each event in grey, with the articles under it. The events table gives Release, Accepted, Lead, Company, Form, When, Prices, News, Video, CAR, Beta and Abnormal Volume. **Abnormal Volume** is the mean of log(1 + volume) over the regular-session minutes of the period, less that of the minutes before it. An event with too few minutes before the period to fit the market model is market-adjusted, and one with too few estimation minutes to standardize its CAR stays out of the BMP, Kolari and Pynnönen and GRANK tests.

## The Tests of a Market Event Study

| Test | Asks | From |
|---|---|---|
| CAR % t | The plain t test of the mean CAR | |
| Standardized CAR, BMP t | Allows the events to raise variance | [Boehmer, Masumeci and Poulsen (1991)](#ref-BMP1991a) |
| Adjusted BMP t | Also allows returns to be correlated across events | [Kolari and Pynnönen (2010)](#ref-KP2010a) |
| GRANK t | A rank test using estimation and event periods | [Kolari and Pynnönen (2011)](#ref-KP2011a) |
| Generalized sign z | Whether positive CARs are more frequent than usual | [Cowan (1992)](#ref-Cow1992a) |
| Wilcoxon signed-rank V | Whether CARs are centred away from zero | |
| Abnormal volume t | Whether volume rose in the period | |

The adjusted BMP multiplies BMP t by sqrt((1 - r) / (1 + (n - 1) r)), with r the mean correlation over pairs of events. Events close together in time need this adjustment most.

## How Fast Prices React and Why Event Time Matters in a Market Event Study
Early studies worked at coarse intervals: [Patell (1976)](#ref-Pat1976a) found significant price adjustments around 336 management forecasts of 1963 to 1967. Later ones work by the second. [Busse and Green (2002)](#ref-BG2002a) find that prices react within seconds of a stock's first mention on television, positive reports being reflected within a minute. [Rogers, Skinner and Zechman (2017)](#ref-RSZ2017a) find that Form 4 filings reached paying subscribers before the SEC's website and that prices responded around 30 seconds before public posting, an advantage the SEC then agreed to eliminate. Reactions this fast are why the choice of **First Public** or **EDGAR Acceptance** as the Event Time can change what a window of minutes shows.

## References

<a id="ref-BMP1991a"></a>Boehmer, E., Masumeci, J. and Poulsen, A. B. (1991). Event-study methodology under conditions of event-induced variance. *Journal of Financial Economics* 30(2), 253–272. [doi:10.1016/0304-405X(91)90032-F](https://doi.org/10.1016/0304-405X(91)90032-F)

<a id="ref-BG2002a"></a>Busse, J. A. and Green, T. C. (2002). Market efficiency in real time. *Journal of Financial Economics* 65(3), 415–437. [doi:10.1016/s0304-405x(02)00148-4](https://doi.org/10.1016/s0304-405x(02)00148-4)

<a id="ref-Cow1992a"></a>Cowan, A. R. (1992). Nonparametric event study tests. *Review of Quantitative Finance and Accounting* 2(4), 343–358. [doi:10.1007/BF00939016](https://doi.org/10.1007/BF00939016)

<a id="ref-KP2010a"></a>Kolari, J. W. and Pynnönen, S. (2010). Event study testing with cross-sectional correlation of abnormal returns. *Review of Financial Studies* 23(11), 3996–4025. [doi:10.1093/rfs/hhq072](https://doi.org/10.1093/rfs/hhq072)

<a id="ref-KP2011a"></a>Kolari, J. W. and Pynnönen, S. (2011). Nonparametric rank tests for event studies. *Journal of Empirical Finance* 18(5), 953–971. [doi:10.1016/j.jempfin.2011.08.003](https://doi.org/10.1016/j.jempfin.2011.08.003)

<a id="ref-Pat1976a"></a>Patell, J. M. (1976). Corporate forecasts of earnings per share and stock price behavior: empirical test. *Journal of Accounting Research* 14(2), 246–276. [doi:10.2307/2490543](https://doi.org/10.2307/2490543)

<a id="ref-RSZ2017a"></a>Rogers, J. L., Skinner, D. J. and Zechman, S. L. C. (2017). Run EDGAR run: SEC dissemination in a high-frequency world. *Journal of Accounting Research* 55(2), 459–505. [doi:10.1111/1475-679x.12167](https://doi.org/10.1111/1475-679x.12167)

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Panel Event Studies](panel-event-studies.md) · [Stepped Wedge](stepped-wedge.md) · [FOMC Releases](fomc-releases.md)
