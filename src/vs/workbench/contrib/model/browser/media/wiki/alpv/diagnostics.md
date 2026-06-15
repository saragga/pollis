# Alpha Vantage — Diagnostics

Common problems when calling Alpha Vantage and how to recognise them.

## Missing or Invalid API Key

**Symptom:** an authentication error, or a JSON note about the API key.

- Confirm a key is saved: the green **🔑 API key** indicator should show on the "Powered by:" line.
- When sending to a notebook or editor (not the REPL), the key is not injected — set `ENV["ALPHA_VANTAGE_API_KEY"]` in that session yourself (see Authentication).

## Rate-Limit Notes

**Symptom:** the returned value contains a note like "Thank you for using Alpha Vantage" instead of data.

You have exceeded the free-tier limit (per-minute or per-day). Wait and retry, cache results, or upgrade your plan. This is returned as **data**, not an exception — inspect the value if it looks wrong.

## Premium-Only Endpoints

**Symptom:** a `PremiumEndpointError` exception.

The endpoint requires premium access. Use a free-tier equivalent or upgrade your key. The exception message names the endpoint.

## Empty or Unexpected Series

**Symptom:** very little data, or fields you did not expect.

- `outputsize="compact"` returns only the latest 100 points; use `"full"` for history.
- Intraday intervals only cover recent windows.
- Check the symbol format (equities vs forex vs crypto differ — see Constraints).

## Network or Parsing Errors

**Symptom:** an HTTP error or a parse failure.

Transient network issues or a changed response shape. Retry; if it persists, check the Alpha Vantage status and the AlphaVantage.jl issue tracker.
