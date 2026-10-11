/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { $, append, clearNode } from '../../../../../base/browser/dom.js';
import { Button } from '../../../../../base/browser/ui/button/button.js';
import { Event } from '../../../../../base/common/event.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { Disposable, DisposableMap, DisposableStore, toDisposable } from '../../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { IContextKeyService, RawContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService, ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { defaultButtonStyles } from '../../../../../platform/theme/browser/defaultStyles.js';
import { EditorGroupView } from '../../../../browser/parts/editor/editorGroupView.js';
import { IWorkbenchContribution } from '../../../../common/contributions.js';
import { EditorResourceAccessor } from '../../../../common/editor.js';
import { IEditorGroup, IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { shareableKind } from './collaborationEditors.js';
import { ICollaborationService } from './collaborationService.js';

// The buttons below the editors during a session: Share My Editor below my editors, and Copy to My Editor
// and Compare with Mine below a snapshot another participant shared. Like the chat editing overlay, each
// editor group gets a bar floating at its bottom. A Pluto page draws above the editor group, which would hide
// the bar, so its Share My Editor is a button in the internal browser's toolbar instead.

/** Whether a session is live. */
const IN_SESSION = new RawContextKey<boolean>('pollisCollaborationInSession', false);

/** One editor group's bar, shown for its active editor while a session is live. */
class GroupBar extends Disposable {

	private readonly node = $('.pollis-collaboration-bar');
	private readonly buttons = this._register(new DisposableStore());

	constructor(
		private readonly group: EditorGroupView,
		@ICollaborationService private readonly collaborationService: ICollaborationService,
	) {
		super();
		const style = this.node.style;
		style.position = 'absolute';
		style.bottom = '16px';
		style.left = '50%';
		style.transform = 'translateX(-50%)';
		style.zIndex = '100';
		style.display = 'flex';
		style.alignItems = 'center';
		style.gap = '8px';
		style.padding = '4px 8px';
		style.borderRadius = '6px';
		style.fontSize = '12px';
		style.whiteSpace = 'nowrap';
		style.color = 'var(--vscode-editorWidget-foreground)';
		style.background = 'var(--vscode-editorWidget-background)';
		style.border = '1px solid var(--vscode-editorWidget-border, transparent)';
		style.boxShadow = '0 0 8px 2px var(--vscode-widget-shadow)';
		this._register(toDisposable(() => this.node.remove()));
		this._register(Event.any(group.onDidActiveEditorChange, collaborationService.onDidChangeSession, collaborationService.onDidChangeShared)(() => this.render()));
		this.render();
	}

	private render(): void {
		this.buttons.clear();
		clearNode(this.node);
		const editor = this.group.activeEditor;
		const resource = editor && EditorResourceAccessor.getOriginalUri(editor);
		const snapshot = resource && this.collaborationService.sharedSnapshot(resource);
		if (!this.collaborationService.inSession || !editor) {
			this.node.remove();
			return;
		}
		if (resource && snapshot) {
			const time = new Date(snapshot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
			append(this.node, $('span')).textContent = localize('collaboration.sharedBy', "Shared by {0} at {1}", snapshot.sharer, time);
			this.addButton(localize('collaboration.copyToMyEditor', "Copy to My Editor"), false, () => this.collaborationService.copyToMyEditor(resource));
			this.addButton(localize('collaboration.compareWithMine', "Compare with Mine"), true, () => this.collaborationService.compareWithMine(resource));
		} else if (shareableKind(editor) === 'text' || shareableKind(editor) === 'notebook') {
			this.addButton(localize('collaboration.shareMyEditor', "Share My Editor"), false, () => this.collaborationService.shareEditor(editor));
		} else {
			this.node.remove();
			return;
		}
		if (!this.group.element.contains(this.node)) {
			this.group.element.appendChild(this.node);
		}
	}

	private addButton(label: string, secondary: boolean, run: () => unknown): void {
		const button = this.buttons.add(new Button(this.node, { ...defaultButtonStyles, secondary }));
		button.label = label;
		button.element.style.width = 'auto';
		button.element.style.padding = '2px 10px';
		this.buttons.add(button.onDidClick(() => run()));
	}
}

export class CollaborationEditorBars extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.pollisCollaborationEditorBars';

	private readonly bars = this._register(new DisposableMap<IEditorGroup>());

	constructor(
		@IEditorGroupsService editorGroupsService: IEditorGroupsService,
		@IInstantiationService instantiationService: IInstantiationService,
		@ICollaborationService collaborationService: ICollaborationService,
		@IContextKeyService contextKeyService: IContextKeyService,
	) {
		super();
		const inSession = IN_SESSION.bindTo(contextKeyService);
		this._register(collaborationService.onDidChangeSession(() => inSession.set(collaborationService.inSession)));
		inSession.set(collaborationService.inSession);

		const update = () => {
			const removed = new Set(this.bars.keys());
			for (const group of editorGroupsService.groups) {
				if (!(group instanceof EditorGroupView)) {
					continue;
				}
				removed.delete(group);
				if (!this.bars.has(group)) {
					this.bars.set(group, instantiationService.createInstance(GroupBar, group));
				}
			}
			for (const group of removed) {
				this.bars.deleteAndDispose(group);
			}
		};
		this._register(Event.any(editorGroupsService.onDidAddGroup, editorGroupsService.onDidRemoveGroup)(update));
		update();
	}
}

registerAction2(class SharePageAction extends Action2 {
	constructor() {
		super({
			id: 'pollis.collaboration.sharePage',
			title: localize2('collaboration.sharePage', "Share My Editor"),
			icon: Codicon.liveShare,
			// On every page during a session: a page restored by a reload tells its address late, so Pluto is checked on click
			precondition: IN_SESSION,
			menu: { id: MenuId.BrowserActionsToolbar, group: 'actions', order: 10, when: IN_SESSION },
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const editor = accessor.get(IEditorService).activeEditor;
		if (!editor || shareableKind(editor) !== 'pluto') {
			accessor.get(INotificationService).info(localize('collaboration.onlyPluto', "Only a Pluto notebook can be shared from the browser."));
			return;
		}
		await accessor.get(ICollaborationService).shareEditor(editor);
	}
});
