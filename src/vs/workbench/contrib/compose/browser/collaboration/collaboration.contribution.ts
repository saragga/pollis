/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize, localize2 } from '../../../../../nls.js';
import { Action2, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../../../../platform/configuration/common/configurationRegistry.js';
import { InstantiationType, registerSingleton } from '../../../../../platform/instantiation/common/extensions.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../../platform/registry/common/platform.js';
import { registerWorkbenchContribution2, WorkbenchPhase } from '../../../../common/contributions.js';
import { CollaborationEditorBars } from './collaborationEditorBar.js';
import { CollaborationService, ICollaborationService, SIGNALLING_SETTING } from './collaborationService.js';
import './testConnection.js';

// Compose > Collaboration: starting, joining and leaving a session, the chat, Test Connection, and Share My Editor.
// The menu items are in compose.contribution.ts; these are the commands behind them.

/** The Collaboration commands built so far; compose.contribution.ts leaves them out of its "Not yet implemented" stubs. */
export const IMPLEMENTED_COLLABORATION_COMMANDS: ReadonlySet<string> = new Set([
	'pollis.collaboration.startSideBySide',
	'pollis.collaboration.joinSession',
	'pollis.collaboration.leaveSession',
	'pollis.collaboration.invitePeople',
	'pollis.collaboration.showParticipants',
	'pollis.collaboration.openChat',
	'pollis.collaboration.testConnection',
]);

registerWorkbenchContribution2(CollaborationEditorBars.ID, CollaborationEditorBars, WorkbenchPhase.AfterRestored);

registerSingleton(ICollaborationService, CollaborationService, InstantiationType.Delayed);

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
	id: 'pollisCollaboration',
	title: localize('collaboration.configurationTitle', "Pollis Collaboration"),
	type: 'object',
	properties: {
		[SIGNALLING_SETTING]: {
			type: 'string',
			enum: ['nostr', 'mqtt'],
			enumDescriptions: [
				localize('collaboration.signallingNostr', "Free public nostr relays (the default)."),
				localize('collaboration.signallingMqtt', "Free public MQTT brokers, for networks that block the nostr relays."),
			],
			default: 'nostr',
			scope: ConfigurationScope.APPLICATION,
			markdownDescription: localize('collaboration.signalling', "The free public servers that introduce the participants of a session you start; after that they connect directly. The invitation says which, so the others need not change this. **Compose > Collaboration > Test Connection...** shows which are reachable from your network."),
		},
	},
});

const category = localize2('collaboration.category', "Collaboration");

function registerCollaborationCommand(id: string, title: ReturnType<typeof localize2>, run: (service: ICollaborationService) => unknown): void {
	registerAction2(class extends Action2 {
		constructor() {
			super({ id, title, category, f1: true });
		}
		async run(accessor: ServicesAccessor): Promise<void> {
			await run(accessor.get(ICollaborationService));
		}
	});
}

registerCollaborationCommand('pollis.collaboration.startSideBySide', localize2('collaboration.startSideBySideCommand', "Start Side by Side Session..."), service => service.startSession());
registerCollaborationCommand('pollis.collaboration.joinSession', localize2('collaboration.joinSessionCommand', "Join Session..."), service => service.joinSession());
registerCollaborationCommand('pollis.collaboration.leaveSession', localize2('collaboration.leaveSessionCommand', "Leave Session"), service => service.leaveSession());
registerCollaborationCommand('pollis.collaboration.invitePeople', localize2('collaboration.invitePeopleCommand', "Invite People..."), service => service.copyInvitation());
registerCollaborationCommand('pollis.collaboration.showParticipants', localize2('collaboration.showParticipantsCommand', "Show Participants"), service => service.showParticipants());
registerCollaborationCommand('pollis.collaboration.openChat', localize2('collaboration.openChatCommand', "Open Chat"), service => service.openChat());
