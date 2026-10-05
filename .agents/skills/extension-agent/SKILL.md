---
name: extension-agent
description: "Extension Agent: build a Pollis extension (a data-only toolbox) from a spec TOML that names Pollis menu entries (the origin) and the menus and order they go in (the destination), from start to end: write the extension, finish its README, package it and, in move mode, remove the panels from Pollis. Triggers include 'package these menu entries as an extension', 'make a toolbox from', 'Extension Agent', 'build an extension from this spec'."
---

# Extension Agent

Turns a spec TOML into a Pollis extension under `toolboxes/<name>/`, packaged in `.build/toolboxes/` for the Toolboxes section of the Extensions pane. A Pollis extension has no code: a `package.json` with a `pollisToolboxes` contribution, the panels' TOML files, their wikis and notebooks, an icon and a README.

The mechanical work is done by `build/pollis/makeExtension.ts`; the agent does the parts that need judgment. How a menu entry resolves to its panel (command, panel constant, template, TOML, wikis, notebooks) is in `build/pollis/panelResolver.ts`.

This is the developer version, for the source tree. Pollis users get the same agent as the `package-toolbox` skill of an agent plugin, `pollis-agents`, in its own repository, [Trumpingtons/pollis-plugins](https://github.com/Trumpingtons/pollis-plugins) (the default marketplace in `chat.plugins.marketplaces`, installed from the Agent Plugins section of the Extensions pane). Its builder, `plugins/pollis-agents/scripts/makeToolbox.mjs` there, needs only Node and reads the panels from this repository's `main` through `build/pollis/panel-index.json`. Regenerate that index with `node build/pollis/makePanelIndex.ts` (and commit it) whenever a panel, a command, a menu title, a wiki or notebook file, or a toolbox under `toolboxes/` is added, renamed or removed; `node build/pollis/makePanelIndex.ts --check` tells whether it is up to date. A change to the resolution in `panelResolver.ts` or to the index format needs the matching change to the plugin's builder, in the other repository. The plugin's other skill, `create-panel`, and its validator read Pollis' own panel TOML parser from `build/pollis/pollisToml.mjs`, generated from `tomlPanelData.ts` by `node build/pollis/makePollisToml.ts`: run it again (and commit the result) whenever `tomlPanelData.ts` changes; `--check` tells whether it is up to date.

## The spec

The format is documented at the top of `build/pollis/makeExtension.ts`. In short:

```toml
[extension]
name = "pollis-toolbox-finance"
displayName = "Finance Toolbox"
description = "..."
mode = "copy"

[[menu]]
id = "finance"
title = "Finance Toolbox"
menu = "Toolboxes"
group = "2_toolboxes"
order = 4

[[menu.items]]
command = "chiara.statistics.lm"
title = "Linear Regression"
group = "1_models"
order = 1
```

- **Origin**: each `[[menu.items]]` names a menu entry by its `command` (or the panel by `panel = "<id>"`). If the user names entries by their menu titles, find the command ids in the `*.contribution.ts` files (`appendMenuItem` blocks) and say which you chose.
- **Destination**: `menu` is Toolboxes (default), Explore, Model, Simulate, Optimise or the id of an existing submenu (`new MenuId('...')`); `inline = true` puts the entries straight into that menu without a submenu. `group` and `order` set the order.
- **Mode**: `copy` makes independent copies and leaves Pollis unchanged: panel id `<prefix>.<id>`, command `pollis.<name>.<panel id>`, and the wiki and notebook folders the copy ships renamed `<prefix>.<folder>`, with the TOML's `file` entries rewritten (`renameMaterialFolders` in `panelResolver.ts`; `prefix` in `[extension]`, default the name without `pollis-toolbox-`). `move` keeps the ids, the command ids and the folder names, and the panels must then be removed from Pollis.

## Steps

1. **Read the spec.** If something is missing (name, display name, description, mode, destination), ask once, with sensible defaults offered. Do not invent a description: ask, or propose one for approval.
2. **Run the script**: `node build/pollis/makeExtension.ts <spec.toml>` (add `--overwrite` only when the user agreed to replace an existing `toolboxes/<name>/`). It stops with a clear message on what cannot be packaged:
   - a panel with its own code (illustrationOverrideJs, extraCss, ...) or a gallery: cannot be data-only. Report it and continue without it only if the user agrees.
   - an unknown command, panel or menu.
   Report every warning (a wiki or notebook the TOML names that does not exist).
3. **Finish the README** (`toolboxes/<name>/README.md`): fill the "What it covers" column, one short line per panel, from the panel's TOML (models, key points), in the style of the existing toolbox READMEs (`toolboxes/pollis-toolbox-economics/README.md`). Keep the rest of the generated README. Show it to the user before packaging.
4. **Move mode only, after asking**: the script lists, per panel, where Pollis registers it: every command that opens it, its menu items, its `*.command.ts`, `*.template.ts` and `.toml`, and its wiki and notebook folders. Remove them (`git rm` for files; edit the contribution files, removing the now-unused imports and constants). Also grep the repository for each command id and panel id: Next Steps actions in other panels' TOML, Pollis Views built-ins, `*.types.ts` files, docs. Report what you found; never remove anything the list does not name without asking. Follow the earlier moves as a model: `git show f0e23a838df --stat`.
5. **Check**:
   - `npm run compile-check-ts-native` when Pollis code changed (move mode);
   - `node build/pollis/packageToolboxes.ts`: the new `.vsix` is written;
   - `unzip -l .build/toolboxes/<name>-<version>.vsix`: package.json, panels/, wiki/, notebooks/, README.md, icon.png.
6. **Report**: the panels, where they go, anything left out and why, the checks. Publishing is done by the user (force-push to the `toolboxes-dist` branch, steps at the top of `build/pollis/packageToolboxes.ts`); do not push it. Do not commit unless asked.

## Rules

- `packageToolboxes.ts` packages every folder under `toolboxes/`: never leave a test toolbox there.
- Copy mode gives each copy its own editor tab, `~/.pollis` folders (saved examples, references, videos) and wiki and notebook folders, so installing the extension never changes what Pollis' own panel shows. Files the TOML names in folders the copy does not ship (another toolbox's, say) keep resolving where they do in Pollis.
- Never use DataFrames, never name a university, Open VSX not Marketplace (the Pollis documentation rules apply to READMEs too).
