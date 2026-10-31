# Event Studies — FOMC Releases

## The Federal Reserve Events of an FOMC Study
Statements come from the Federal Reserve's Monetary Policy Press Releases feed at the time it gives, usually 2 p.m. New York. A statement is marked **with SEP** when the Summary of Economic Projections comes out with it, and **unscheduled** when the calendar has no scheduled meeting that day. Press conferences, at 2:30 p.m. to about 3:30, the Chair's testimony and speeches come from the calendar; those of the Vice Chair and Governors are not included. Events at the same time count as one event. A new study starts with the last 59 days, with five-minute prices for those older than 30 days.

## What Federal Funds Futures Say About a Rate Surprise
The first group of instruments, **Target Rate Surprise**, follows [Kuttner (2001)](#ref-Kut2001a), who took the surprise from the change in the current month's federal funds future. The rate implied is 100 less the price, and because the contract settles on the month's average rate, its change is scaled by D / (D - d), with D the days of the month and d the day of the event. In the month's last week the next month's contract stands in, since the scaling would magnify noise.

## Path, Forward Guidance and the Information Effect
A statement moves more than the current rate. [Gürkaynak, Sack and Swanson (2005)](#ref-GSS2005a) found that a second factor, about the future path of policy, explains much of the response of longer yields, which gives the group **Path and Forward Guidance**. [Nakamura and Steinsson (2018)](#ref-NS2018a) show that a surprise tightening may also tell markets the Fed sees a stronger economy, which gives the group **Fed Information Effect**: a higher yield together with higher stock prices is its usual sign.

## The Units and Gaps of FOMC Instruments
Futures are in basis points of the implied rate, yields in basis points and prices in per cent. Expired contracts are gone from Yahoo Finance. No 2-year yield is available in minutes, so the 2-year note future appears as a price. The caption of each chart gives the average move with its 95% band.

## How Interest Rates and Stocks Respond to Federal Funds Rate Changes
[Cook and Hahn (1989)](#ref-CH1989a) studied changes in the federal funds rate target in the 1970s and found rates moving in the same direction, short-term rates most and long-term rates by less, though significantly. [Kuttner (2001)](#ref-Kut2001a) later separated the part markets anticipated, by the futures behind a Target Rate Surprise. For stocks, [Bernanke and Kuttner (2005)](#ref-BK2005a) associate an unanticipated cut of 25 basis points with a rise of about 1% in broad indexes, so the charts of an FOMC study can be set against a known order of size.

## Separating Forward Guidance From Asset Purchases in FOMC Surprises
A statement can also move markets through asset purchases. [Swanson (2021)](#ref-Swa2021a) separates forward guidance from large-scale asset purchases in the announcements of 2009 to 2015. Forward guidance matters more for short yields and fades with a half-life of one to four months; asset purchases matter more for longer yields and last longer. An announcement of asset purchases therefore shows more in longer yields than in the short ones that forward guidance moves, which an FOMC study should bear in mind when reading the **Path and Forward Guidance** group.

## The Fed Information Effect and the Fed Response to News
Whether a surprise reveals the Fed's own information is disputed. [Jarociński and Karadi (2020)](#ref-JK2020a) use the comovement of rates and stocks to separate a tightening, with rates up and stocks down, from a central bank information shock, with both up. [Bauer and Swanson (2023)](#ref-BS2023a) offer an alternative they call the Fed response to news: markets and the Fed both react to the same public news, and markets underestimate how strongly the Fed will. The group **Fed Information Effect** shows the pattern, and the literature still differs on the reason for it.

## The Rise in Stocks Before FOMC Announcements
Not all the movement waits for the statement. [Lucca and Moench (2015)](#ref-LM2015a) find that the S&P 500 rises in the 24 hours before scheduled FOMC announcements, whatever the decision turns out to be, with no such effect in fixed income or foreign exchange. Surprises measured around the statement cannot see this drift, as the window opens too late, so a flat pre-event line in an FOMC study says nothing about the day before.

## References

<a id="ref-BS2023a"></a>Bauer, M. D. and Swanson, E. T. (2023). An alternative explanation for the "Fed information effect". *American Economic Review* 113(3), 664–700. [doi:10.1257/aer.20201220](https://doi.org/10.1257/aer.20201220)

<a id="ref-BK2005a"></a>Bernanke, B. S. and Kuttner, K. N. (2005). What explains the stock market's reaction to Federal Reserve policy? *Journal of Finance* 60(3), 1221–1257. [doi:10.1111/j.1540-6261.2005.00760.x](https://doi.org/10.1111/j.1540-6261.2005.00760.x)

<a id="ref-CH1989a"></a>Cook, T. and Hahn, T. (1989). The effect of changes in the federal funds rate target on market interest rates in the 1970s. *Journal of Monetary Economics* 24(3), 331–351. [doi:10.1016/0304-3932(89)90025-1](https://doi.org/10.1016/0304-3932(89)90025-1)

<a id="ref-GSS2005a"></a>Gürkaynak, R. S., Sack, B. and Swanson, E. T. (2005). Do actions speak louder than words? The response of asset prices to monetary policy actions and statements. *International Journal of Central Banking* 1(1), 55–93. [ijcb.org/journal/ijcb05q2a2.htm](https://www.ijcb.org/journal/ijcb05q2a2.htm)

<a id="ref-JK2020a"></a>Jarociński, M. and Karadi, P. (2020). Deconstructing monetary policy surprises: the role of information shocks. *American Economic Journal: Macroeconomics* 12(2), 1–43. [doi:10.1257/mac.20180090](https://doi.org/10.1257/mac.20180090)

<a id="ref-Kut2001a"></a>Kuttner, K. N. (2001). Monetary policy surprises and interest rates: evidence from the Fed funds futures market. *Journal of Monetary Economics* 47(3), 523–544. [doi:10.1016/S0304-3932(01)00055-1](https://doi.org/10.1016/S0304-3932(01)00055-1)

<a id="ref-LM2015a"></a>Lucca, D. O. and Moench, E. (2015). The pre-FOMC announcement drift. *Journal of Finance* 70(1), 329–371. [doi:10.1111/jofi.12196](https://doi.org/10.1111/jofi.12196)

<a id="ref-NS2018a"></a>Nakamura, E. and Steinsson, J. (2018). High-frequency identification of monetary non-neutrality: the information effect. *The Quarterly Journal of Economics* 133(3), 1283–1330. [doi:10.1093/qje/qjy004](https://doi.org/10.1093/qje/qjy004)

<a id="ref-Swa2021a"></a>Swanson, E. T. (2021). Measuring the effects of Federal Reserve forward guidance and asset purchases on financial markets. *Journal of Monetary Economics* 118, 32–53. [doi:10.1016/j.jmoneco.2020.09.003](https://doi.org/10.1016/j.jmoneco.2020.09.003)

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Market Event Studies](market-event-studies.md) · [Panel Event Studies](panel-event-studies.md) · [Stepped Wedge](stepped-wedge.md)
