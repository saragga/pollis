# MCP Servers — Overview

## What the Model Context Protocol Is
The Model Context Protocol (MCP) is an open standard by which a program such as a coding agent reaches outside tools and data through one interface: each server declares its tools, and the agent calls them while it works ([Hou, Zhao, Wang and Wang (2025)](#ref-HZWW2025a)). The agent's maker need not write a connection to each service, and a service need not write one for each agent.

## What to Watch Before Adding an MCP Server
An MCP server's descriptions reach the agent's model, and its tools act with the agent's permissions. [Hou, Zhao, Wang and Wang (2025)](#ref-HZWW2025a) survey the risks, among them tool descriptions written to mislead the model and servers that change after being installed. Add servers whose maker is known, and read the agent's request before allowing a tool that writes. The MCP Servers page marks the community servers as such, and lists what each one can touch under **About This Server and Its Terms**.

## Where Each Coding Agent Keeps Its MCP Servers
Each agent has its own list. Claude Code keeps its servers in `~/.claude.json`, written by `claude mcp add --scope user`. Codex keeps them in `~/.codex/config.toml`, written by `codex mcp add`. OpenCode keeps them in `~/.config/opencode/opencode.json`, which Pollis edits directly. The MCP Servers page reads these files again whenever it regains focus, so a server added by hand shows as **Added**.

## What Studies Have Found in Open-Source MCP Servers
[Hasan, Li, Fallahzadeh, Rajbahadur, Adams and Hassan (2025)](#ref-HLFRA...2025a) examine 1,899 open-source MCP servers: 7.2% have general vulnerabilities, 5.5% have tool poisoning specific to MCP, 66% have code smells and 14.4% have bug patterns. [Song, Shen, Luo, Guo, Chen, Wang, Li, Zhang and Chen (2025)](#ref-SSLGC...2025a) set out four kinds of attack: tool poisoning, puppet attacks, rug pulls and malicious external resources. Malicious servers they built were successfully uploaded to three widely used aggregator platforms, and 20 participants in their user study struggled to identify such servers. A listing on an aggregator is thus no sign of a check.

## How Tool Poisoning Works on an MCP Server
Tool poisoning puts instructions for the model into a tool's metadata, so the attack works without the tool being called. MCPTox, by [Wang, Gao, Wang, Liu, Sun, Cheng, Shi, Du and Li (2025)](#ref-WGWLS...2025a), measures it on 45 live servers and 353 tools, with 1,348 test cases across 20 agent settings. The highest attack success is 72.8%, more capable models are often more susceptible, and the highest refusal rate is under 3%. The attack is a case of the indirect prompt injection of [Greshake, Abdelnabi, Mishra, Endres, Holz and Fritz (2023)](#ref-GAMEH...2023a), and a model's refusals cannot be relied on against it.

## References

<a id="ref-GAMEH...2023a"></a>Greshake, K., Abdelnabi, S., Mishra, S., Endres, C., Holz, T. and Fritz, M. (2023). Not what you've signed up for: compromising real-world LLM-integrated applications with indirect prompt injection. *Proceedings of the 16th ACM Workshop on Artificial Intelligence and Security*, 79–90. [doi:10.1145/3605764.3623985](https://doi.org/10.1145/3605764.3623985)

<a id="ref-HLFRA...2025a"></a>Hasan, M. M., Li, H., Fallahzadeh, E., Rajbahadur, G. K., Adams, B. and Hassan, A. E. (2025). Model Context Protocol (MCP) at first glance: studying the security and maintainability of MCP servers. *arXiv preprint*. [arXiv:2506.13538](https://arxiv.org/abs/2506.13538)

<a id="ref-HZWW2025a"></a>Hou, X., Zhao, Y., Wang, S. and Wang, H. (2025). Model Context Protocol (MCP): landscape, security threats, and future research directions. *arXiv preprint*. [arXiv:2503.23278](https://arxiv.org/abs/2503.23278)

<a id="ref-SSLGC...2025a"></a>Song, H., Shen, Y., Luo, W., Guo, L., Chen, T., Wang, J., Li, B., Zhang, X. and Chen, J. (2025). Beyond the protocol: unveiling attack vectors in the Model Context Protocol (MCP) ecosystem. *arXiv preprint*. [arXiv:2506.02040](https://arxiv.org/abs/2506.02040)

<a id="ref-WGWLS...2025a"></a>Wang, Z., Gao, Y., Wang, Y., Liu, S., Sun, H., Cheng, H., Shi, G., Du, H. and Li, X. (2025). MCPTox: a benchmark for tool poisoning attack on real-world MCP servers. *arXiv preprint*. [arXiv:2508.14925](https://arxiv.org/abs/2508.14925)

## See Also
- [Factsheet](factsheet.md) · [The Servers Listed](servers.md) · [Sign-In and Tokens](sign-in.md)
