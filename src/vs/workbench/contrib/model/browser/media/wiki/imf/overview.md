# Overview

The International Monetary Fund collects macroeconomic and financial statistics from its member countries and publishes them, with its own forecasts, on [data.imf.org](https://data.imf.org). The data are served through an **SDMX 2.1 REST API**, the same standard used by the ECB, the BIS, and Eurostat, so the request style carries over between these sources.

## How Data Is Organised

- A **dataflow** groups related series and belongs to an **agency** inside the IMF: `IMF.RES` (Research Department) publishes the World Economic Outlook and commodity prices; `IMF.STA` (Statistics Department) publishes consumer prices, exchange rates, and reserves.
- A **series key** fixes every dimension of the dataflow, in order, separated by dots. Leaving a dimension empty selects all its values; joining values with `+` selects several.
- Each series is a set of **observations**: a `TIME_PERIOD` and an `OBS_VALUE`, plus attribute columns such as units and scale.

## The Five Topics in This Panel

- **World Economic Outlook** (`IMF.RES,WEO`): annual history and IMF projections for growth, inflation, unemployment, public debt, and the current account. The `LATEST_ACTUAL_ANNUAL_DATA` column marks the last year that is data rather than projection.
- **Consumer Prices** (`IMF.STA,CPI`): national CPIs by COICOP division, as indexes or percentage changes.
- **Exchange Rates** (`IMF.STA,ER`): national currency per US dollar, as period averages or end-of-period rates.
- **Reserves** (`IMF.STA,COFER`): the Currency Composition of Official Foreign Exchange Reserves, the world total split by currency.
- **Commodity Prices** (`IMF.RES,PCPS`): the Primary Commodity Prices system, individual commodities in US dollars and grouped indexes.

## About IMFData.jl

`IMFData.jl` calls the IMF's earlier JSON API at `dataservices.imf.org`, which no longer responds, so the package no longer works. Requests built with `HTTP.jl` and read with `CSV.jl` need no IMF-specific package.

## Revisions and Vintages

WEO projections are revised in every edition (April and October), and national statistics are revised when countries update them. A download reflects the latest release; save it with the date if results must be reproduced.

## See Also
- [Factsheet](factsheet.md)
