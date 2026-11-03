# Media Coverage — Overview

## What the Media Coverage Page Shows
Media Coverage answers two questions about a search: how many news articles there were over a period, and which. The **Coverage** pane charts the number of articles found in each hour, day or week of the period, and the **Articles** table lists them, newest first, with When, From (the outlet), Headline and Source. A click on a headline opens the article in the internal browser. A click on a bar of the chart lists only that bar's articles, and **Show the Whole Period** lists them all again. Below the Search button, a line says which sources could not be reached and which need a key, and, when The New York Times or The Guardian found more articles than it listed, how many of them it listed.

## Why Count the News Articles About a Company
Research in finance has measured both how much the media say about a company and what they say. [Fang and Peress (2009)](#ref-FP2009a) studied the cross-section of media coverage and expected stock returns, and found that stocks with no media coverage earn higher returns than stocks with high coverage, after controlling for well-known risk factors, more so among small stocks, stocks with high individual ownership, low analyst following and high idiosyncratic volatility. [Tetlock (2007)](#ref-Tet2007a) measured the content of a daily Wall Street Journal column, and found that high media pessimism predicts downward pressure on market prices followed by a reversion to fundamentals, and that unusually high or low pessimism predicts high trading volume. The Media Coverage page counts articles, as in the first kind of study; it does not measure their tone.

## Writing the Words of a Media Coverage Search
The **Words** field holds what the articles must have. Quotes keep a phrase together, as in `"Apple Inc"`, so that the words are found side by side rather than anywhere in the article. **OR** between words takes any of them, in parentheses, as in `(iPhone OR iPad)`. A search may give words only, a ticker in the Yahoo Finance row only, or both. Google News, The New York Times and The Guardian are searched with the words, so a search with a ticker and no words lists only the headlines of Yahoo Finance and PR Newswire.

## How the Coverage Chart Groups Articles by Hour, Day or Week
The width of a bar of the Coverage chart follows the length of the period. A period of up to 3 days is charted by hour, a period of up to half a year by day, and a longer one by week. The **Period** select offers Last 24 Hours, Last 3 Days, Last 7 Days, Last 30 Days, Last 90 Days and Last Year, counted back from now, and **From a Day to a Day** sets the first and last days, the last one included to its end. The labels below the chart give the times of the first, middle and last bars, and pointing at a bar shows its time and count.

## Marking FOMC Releases, SEC Filings or a Time on the Chart
The **Mark** select draws dashed lines on the Coverage chart, each with a label that opens its source when clicked. **FOMC Releases** come from the Federal Reserve's Monetary Policy Press Releases feed, which lists about the last year: statements, minutes and other releases of the Federal Open Market Committee. **SEC Filings of the Ticker** marks the filings of the company whose ticker is in the Yahoo Finance row, each labelled with its form and items, at the time EDGAR accepted it, or on its filing date when that time is not known. **A Time** marks a date and time of your own, such as the moment a price moved. A mark outside the period is left out.

## Opening Media Coverage From an Event Study
In Event Studies, the News link of an event opens Media Coverage on the news from the day before the event to the day after. For a study of filings, the search is the company's name with its ticker, and the ticker's filings are marked, or the event's time when there is no ticker; for a study of FOMC releases, the search is "FOMC" or "Federal Reserve", and the releases are marked. The search runs at once, and its form can then be changed and run again like any other.

## References

<a id="ref-FP2009a"></a>Fang, L. and Peress, J. (2009). Media coverage and the cross-section of stock returns. *Journal of Finance* 64(5), 2023–2052. [doi:10.1111/j.1540-6261.2009.01493.x](https://doi.org/10.1111/j.1540-6261.2009.01493.x)

<a id="ref-Tet2007a"></a>Tetlock, P. C. (2007). Giving content to investor sentiment: the role of media in the stock market. *Journal of Finance* 62(3), 1139–1168. [doi:10.1111/j.1540-6261.2007.01232.x](https://doi.org/10.1111/j.1540-6261.2007.01232.x)

## See Also
- [Factsheet](factsheet.md) · [News Sources](sources.md)
