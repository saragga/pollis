# Coding Agents — Other Agents

## Adding a Coding Agent Pollis Does Not List
Under **Other Agents** on the Coding Agents page, the **+** adds a row with a name and a command line, saved in the setting `pollis.agents.otherAgents` once both are filled. Names must be unique. **Remove** takes the row out. The row then appears in Model Tasks and Routing as a column of the table, like the agents Pollis lists, and its state on this computer is read again whenever the page regains focus.

## How the First Message Reaches an Added Agent
Write `{prompt}` in the command line of an added agent where its first message goes, for example `myagent --prompt {prompt}`. Without `{prompt}`, the agent starts with no message: Pollis copies the first message to the clipboard, and a notification says to paste it. On Windows the command runs through the command shell named by `ComSpec`, so that batch files start as they do at a prompt.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Pollis Skills](pollis-skills.md)
