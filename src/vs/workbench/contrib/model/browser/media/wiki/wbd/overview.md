# Overview

The **World Development Indicators** (WDI) are the World Bank's main collection of development statistics: national accounts, population and health, education, labour, energy and environment, poverty, and more, compiled from national statistical offices and international agencies. They are served by the World Bank Indicators API, which needs no key.

## How Indicator Codes Are Built

Codes are dot-separated and read from general to specific. In `NY.GDP.PCAP.KD`:

- `NY` is the topic (national accounts),
- `GDP.PCAP` is the concept (GDP per capita),
- `KD` is the unit (constant US dollars).

Other common unit suffixes are `CD` (current US dollars), `ZS` (a share, in percent), `ZG` (annual growth, in percent), and `IN` (a level in natural units).

## Countries and Aggregates

The API lists individual economies together with **aggregates**: the World (`WLD`), regions such as the European Union (`EUU`) or Sub-Saharan Africa, and income groups (`HIC`, `UMC`, `LMC`, `LIC`). With `extra = true`, aggregates have the region `"Aggregates"`, so they can be dropped before a cross-country analysis to avoid counting the same people twice.

Income groups follow the World Bank's classification by gross national income per capita, which is revised every year on 1 July.

## The Five Topics in This Panel

- **One Indicator**: a single series for one economy.
- **Compare Countries**: several economies and indicators in one download.
- **Aggregates**: the World, regions, and income groups.
- **Country Classifications**: region, income group, and lending category for each economy.
- **Search Indicators**: finding a code by its name or description.

## Revisions

The WDI are updated several times a year, and past values are revised. Save a download with its date if results must be reproduced.

## See Also
- [Factsheet](factsheet.md)
