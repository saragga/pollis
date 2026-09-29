# Authentication

FRED requires a **free API key**. This page explains how to get one and how Pollis stores it.

## Get a Free Key

1. Create a free account at [fredaccount.stlouisfed.org](https://fredaccount.stlouisfed.org/login/secure/).
2. Open **My Account → API Keys** and click **Request API Key**.
3. Copy the key (a 32-character lowercase alphanumeric string).

The key is free and the request is approved instantly.

## Store It Securely in Pollis

Click the **Set API key** link on the "Powered by:" line at the top of the webview. A masked input appears; paste your key and press Enter. The key is saved in **VS Code Secret Storage** (encrypted, per-machine) under `pollis.apiKey.fred`.

- A green **🔑 API key** indicator confirms it is saved.
- Use **change** to replace it or **clear** to remove it.
- The key is **never** written into generated code, notebooks, editor files, or settings.

## How the Key Reaches Julia

`Fred()` reads the `FRED_API_KEY` environment variable. When you **Send to Julia REPL**, Pollis first sets that variable for the session:

```julia
ENV["FRED_API_KEY"] = "<your key>"   # injected silently, not shown in files
using FredData
f = Fred()
get_data(f, "GDPC1")
```

For **Send to Editor / Notebook**, the key is *not* injected (those files persist to disk). Set it yourself in that session, e.g. by running the REPL once or adding `ENV["FRED_API_KEY"] = "..."` locally.

## Setting It Manually (Alternative)

Outside Pollis you can:

- pass the key explicitly: `f = Fred("yourkey")`;
- export `FRED_API_KEY` in your shell; or
- save it to `~/.freddatarc`, which `Fred()` reads automatically:

```
[FRED]
api_key = yourkey
```

## See Also
- [Finding Series](finding-series.md) · [Overview](overview.md) · [Factsheet](factsheet.md)
