# Authentication

Alpha Vantage requires a **free API key**. This page explains how to get one and how Pollis stores it.

## Get a Free Key

1. Visit [alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key).
2. Enter your email and click **Get Free API Key**.
3. Copy the key (a short alphanumeric string).

The free tier is enough for the examples here (see the Constraints page for rate limits).

## Store It Securely in Pollis

Click the **Set API key** link on the "Powered by:" line at the top of the webview. A masked input appears; paste your key and press Enter. The key is saved in **VS Code Secret Storage** (encrypted, per-machine) under `pollis.apiKey.alphavantage`.

- A green **🔑 API key** indicator confirms it is saved.
- Use **change** to replace it or **clear** to remove it.
- The key is **never** written into generated code, notebooks, editor files, or settings.

## How the Key Reaches Julia

AlphaVantage.jl's global client reads the `ALPHA_VANTAGE_API_KEY` environment variable. When you **Send to Julia REPL**, Pollis first sets that variable for the session:

```julia
ENV["ALPHA_VANTAGE_API_KEY"] = "<your key>"   # injected silently, not shown in files
using AlphaVantage
time_series_daily("AAPL")
```

For **Send to Editor / Notebook**, the key is *not* injected (those files persist to disk). Set it yourself in that session, e.g. by running the REPL once or adding `ENV["ALPHA_VANTAGE_API_KEY"] = "..."` locally.

## Setting It Manually (Alternative)

Outside Pollis you can export the variable in your shell, or set the client key directly:

```julia
client = AlphaVantage.GLOBAL[]
client.key = "YOURKEY"
```

## See Also
- [Constraints](constraints.md) · [Diagnostics](diagnostics.md) · [Overview](overview.md)
