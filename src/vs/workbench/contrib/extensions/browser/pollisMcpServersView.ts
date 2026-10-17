/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/pollisToolboxesView.css';
import * as dom from '../../../../base/browser/dom.js';
import { Button } from '../../../../base/browser/ui/button/button.js';
import { CountBadge } from '../../../../base/browser/ui/countBadge/countBadge.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { KeyCode } from '../../../../base/common/keyCodes.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { defaultButtonStyles, defaultCountBadgeStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IViewPaneOptions, ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IMcpServer, MCP_SERVERS, MCP_SERVERS_COMMAND_ID } from '../../compose/common/mcpServers.js';

/**
 * The MCP Servers - Recommended section of the Extensions pane: the servers of Compose > MCP Servers,
 * each with a Set Up button that opens that page at the server, where it is added to a coding agent.
 * It looks like the Toolboxes section, whose styles it shares.
 */
export class PollisMcpServersView extends ViewPane {

	static readonly ID = 'workbench.views.extensions.pollisMcpServers';

	private root: HTMLElement | undefined;
	private list: HTMLElement | undefined;
	private readonly rowDisposables = this._register(new DisposableStore());
	/** The first row's button, which takes the focus. */
	private firstButton: Button | undefined;

	constructor(
		options: IViewPaneOptions,
		@ICommandService private readonly commandService: ICommandService,
		@IKeybindingService keybindingService: IKeybindingService,
		@IContextMenuService contextMenuService: IContextMenuService,
		@IConfigurationService configurationService: IConfigurationService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IOpenerService openerService: IOpenerService,
		@IThemeService themeService: IThemeService,
		@IHoverService hoverService: IHoverService,
	) {
		super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
	}

	protected override renderHeader(container: HTMLElement): void {
		container.classList.add('extension-view-header', 'pollis-toolboxes-header');
		super.renderHeader(container);
		const badge = this._register(new CountBadge(dom.append(container, dom.$('.count-badge-wrapper')), {}, defaultCountBadgeStyles));
		badge.setCount(MCP_SERVERS.length);
	}

	protected override renderBody(container: HTMLElement): void {
		super.renderBody(container);
		this.root = dom.append(container, dom.$('.pollis-toolboxes'));
		this.list = dom.append(this.root, dom.$('.pollis-toolboxes-list'));
		for (const server of MCP_SERVERS) {
			this.renderRow(this.list, server);
		}
	}

	private renderRow(container: HTMLElement, server: IMcpServer): void {
		const row = dom.append(container, dom.$('.pollis-toolbox'));
		row.tabIndex = 0;
		row.title = localize('pollisMcpServers.setUpTitle', "{0}: set it up in Compose > MCP Servers", server.label);
		dom.append(row, dom.$(`span.icon.mcp-icon${ThemeIcon.asCSSSelector(Codicon.mcp)}`));
		const details = dom.append(row, dom.$('.details'));
		const header = dom.append(details, dom.$('.header'));
		dom.append(header, dom.$('span.name', undefined, server.label));
		const description = dom.append(details, dom.$('.description', undefined, server.description));
		description.title = server.description;
		dom.append(details, dom.$('.author', undefined, server.provider));

		const actionContainer = dom.append(row, dom.$('.action'));
		this.rowDisposables.add(dom.addDisposableListener(row, dom.EventType.CLICK, e => {
			if (!actionContainer.contains(e.target as Node)) {
				this.setUp(server);
			}
		}));
		this.rowDisposables.add(dom.addStandardDisposableListener(row, dom.EventType.KEY_DOWN, e => {
			if (e.target === row && (e.keyCode === KeyCode.Enter || e.keyCode === KeyCode.Space)) {
				e.preventDefault();
				this.setUp(server);
			}
		}));
		const button = this.rowDisposables.add(new Button(actionContainer, { ...defaultButtonStyles }));
		this.firstButton ??= button;
		button.label = localize('pollisMcpServers.setUp', "Set Up");
		this.rowDisposables.add(button.onDidClick(() => this.setUp(server)));
	}

	/** Opens Compose > MCP Servers at the server. */
	private setUp(server: IMcpServer): void {
		this.commandService.executeCommand(MCP_SERVERS_COMMAND_ID, server.name);
	}

	override focus(): void {
		super.focus();
		this.firstButton?.focus();
	}

	protected override layoutBody(height: number, width: number): void {
		super.layoutBody(height, width);
		if (this.root) {
			this.root.style.height = `${height}px`;
		}
		// As tall as its rows, like the Toolboxes section
		const content = this.list?.offsetHeight ?? 0;
		if (content > 0 && (content !== this.minimumBodySize || content !== this.maximumBodySize)) {
			this.minimumBodySize = content;
			this.maximumBodySize = content;
		}
	}
}
