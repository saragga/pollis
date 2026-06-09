# Overview

A **time series** is a sequence of observations indexed by time. Plotting that sequence against its time index is the single most informative step in exploratory time series analysis — the eye detects trend, seasonality, structural breaks, and anomalies far faster than any summary statistic.

This webview wraps three closely related visualisations built on [Plots.jl](https://github.com/JuliaPlots/Plots.jl):

## Line Plot

The basic time series plot connects consecutive observations with line segments. The time index runs along the horizontal axis and the measured quantity along the vertical axis. Connecting points emphasises *order* and *continuity*, which is exactly what distinguishes a time series from an unordered sample.

## Multi-Series Overlay

Several series can be drawn on the same axes to compare their behaviour. When series share units and scale, a single axis suffices. When they differ by orders of magnitude, a secondary axis or a normalising transform (e.g. indexing to a common base) keeps both legible.

## Ribbon Plot

A **ribbon** draws a shaded band around a central line, typically used to display a forecast together with a confidence or prediction interval. The line is the point estimate; the band communicates uncertainty. See the [Ribbon Plot](ribbon.md) page for details.

## Why It Matters

Most time series pathologies — non-stationarity, seasonality, heteroskedasticity, outliers, missing stretches — are *visible*. A few minutes spent plotting the data prevents hours spent debugging a model that was never appropriate for it.
