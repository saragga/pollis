# Licences and Downloads

Score Models scores a method on the data of a competition that PollisCompetitions.jl has on this computer, downloaded from the competition's own source. Pollis ships none of their data.

## Where Do the Data of Each Competition Come From?

| Competition | Source | Licence |
|---|---|---|
| M1, M3 | The Monash Time Series Forecasting Archive, on Zenodo [(Godahewa, Bergmeir, Webb, Hyndman and Montero-Manso, 2021)](#ref-GBWHM2021a) | CC BY 4.0 |
| M4 | The repository Mcompetitions/M4-methods on GitHub, at a fixed revision | None stated in the repository |
| M5 | The organisers' files on Google Drive, and the repository Mcompetitions/M5-methods on GitHub | None stated in the repository |
| M6 | The repository Mcompetitions/M6-methods on GitHub | None stated in the repository |

The Monash archive gives each series of M1 and M3 with the values the forecasters saw and the values the forecasts were scored on. The M4 repository holds the series, the entries, their forecasts and the organisers' scores; the M5 files hold the sales, the calendar, the prices, the weights of the WRMSSE, and the entries' forecasts and scores; the M6 repository holds the prices of the 100 assets, the submissions of every team and the leaderboard.

## Where Are the Data of a Competition Kept?

PollisCompetitions.jl keeps the data of a competition as Parquet tables, in one folder for each competition: `data/builtin/<id>` of the package for a dataset built in with it, else `~/.pollis/competitions/<id>` for one downloaded. The `info.toml` of that folder records what is there, and the page shows a competition as on this computer when `info.toml` is there.

## How Large Are the Downloads?

| Competition | Data | Forecasts of the entries |
|---|---|---|
| M1 | About 0.2 MB | None on the page |
| M3 | About 0.5 MB | None on the page |
| M4 | About 275 MB | About 460 MB, of 61 entries |
| M5 | About 365 MB | About 18.5 GB, of 130 entries, point and quantile |
| M6 | About 40 MB | In the data: the submissions of every team |

The forecasts of the entries are kept in the folder `forecasts` of the competition's folder, one file for each entry. OWA weighs every method against the forecasts of Naive2, which must be there for M4. **Compare** in Compare With an Entry, one of the Next Steps, compares the method with an entry whose forecasts are there, and the plot of the step Score and Rank shows the winner's forecast when the winner's forecasts are there.

## References

<a id="ref-GBWHM2021a"></a>Godahewa, R., Bergmeir, C., Webb, G. I., Hyndman, R. J. and Montero-Manso, P. (2021). Monash Time Series Forecasting Archive. arXiv. [doi:10.48550/arXiv.2105.06643](https://doi.org/10.48550/arXiv.2105.06643)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [The M Competitions](m-competitions.md) · [The Error Measures](error-measures.md) · [Scoring a Method](scoring-method.md)
