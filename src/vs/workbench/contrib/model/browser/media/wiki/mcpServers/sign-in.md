# MCP Servers — Sign-In and Tokens

## How Signing In to a Remote MCP Server Works
Signing in is done through OAuth by the agent and the browser, not by Pollis. **Add and Sign In** adds the server to the chosen agent and then starts the agent's own sign-in, which opens the browser at the provider's page. The token stays with the agent, so Pollis never sees or stores it. **Sign In** on a server already added starts the same step again. The commands are `claude mcp login`, `codex mcp login` and `opencode mcp auth`.

## Agents for Which MCP Sign-In Is Not Available
When the MCP Servers page says "Sign-in to MCP servers is not documented for this agent yet", the server can be added but the sign-in step must follow the agent's own documentation. "Agent not installed" means the agent's command was not found on this computer: Compose > Coding Agents installs it, and the page updates once it regains focus.

## OAuth 2.0 and PKCE Behind MCP Sign-In
OAuth 2.0 lets a third-party application obtain limited access to an HTTP service ([Hardt (2012)](#ref-Har2012a)). Proof Key for Code Exchange, or PKCE, protects public clients such as a coding agent on a laptop against the interception of the authorization code ([Sakimura, Bradley and Agarwal (2015)](#ref-SBA2015a)). The [MCP authorization specification of 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization) makes authorization optional, applies it to HTTP-based transports, follows the OAuth 2.1 draft and requires clients to implement PKCE. Servers on the STDIO transport should instead take their credentials from the environment, and so have no sign-in.

## References

<a id="ref-Har2012a"></a>Hardt, D. (2012). The OAuth 2.0 Authorization Framework. *RFC 6749*. [doi:10.17487/RFC6749](https://doi.org/10.17487/RFC6749)

<a id="ref-SBA2015a"></a>Sakimura, N., Bradley, J. and Agarwal, N. (2015). Proof Key for Code Exchange by OAuth Public Clients. *RFC 7636*. [doi:10.17487/RFC7636](https://doi.org/10.17487/RFC7636)

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [The Servers Listed](servers.md)
