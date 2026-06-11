# Pollis TOML Migration Guide

This document describes the TOML-based declarative webview architecture for Pollis.

## Overview

Instead of manually writing TypeScript metadata files for each webview, webview creators can now:

1. Write a **TOML file** with all declarative metadata (packages, notebooks, wikis, references, etc.)
2. Run the **TOML transformer** to auto-generate TypeScript data files
3. The generated files are dropped into `src/vs/workbench/contrib/model/browser/webviews/`

## Files in this system

- **`build/lib/toml-to-ts.ts`** — Core TOML parser and TypeScript generator
- **`build/gulpfile.toml.ts`** — Gulp tasks for transformation and watching
- **`*.toml`** — Declarative webview metadata files (e.g., `xlsx.toml`)
- **`src/.../webviews/*.data.ts`** — Auto-generated TypeScript files (not committed)

## TOML Structure

A webview TOML file has this structure:

```toml
[meta]
title = "Model Name"
viewType = "pollis.acronym"
defaultModel = "modelName"
models = ["modelName1", "modelName2"]

[[packages]]
name = "Package.jl"
github = "https://github.com/..."

[[notebookSections]]
label = "Section Label"

[[notebookSections.notebooks]]
name = "Notebook Name"
file = "acronym/tutorial-01-name.ipynb"
bundled = true
description = "Brief description"

[[wikis]]
name = "Wiki Name"
file = "acronym/filename.md"
bundled = true
description = "Brief description"

[[references]]
title = "Paper Title"
authors = "Author Names"
year = 2024
journal = "Journal Name"
doi = "10.1234/..."
openAccess = true
```

## Workflow

### Step 1: Create a TOML file

Create `acronym.toml` in the repository root (same level as `xlsx.toml`).

### Step 2: Run the transformer

```bash
npm run gulp compile-toml
```

This generates `src/vs/workbench/contrib/model/browser/webviews/acronym.data.ts`.

### Step 3: Watch for changes (optional)

During development, watch for TOML changes and auto-regenerate:

```bash
npm run gulp watch-toml
```

### Step 4: Use the generated file

The command file imports the generated data:

```typescript
import { ACRONYM_METADATA } from '../webviews/acronym.data.js';
```

## TOML Sections

### `[meta]` — Webview metadata

- `title` — Display name (e.g., "Hugging Face Models")
- `viewType` — Unique identifier (e.g., "pollis.hfm")
- `defaultModel` — Active model toggle on first load
- `models` — Array of model toggle keys
- `wideLayout` (optional) — Use wide layout (default: false)
- `illusCollapsed` (optional) — Collapse illustration pane (default: false)

### `[[packages]]` — Dependency packages

Array of packages used by the webview:

- `name` — Package name (e.g., "Transformers.jl")
- `github` — GitHub repository URL

### `[[notebookSections]]` — Tutorial notebooks

Grouped into sections for the right panel:

- `label` — Section title
- `[[notebookSections.notebooks]]` — Array of notebooks in this section
  - `name` — Notebook title
  - `file` — Path to bundled `.ipynb` file
  - `bundled` — Always `true` for bundled notebooks
  - `description` — Brief description

### `[[wikis]]` — Local wikis

Array of wiki pages (Markdown files):

- `name` — Wiki title
- `file` — Path to bundled `.md` file
- `bundled` — Always `true` for bundled wikis
- `description` — Brief description

### `[[references]]` — Research papers

Array of reference papers:

- `title` — Paper title
- `authors` — Author names (comma-separated)
- `year` — Publication year
- `journal` — Journal or venue name
- `doi` (optional) — DOI string (without https://doi.org/ prefix)
- `url` (optional) — Direct URL to paper
- `openAccess` (optional) — Boolean, true if open access

### `[conceptMap]` — Concept relationship graph

Optional section defining a Mermaid flowchart for the Concept Map button. Structure:

```toml
[conceptMap]
center = "Central Node Label"

[[conceptMap.nodes]]
id = "node-id"
label = "Node Label"
kind = "center|concept|topic|related|external"
model = "modelName"       # Only for "topic" nodes
command = "pollis.cmd.id" # Only for "related" nodes
url = "https://..."       # Only for "external" nodes

[[conceptMap.edges]]
from = "source-node"
to = "target-node"
label = "relationship"
```

### `[[bullets]]` — Subtitle bullet points

Array of methods or capabilities:

```toml
[[bullets]]
text = "Method Name"
detail = "Brief description of the method"
```

### `[[decisionRows]]` — Decision table rows

Array of rows for the comparison table:

```toml
[[decisionRows]]
task = "Task/Method Name"
context = "When to use"
purpose = "Why to use it"
```

### `[miniCharts]` — Mini-chart SVG functions

Object with model-keyed SVG generator functions:

```toml
[miniCharts.modelName]
svg = '''
function mini_modelName() {
    var s = '<svg...>';
    return s;
}
'''
```

### `[[codeBranches]]` — Code examples per model

Array of code examples:

```toml
[[codeBranches]]
model = "modelName"
code = """
using MyPackage
# Julia code here
"""
```

### `[[actionGroups]]` — Next Steps action groups

Grouped actions for the right panel:

```toml
[[actionGroups]]
id = "groupId"
label = "Group Title"

[[actionGroups.actions]]
id = "action-id"
label = "Action Title"
desc = "Brief description"
code = """
using MyPackage
# Julia code
"""
```

## Generated TypeScript Structure

The transformer produces:

```typescript
export const ACRONYM_METADATA: IModelAcronymMetadata = {
	acronym: {
		packages: [...],
		notebooks: [...],
		notebookSections: [...],
		wikis: [...],
		references: [...],
		conceptMap: {...}, // optional
	},
};
```

This matches the interface expected by the command file and handler.

## Next Steps

1. **Create TOML files for HFM and KGM** — Move their metadata to `hfm.toml` and `kgm.toml`
2. **Validate TOML schema** — Add optional JSON schema validation
3. **Integrate into CI/CD** — Regenerate TOML→TS during build automatically
4. **Phase out manual metadata** — Gradually migrate all webviews to TOML-based

## Troubleshooting

### Generated file has incorrect types

Check that your TOML structure matches the expected interface. Common issues:

- Missing required fields (e.g., `bundled: true` for notebooks)
- Wrong array syntax (use `[[name]]` for array of objects)
- Incorrect section names (check spelling)

### Transform doesn't run

Ensure the `.toml` file is in the repository root and has correct naming:

```
/Users/antonio/vscode/acronym.toml  ✅ Correct
/Users/antonio/vscode/src/acronym.toml  ❌ Wrong location
```

### Can't import generated file

Make sure to import from the generated `.data.ts` file:

```typescript
// Correct:
import { ACRONYM_METADATA } from '../webviews/acronym.data.js';

// Wrong:
import { ACRONYM_METADATA } from '../commands/acronym.command.js';
```
