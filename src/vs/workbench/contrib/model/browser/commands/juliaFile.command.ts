/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CommandsRegistry } from '../../../../../platform/commands/common/commands.js';
import { MenuRegistry, MenuId } from '../../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IUntitledTextResourceEditorInput } from '../../../../common/editor.js';
import { localize } from '../../../../../nls.js';

/**
 * Registers `pollis.action.newJuliaFile` and a "New File: Julia File" entry — internal to Pollis
 * so the New File picker does not depend on the Julia extension. Opens a new untitled editor in
 * Julia language mode (the `julia` language id is provided by the bundled Julia grammar).
 */
export function registerNewJuliaFileCommand(): void {
	CommandsRegistry.registerCommand('pollis.action.newJuliaFile', async (accessor: ServicesAccessor) => {
		const editorService = accessor.get(IEditorService);
		const input: IUntitledTextResourceEditorInput = { resource: undefined, languageId: 'julia' };
		await editorService.openEditor(input);
	});

	MenuRegistry.appendMenuItem(MenuId.NewFile, {
		group: 'file',
		command: {
			id: 'pollis.action.newJuliaFile',
			title: localize('newJuliaFile', "Julia File"),
		},
		order: 25,
	});
}
