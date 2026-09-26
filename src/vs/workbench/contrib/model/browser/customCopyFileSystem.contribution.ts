/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { CUSTOM_COPY_KINDS, CustomCopyFileSystemProvider, CustomCopyKind } from './common/customCopyFileSystem.js';

/**
 * Registers the `pollis-wiki:` and `pollis-notebook:` file systems (see {@link CustomCopyFileSystemProvider})
 * before editors are restored, so a wiki or notebook left open in the previous session reopens.
 */
class PollisCustomCopyFileSystems extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'pollis.customCopyFileSystems';

	constructor(
		@IFileService fileService: IFileService,
		@IPathService pathService: IPathService,
	) {
		super();
		for (const kind of Object.keys(CUSTOM_COPY_KINDS) as CustomCopyKind[]) {
			const provider = this._register(new CustomCopyFileSystemProvider(kind, fileService, pathService));
			this._register(fileService.registerProvider(CUSTOM_COPY_KINDS[kind].scheme, provider));
		}
	}
}

registerWorkbenchContribution2(PollisCustomCopyFileSystems.ID, PollisCustomCopyFileSystems, WorkbenchPhase.BlockStartup);
