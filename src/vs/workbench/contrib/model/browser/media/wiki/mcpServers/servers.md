# MCP Servers — The Servers Listed

## Which MCP Servers Pollis Lists

| Server | Runs | Sign-in | Gives an agent | Maker and license |
|---|---|---|---|---|
| FRED | Remote | Yes, a free FRED MCP Connector account, no API key | Economic time series from FRED, with their notes and observations | The provider |
| Hugging Face | Remote | No account needed | Models, datasets and Spaces of the Hugging Face Hub | The provider |
| DuckDB | Local | None | SQL on CSV, Parquet and JSON files, in an in-memory database | MotherDuck, MIT |
| arXiv | Local | None | Searching and downloading papers | Community, Apache-2.0 |
| Zotero | Local | None | Reading a local Zotero library, with its BibTeX and full text | Community, MIT |

## How a Local MCP Server Runs With uv
A local MCP server runs on this computer, started by the agent with `uvx`, the tool of `uv` that runs a Python program in its own environment without installing it for the system. When `uv` is missing the page says **uv is not installed** and offers **Install uv**. A remote server needs none of this, as its provider runs it and the agent only needs its address, shown as the **Endpoint**.

## What the Local DuckDB, arXiv and Zotero Servers Require
The DuckDB server starts with `uvx mcp-server-motherduck` on an in-memory database (`:memory:`), can read and write, and returns at most 1,024 rows per result. The arXiv server keeps downloaded papers in `~/.arxiv-mcp-server`. The Zotero server only reads; it needs Zotero 7 or later open, with "Allow other applications on this computer to communicate with Zotero" ticked in Zotero's Settings > Advanced, and runs with `ZOTERO_LOCAL=true`.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Sign-In and Tokens](sign-in.md)
