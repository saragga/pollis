# Licences and Downloads

The page Forecasting Challenges and Competitions downloads each competition from its own source, with PollisCompetitions.jl, onto the user's computer. Pollis ships none of their data.

## Where Do the Data of Each Competition Come From?

| Competition | Source | Licence |
|---|---|---|
| M1, M3 | The Monash Time Series Forecasting Archive, on Zenodo [(Godahewa, Bergmeir, Webb, Hyndman and Montero-Manso, 2021)](#ref-GBWHM2021a) | CC BY 4.0 |
| M4 | The repository Mcompetitions/M4-methods on GitHub, at a fixed revision | None stated in the repository |
| M5 | The organisers' files on Google Drive, and the repository Mcompetitions/M5-methods on GitHub | None stated in the repository |
| M6 | The repository Mcompetitions/M6-methods on GitHub | None stated in the repository |

The Monash archive gives each series of M1 and M3 with the values the forecasters saw and the values the forecasts were scored on. The M4 repository holds the series, the entries, their forecasts and the organisers' scores; the M5 files hold the sales, the calendar, the prices, the weights of the WRMSSE, and the entries' forecasts and scores; the M6 repository holds the prices of the 100 assets, the submissions of every team and the leaderboard.

## How Does PollisCompetitions.jl Check a Download?

Every file a competition is made of is listed in the catalogue of PollisCompetitions.jl with its address, its size and its SHA-256, the digest of its contents. **Download** in the step Competition sends Julia code to the Julia REPL that fetches each file, checks its SHA-256 against the catalogue, and stops if a file differs, so that every user scores against the same data. The files are then converted into Parquet tables in `~/.pollis/competitions`, one folder for each competition, and `info.toml` in that folder records the download; the page shows a competition as on this computer when `info.toml` is there.

## How Large Are the Downloads?

| Competition | Data | Forecasts of the entries |
|---|---|---|
| M1 | About 0.2 MB | None on the page |
| M3 | About 0.5 MB | None on the page |
| M4 | About 275 MB | About 460 MB, of 61 entries |
| M5 | About 365 MB | About 18.5 GB, of 130 entries, point and quantile |
| M6 | About 40 MB | In the data: the submissions of every team |

**Download** fetches the data, and for M4 also the forecasts of Naive2, against which OWA weighs every method. The forecasts of other entries are fetched only when asked for, with `download_forecasts` of PollisCompetitions.jl, by number or name, or by **Compare** in Compare With an Entry, one of the Next Steps; the plot of the step Score and Rank shows the winner's forecast when the winner's forecasts are on this computer.

## References

<a id="ref-GBWHM2021a"></a>Godahewa, R., Bergmeir, C., Webb, G. I., Hyndman, R. J. and Montero-Manso, P. (2021). Monash Time Series Forecasting Archive. arXiv. [doi:10.48550/arXiv.2105.06643](https://doi.org/10.48550/arXiv.2105.06643)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [The M Competitions](m-competitions.md) · [The Error Measures](error-measures.md) · [Scoring a Method](scoring-method.md)
