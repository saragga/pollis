# Coding Agents — Pollis Skills

## What Installing the Pollis Skills Does for Claude Code
For Claude Code, **Install Skills** runs Claude Code's own plugin commands in a terminal: it adds the Pollis marketplace, then installs the plugin. The page reads `~/.claude/plugins/installed_plugins.json` to show **Skills Installed** with **Update** beside it.

## What Installing the Pollis Skills Does for Codex and OpenCode
For an agent other than Claude Code, Pollis downloads the latest skills to `~/.pollis/agents/pollis-agents` and copies each skill's folder to `~/.agents/skills`, where Codex and OpenCode read personal skills. A marker file in each copied folder records that Pollis installed it. A folder in `~/.agents/skills` that Pollis did not install is left as it is, and the notification names it.

## Why Skills Are Installed Once for All Folders
Installed skills are available to the agent in any folder, even outside Pollis, so a task does not have to copy them into a project. A skill can then also be asked for by name in an agent started by hand. Updating replaces the copies Pollis made with the latest version and leaves everything else alone.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Other Agents](other-agents.md)
