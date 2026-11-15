# Add Feed — Feeds from PubMed and arXiv Searches

## How a Search Becomes a Feed
In the **From a Search** section of the Add Feed page, a search at PubMed or arXiv becomes a feed. Pollis runs the search every hour, and the articles it finds that are new arrive as items on the RSS Feeds page. **Preview** shows the newest results before the feed is added, so that the search can be checked first: the page lists the newest 10 and says how many the feed has now. A search that finds nothing yet can still be added, and its items arrive when there are any. A PubMed search is listed under the topic Medicine and Biomedical Research, an arXiv search under the topic arXiv.

## Writing a PubMed Search
A PubMed search is written as in PubMed, with field tags such as `[Title/Abstract]`, `[Author]`, `[Journal]`, `[MeSH Terms]` or `[Publication Type]`, and terms combined with AND, OR and NOT. Quotes keep a phrase together. Examples on the page, which fill the search box with a click:

| Search | Finds |
|---|---|
| `"Cox proportional hazards"[Title/Abstract]` | Articles with the phrase in their title or abstract |
| `"machine learning"[MeSH Terms] AND sepsis` | Articles indexed under the MeSH term that mention sepsis |
| `"Lancet"[Journal] AND "randomized controlled trial"[Publication Type]` | Randomised controlled trials published in the Lancet |

The articles arrive as PubMed adds them, each tagged with its journal's level and metrics. **PubMed Search Tags** opens PubMed's help on the tags beside the page.

## Writing an arXiv Search
An arXiv search is words to search for, or fields: `ti:` for the title, `au:` for an author, `abs:` for the abstract and `cat:` for a category such as `stat.ME` or `econ.EM`, combined with AND, OR and ANDNOT. The newest papers come first. Examples on the page:

| Search | Finds |
|---|---|
| `abs:"survival analysis" AND cat:stat.ME` | Methodology papers with the phrase in their abstract |
| `cat:econ.EM` | Every new paper in Econometrics |
| `ti:"double machine learning"` | Papers with the phrase in their title |

**arXiv Query Syntax** opens arXiv's help on its search fields beside the page. The search typed for each source is kept when switching between PubMed and arXiv.

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md) · [Email Alerts as Feeds](email-alerts.md)
