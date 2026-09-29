# Authentication

Browsing the Kaggle catalogue needs no credentials. A token is required only to **list a dataset's files** and to **download** datasets (and to access private datasets or higher rate limits).

## Get a token

1. Sign in at [kaggle.com](https://www.kaggle.com).
2. Open **Settings → API → Create New Token**. This downloads a `kaggle.json` file containing your **username** and **key**.
3. Copy those two values.

## Set them in Pollis

Click **Set credentials** on the *Powered by* line of this webview and paste your username and API key. Pollis stores them in VS Code **Secret Storage** — never in settings, generated code, or any saved file. The same credentials are shared with the **Kaggle Models** webview.

## How they are used

- **Julia REPL:** when you *Send to Julia REPL*, Pollis injects the credentials into that session only, as `ENV["KAGGLE_USERNAME"]` and `ENV["KAGGLE_KEY"]`. They are set as session environment variables and never land on disk.
- **The Kaggle CLI / library** read these same `KAGGLE_*` environment variables, so `run(\`kaggle datasets download …\`)` works once they are set.
- **REST API:** the generated code builds an HTTP Basic auth header from them:

```julia
using Base64
auth = ["Authorization" => "Basic " * base64encode(ENV["KAGGLE_USERNAME"] * ":" * ENV["KAGGLE_KEY"])]
```

> **Send to Editor / Notebook do not inject the credentials.** Those persist to disk, so you must set the environment variables in that session yourself.

## See Also
- [Factsheet](factsheet.md) — endpoints and the Julia stack
- [Downloading & Loading](downloading-loading.md) — where the token is needed
