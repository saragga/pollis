# Finding Series

Every FRED series has a short **series ID**. Once you know the ID, downloading it is one call: `get_data(f, "ID")`. This page covers how to find the right ID.

## Browse the FRED Website

The fastest route is the [FRED site](https://fred.stlouisfed.org):

- **Search** the catalogue by keyword (e.g. "unemployment rate").
- Browse by **Category** (Population, Prices, National Accounts, …), **Release** (e.g. the Employment Situation), or **Source** (e.g. the BLS).
- Open a series page; the **ID** is shown next to the title and in the URL (`/series/UNRATE`).

Copy that ID straight into `get_data`.

## Commonly Used IDs

| ID | Series |
|---|---|
| `GDPC1` | Real Gross Domestic Product |
| `INDPRO` | Industrial Production Index |
| `CPIAUCSL` | Consumer Price Index, all items |
| `PCEPILFE` | Core PCE Price Index |
| `UNRATE` | Unemployment Rate |
| `PAYEMS` | Total Nonfarm Payrolls |
| `ICSA` | Initial Jobless Claims |
| `FEDFUNDS` | Effective Federal Funds Rate |
| `DGS10` | 10-Year Treasury Yield |
| `T10Y2Y` | 10-Year minus 2-Year Treasury Spread |
| `M2SL` | M2 Money Stock |
| `DEXUSEU` | U.S. / Euro Exchange Rate |
| `USREC` | NBER Recession Indicator |

## Tips

- Many series come in **seasonally adjusted** and **not seasonally adjusted** variants — check the title and the `seasonal_adjustment` field.
- **Real** (inflation-adjusted) series often share a stem with their **nominal** counterpart (e.g. `GDP` vs `GDPC1`).
- The **Next Steps** buttons in this webview pre-fill `get_data` calls for the most-used series in each topic, so you can start without hunting for an ID.

## See Also
- [Transformations](transformations.md) · [Interpretation](interpretation.md) · [Authentication](authentication.md)
