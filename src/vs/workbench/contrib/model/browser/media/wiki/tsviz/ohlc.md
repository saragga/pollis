# OHLC

An **OHLC chart** summarises a financial time series one period at a time. Each bar encodes four numbers — **open, high, low, close** — as a vertical low-to-high segment with a short tick on the **left for the open** and on the **right for the close**.

## Construction
Plots.jl has this built in via the `OHLC` type and the `ohlc` series:

```julia
using Plots, Random
Random.seed!(42)
n = 30
close = 100 .+ cumsum(randn(n))      # closing price as a random walk
open  = close .+ 0.5 .* randn(n)
high  = max.(open, close) .+ rand(n)
low   = min.(open, close) .- rand(n)

bars = OHLC[(open[i], high[i], low[i], close[i]) for i in 1:n]   # (open, high, low, close)
ohlc(bars; xlabel = "Day", ylabel = "Price", legend = false, title = "OHLC Chart")
```

## Reading It
- The **vertical extent** of each bar is the period's low-to-high range.
- The **left tick** marks the open; the **right tick** marks the close.
- A close tick **above** the open tick means the period rose; **below** means it fell.

## Cautions
- Needs genuine **OHLC** data — a single close-price series only supports a line.
- The built-in `ohlc` series is **single-colour** (no up/down green/red, no filled bodies); for coloured candlestick bodies, draw them manually (`plot!` per bar) or use a dedicated finance plotting package.
- Bars crowd at high `n`; thin the window or aggregate to wider periods.

## See Also
- [Time Series Plot](tsplot.md) · [Ribbon Plot](ribbon.md) · [Decision Guide](decision-guide.md)
