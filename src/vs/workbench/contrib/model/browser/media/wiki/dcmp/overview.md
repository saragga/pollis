# Overview

Comparing distributions — a sample against a theory, or two samples against each other — is central to validating modelling assumptions. This webview offers four complementary views.

## ECDF
The **empirical cumulative distribution function** steps up by 1/n at each observation. Overlaying a theoretical CDF gives a direct, bin-free comparison of whole distributions. See [ECDF](ecdf.md).

## QQ Plot
A **quantile–quantile** plot graphs sample quantiles against reference quantiles. Points on the 45° line mean the distributions match; systematic departures reveal skew and heavy tails. See [QQ Plot](qq.md).

## Marginal Plot
A joint scatter of two variables with their **marginal** histograms or densities on the axes — the joint relationship and each variable's own distribution in one figure. See [Marginal Plot](marginal.md).

## Correlogram
A **scatter-plot matrix** of every variable pair, with densities on the diagonal — a fast survey of pairwise relationships and marginal shapes across many variables. See [Correlogram](correlogram.md).

## Why It Matters
Means and variances hide a lot. Two samples can share a mean yet differ in skew, tails, or modality. These plots expose those differences directly.
