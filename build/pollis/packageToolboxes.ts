/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Package the Pollis toolbox extensions as .vsix files, for the Toolboxes section of the
// Extensions pane (src/vs/workbench/contrib/extensions/browser/pollisToolboxesView.ts), to try
// them locally:
//
//   node build/pollis/packageToolboxes.ts
//
// Runs the packaging script of the toolboxes repository, toolboxes/scripts/packageToolboxes.ts
// (toolboxes/ is a clone of Trumpingtons/pollis-toolboxes, ignored by Pollis' git), which writes
// the .vsix files, their READMEs and toolboxes.json to .build/toolboxes/. Publishing needs no step
// here: a push to main of Trumpingtons/pollis-toolboxes packages the toolboxes and replaces its
// branch dist, which Pollis downloads (see the top of that script).

import { execFileSync } from 'child_process';
import * as path from 'path';

const ROOT = path.join(import.meta.dirname, '..', '..');

execFileSync(process.execPath, [path.join(ROOT, 'toolboxes', 'scripts', 'packageToolboxes.ts'), path.join(ROOT, '.build', 'toolboxes')], { stdio: 'inherit' });
