# ECB Data Portal — Overview

The [ECB Data Portal](https://data.ecb.europa.eu) is the European Central Bank's public statistics service. It exposes its data through an **SDMX 2.1 REST API** at `https://data-api.ecb.europa.eu/service/`. SDMX (Statistical Data and Metadata eXchange) is the ISO standard used by central banks and statistical agencies worldwide, so the same request style works for the BIS, Eurostat, the IMF, and others.

## How Data Is Organised

- A **dataflow** groups related series (e.g. `EXR` = exchange rates, `ICP` = HICP prices, `BSI` = bank balance sheet / monetary aggregates, `YC` = yield curve, `FM` = financial-market / key rates).
- Within a dataflow, a **series key** selects one series by fixing every dimension. The key is dot-separated, e.g. `D.USD.EUR.SP00.A` means *daily, US dollar, per euro, reference rate (SP00), average (A)*.
- Each series is a set of **observations**: a `TIME_PERIOD` and an `OBS_VALUE`.

## The Five Topics in This Webview

- **Exchange Rates** (`EXR`) — euro reference rates against major currencies.
- **Key Interest Rates** (`FM`, `EST`) — the main refinancing, deposit facility, and marginal lending rates, plus the €STR.
- **HICP Inflation** (`ICP`) — the Harmonised Index of Consumer Prices.
- **Monetary Aggregates** (`BSI`) — the M1/M2/M3 money stocks.
- **Yield Curve** (`YC`) — euro area AAA government bond spot rates.

## Why CSV

The API can return SDMX-ML (XML), SDMX-JSON, or SDMX-CSV. **SDMX-CSV (`format=csvdata`) is already a flat, tidy table**, so it reads straight into Julia via `CSV.jl` with no SDMX-specific parsing. SDMX-JSON, by contrast, is deeply nested (series keyed by dimension-index strings, observations as sparse maps) and is painful to consume by hand. See the *Accessing Data* and *SDMX and Alternatives* pages.

## ECB vs FRED

- **ECB Data Portal** — the source for euro-area statistics; SDMX REST, no key, rich dimension keys.
- **FRED** (`FredData.jl`) — the equivalent for U.S. series; a dedicated package and an API key.

The **Compare** link in the Concept Map cross-references the two.
