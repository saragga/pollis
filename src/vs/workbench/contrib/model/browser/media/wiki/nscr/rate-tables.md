# Rate Tables

A **rate table** (life table) gives the daily hazard of death of the general population by **age**, **calendar year** and other covariates, usually **sex**. National statistics offices publish them; RateTables.jl ships them in a form NetSurvival.jl reads.

## What the Panel Needs
- The table, chosen in the **Rate Table** input. RateTables.jl ships `slopop` (Slovenia), `survexp_us` (USA), `survexp_usr` (USA by race), `survexp_mn` (Minnesota), `survexp_fr` and `frpop` (France), and `hmd_rates`, built from the Human Mortality Database for many countries, by country and sex. With `hmd_rates` the data need a `country` column with its country codes (`hmd_countries` lists them).
- In the data, **age** at diagnosis in days and **year**, the date of diagnosis in days since year 0, as RateTables.jl counts them.
- A column for each of the table's other covariates, with the same name and coding: `RateTables.predictors(rt)` lists them, and the panel reads them from the data.

As a patient is followed, the table is read at their age and calendar date at each time, so a 70-year-old diagnosed in 2000 is matched with 75-year-olds in 2005 five years later.

## Choosing a Table
- **Same population**: the country, and the region where tables exist, of the patients.
- **Same period**: the table must cover the diagnosis years plus the follow-up.
- **Finer is better**: tables by deprivation or ethnicity, where available, remove differences in background mortality that would otherwise be counted as excess.

A mismatched table shows up as a negative excess hazard (patients healthier than the table assumes) or an inflated one (less healthy). See [Diagnostics](diagnostics.md).

## Your Own Table
`RateTables.RateTable(df)` builds a table from a table with one row per cell: columns `age` and `year` (in days, as above), `value` (the daily hazard), and one column for each covariate, such as `sex`. A yearly probability of death q becomes the daily hazard -log(1 - q) / 365.241.

## See Also
- [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Overview](overview.md)
