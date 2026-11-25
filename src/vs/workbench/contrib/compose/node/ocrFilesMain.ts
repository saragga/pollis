/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The downloads and checks of OCR Files and Snippets (ocrFiles.ts), in a utility process of their own (see
// ../electron-browser/ocrFilesService.ts).

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { Server as ChildProcessServer } from '../../../../base/parts/ipc/node/ipc.cp.js';
import { Server as UtilityProcessServer } from '../../../../base/parts/ipc/node/ipc.mp.js';
import { isUtilityProcess } from '../../../../base/parts/sandbox/node/electronTypes.js';
import { OcrFiles } from './ocrFiles.js';

const server = isUtilityProcess(process) ? new UtilityProcessServer() : new ChildProcessServer('ocrFiles');
server.registerChannel('ocrFiles', ProxyChannel.fromService(new OcrFiles(), new DisposableStore()));
