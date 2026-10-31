# MCP Servers — Factsheet

**MCP Servers** adds servers of the Model Context Protocol to a coding agent, so that the agent can use outside data and tools, and shows which agents already have them.

| | |
|---|---|
| **Purpose** | Add, sign in to or remove an MCP server for each coding agent |
| **Servers** | FRED, Hugging Face, DuckDB, arXiv, Zotero |
| **Agents** | Claude Code, Codex and OpenCode |
| **Shown for a server** | Endpoint or Command, Tools, Requires, About This Server and Its Terms |
| **Actions** | Add and Sign In, Add, Sign In, Remove |
| **Key choice** | Which servers an agent should be able to reach |

## When to Use MCP Servers
- Letting a coding agent read economic series, models, a local database, papers or a Zotero library.
- Checking which servers an agent already has, since the page reads each agent's own configuration.
- Installing `uv`, which the local servers need to run.
- Removing a server from an agent.

## What MCP Servers Does Not Do
The MCP Servers page does not call a server itself or show its data: only the agent does, while it works. Pollis holds no token, and it does not add servers to Ask Pollis or to the chats. Whether a server's terms suit a use is for the user to read under **About This Server and Its Terms**.

## See Also
- [Overview](overview.md) · [The Servers Listed](servers.md) · [Sign-In and Tokens](sign-in.md)
