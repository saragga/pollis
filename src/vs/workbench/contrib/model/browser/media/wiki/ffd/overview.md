# Overview

Kenneth French's Data Library publishes the returns used throughout empirical asset pricing. It is built from CRSP stock returns and Compustat accounting data, and it is updated regularly.

## The Factors

Each factor is the return on a long-short portfolio:

- **Mkt-RF**: the value-weighted market return minus the one-month Treasury bill rate (**RF**).
- **SMB** (small minus big): small stocks minus big stocks.
- **HML** (high minus low): high book-to-market (value) stocks minus low book-to-market (growth) stocks.
- **RMW** (robust minus weak): high operating profitability minus low.
- **CMA** (conservative minus aggressive): firms that invest little minus firms that invest a lot.
- **Mom**: stocks with high returns over the previous year (months -12 to -2) minus those with low returns.

The size breakpoint is the NYSE median market capitalisation, and the other sorts use NYSE 30th and 70th percentiles, so the factors are not dominated by the many very small stocks.

## Three and Five Factors

The three-factor model of Fama and French (1993) explains average returns with the market, size, and value. The five-factor model (Fama and French, 2015) adds profitability and investment; in that model, HML is close to redundant once RMW and CMA are included, because it is largely explained by them.

## Test Assets

Sorted portfolios, such as the 25 size and book-to-market portfolios, are the usual **test assets**: an asset pricing model should explain their average excess returns with small intercepts (alphas). Industry portfolios give a test that does not use the characteristics the factors were built from.

## Frequencies and Versions

Most files come monthly and annual; many also come daily. Values in past months can change between updates when CRSP or Compustat revise their data, so save a download with its date if results must be reproduced.

## See Also
- [Factsheet](factsheet.md)
