/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Codicon } from '../../../../base/common/codicons.js';
import { truncate } from '../../../../base/common/strings.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { BrowserViewUri } from '../../../../platform/browserView/common/browserViewUri.js';
import { IBrowserEditorViewState } from './browserView.js';
import { EditorInputCapabilities, IEditorSerializer, IUntypedEditorInput, Verbosity } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { TAB_ACTIVE_FOREGROUND } from '../../../common/theme.js';
import { localize } from '../../../../nls.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IBrowserViewWorkbenchService, IBrowserViewModel } from '../common/browserView.js';
import { hasKey } from '../../../../base/common/types.js';
import { ILifecycleService, ShutdownReason } from '../../../services/lifecycle/common/lifecycle.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { logBrowserOpen } from '../../../../platform/browserView/common/browserViewTelemetry.js';
import { LRUCachedFunction } from '../../../../base/common/cache.js';

const LOADING_SPINNER_SVG = (color: string | undefined) => `
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
		<path d="M8 1a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 1.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11z" fill="${color}" opacity="0.3"/>
		<path d="M8 1a7 7 0 0 1 7 7h-1.5A5.5 5.5 0 0 0 8 2.5V1z" fill="${color}">
			<animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" values="0 8 8;360 8 8"/>
		</path>
	</svg>
`;

/**
 * Maximum length for browser page titles before truncation
 */
const MAX_TITLE_LENGTH = 30;

/**
 * JSON-serializable type used during browser state serialization/deserialization
 */
export interface IBrowserEditorInputData extends IBrowserEditorViewState {
	readonly id: string;
	/** POLLIS: the title the tab's opener gave it, and the address it gave it for. */
	readonly label?: IBrowserTabLabel;
	/** POLLIS: the key by which the tab's opener reuses it. */
	readonly reuseKey?: string;
	/** POLLIS: the pages the tab's opener gave it. */
	readonly pages?: IBrowserTabPages;
}

/**
 * POLLIS: the pages of a tab, given by its opener, such as the pages of a scan: the address of a page and its title, each
 * with `{page}` where the number of the page goes, the first page, the last when it is known, and the page to open at.
 * Previous Page and Next Page on the bar go from one to the next while the tab is at one of them.
 */
export interface IBrowserTabPages {
	readonly url: string;
	readonly title?: string;
	readonly first: number;
	readonly last?: number;
	readonly page: number;
	/**
	 * The number in the address of a page less the page's own number, when they differ: -1 for a scan whose pages are
	 * numbered from 1 in the title and on the bar, and from 0 in their addresses.
	 */
	readonly offset?: number;
}

/** POLLIS: an address or title of the pages of a tab, for one page. */
export function browserTabPageText(template: string, page: number): string {
	return template.replace(/\{page\}/g, String(page));
}

/** POLLIS: the address of a page of a tab's pages. */
export function browserTabPageUrl(pages: IBrowserTabPages, page: number): string {
	return browserTabPageText(pages.url, page + (pages.offset ?? 0));
}

/**
 * POLLIS: the number of the page of a tab's pages that an address is, or undefined when it is none of them. The address of
 * the pages is written as the browser writes addresses, with a number in place of `{page}`, so that the two compare.
 */
function pageOfUrl(template: string, url: string): number | undefined {
	const marker = 987654321;
	const pattern = normalizeUrl(browserTabPageText(template, marker)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(String(marker), '(?<page>\\d+)');
	const page = new RegExp(`^${pattern}$`).exec(normalizeUrl(url))?.groups?.page;
	return page === undefined ? undefined : Number(page);
}

/**
 * POLLIS: a title an opener gives a tab, such as the volume and page of a scan whose page has only the name of its file
 * as its title, shown in place of the page's own while the tab is at the address it was given for.
 */
interface IBrowserTabLabel {
	readonly title: string;
	readonly url: string;
}

/** POLLIS: an address as the browser writes it, so that an address given and the one the tab is at compare. */
function normalizeUrl(url: string): string {
	try {
		return new URL(url).href;
	} catch {
		return url;
	}
}

export class BrowserEditorInput extends EditorInput {
	static readonly ID = 'workbench.editorinputs.browser';
	static readonly EDITOR_ID = 'workbench.editor.browser';
	static readonly DEFAULT_LABEL = localize('browser.editorLabel', "Browser");

	private readonly _id: string;
	private _initialData: IBrowserEditorInputData;
	private _model: IBrowserViewModel | undefined;
	private _modelPromise: Promise<IBrowserViewModel> | undefined;
	private _label: IBrowserTabLabel | undefined;
	private _pages: IBrowserTabPages | undefined;

	/** POLLIS: the key by which the tab's opener reuses it (workbench.action.browser.open, `reuseKey`). */
	reuseKey: string | undefined;

	constructor(
		options: IBrowserEditorInputData,
		@IThemeService private readonly themeService: IThemeService,
		@IBrowserViewWorkbenchService private readonly browserViewWorkbenchService: IBrowserViewWorkbenchService,
		@ILifecycleService private readonly lifecycleService: ILifecycleService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@ITelemetryService private readonly telemetryService: ITelemetryService
	) {
		super();
		this._id = options.id;
		this._initialData = options;
		this._label = options.label;
		this.reuseKey = options.reuseKey;
		this._pages = options.pages;

		this._register(this.lifecycleService.onWillShutdown((e) => {
			if (this._model) {
				// For reloads, we simply hide / re-show the view.
				if (e.reason === ShutdownReason.RELOAD) {
					void this._model.setVisible(false);
				} else {
					this._model.dispose();
					this._model = undefined;
				}
			}
		}));
	}

	get id() {
		return this._id;
	}

	get url(): string | undefined {
		// Use model URL if available, otherwise fall back to initial data
		return this._model ? this._model.url : this._initialData.url;
	}

	get title(): string | undefined {
		// Use model title if available, otherwise fall back to initial data
		return this._model ? this._model.title : this._initialData.title;
	}

	get favicon(): string | undefined {
		// Use model favicon if available, otherwise fall back to initial data
		return this._model ? this._model.favicon : this._initialData.favicon;
	}

	/** POLLIS: gives the tab a title while it is at the address given, or takes the title away when there is none. */
	setLabel(title: string | undefined, url: string): void {
		this._label = title ? { title, url: normalizeUrl(url) } : undefined;
		this._onDidChangeLabel.fire();
	}

	/**
	 * POLLIS: the title the tab's opener gave it, while the tab is at the address it was given for, or at one of the pages
	 * it was given.
	 */
	private get openerTitle(): string | undefined {
		const page = this.page;
		if (page !== undefined && this._pages?.title) {
			return browserTabPageText(this._pages.title, page);
		}
		return this._label && this.url && normalizeUrl(this.url) === this._label.url ? this._label.title : undefined;
	}

	/** POLLIS: gives the tab its pages, or takes them away; the tab is at the page given, or goes there with goToPage. */
	setPages(pages: IBrowserTabPages | undefined): void {
		this._pages = pages;
		if (pages) {
			this._label = undefined;
		}
		this._onDidChangeLabel.fire();
	}

	/** POLLIS: the pages the tab's opener gave it, while the tab is at one of them. */
	get pages(): IBrowserTabPages | undefined {
		return this.page === undefined ? undefined : this._pages;
	}

	/** POLLIS: the number of the page the tab is at, of the pages its opener gave it, or undefined when it is at none. */
	get page(): number | undefined {
		const page = this._pages && this.url ? pageOfUrl(this._pages.url, this.url) : undefined;
		return page === undefined ? undefined : page - (this._pages?.offset ?? 0);
	}

	/** POLLIS: goes to a page of the tab's pages, kept between the first and the last. */
	goToPage(page: number): void {
		if (!this._pages) {
			return;
		}
		const last = this._pages.last ?? Number.MAX_SAFE_INTEGER;
		const target = Math.max(this._pages.first, Math.min(page, last));
		this._pages = { ...this._pages, page: target };
		this.navigate(browserTabPageUrl(this._pages, target));
	}

	navigate(url: string): void {
		if (this._model) {
			void this._model.loadURL(url);
		} else {
			// If the model isn't created yet, update the initial data so that the URL is correct when the model is created
			this._initialData = {
				id: this._id,
				url,
				ephemeral: this._initialData.ephemeral
			};
			this._onDidChangeLabel.fire();
		}
	}

	override async resolve(): Promise<IBrowserViewModel> {
		if (!this._model && !this._modelPromise) {
			this._modelPromise = (async () => {
				this._model = await this.browserViewWorkbenchService.getOrCreateBrowserViewModel(this._id, this._initialData.ephemeral);
				this._modelPromise = undefined;

				// Set up cleanup when the model is disposed
				this._register(this._model.onWillDispose(() => {
					this._model = undefined;
				}));

				// Auto-close editor when webcontents closes
				this._register(this._model.onDidClose(() => {
					this.dispose();
				}));

				// Listen for label-relevant changes to fire onDidChangeLabel
				this._register(this._model.onDidChangeTitle(() => this._onDidChangeLabel.fire()));
				this._register(this._model.onDidChangeFavicon(() => this._onDidChangeLabel.fire()));
				this._register(this._model.onDidChangeLoadingState(() => this._onDidChangeLabel.fire()));
				this._register(this._model.onDidNavigate(() => this._onDidChangeLabel.fire()));

				// Navigate to initial URL if provided
				if (this._initialData.url) {
					this._model.setInitialURL(this._initialData.url, this._initialData.title, this._initialData.favicon);
				}

				this._onDidChangeLabel.fire();

				return this._model;
			})();
		}
		return this._model || this._modelPromise!;
	}

	override get typeId(): string {
		return BrowserEditorInput.ID;
	}

	override get editorId(): string {
		return BrowserEditorInput.EDITOR_ID;
	}

	override get capabilities(): EditorInputCapabilities {
		return EditorInputCapabilities.ForceReveal | EditorInputCapabilities.Readonly;
	}

	override get resource(): URI {
		return BrowserViewUri.forId(this._id);
	}

	override getIcon(): ThemeIcon | URI | undefined {
		// Use model data if available, otherwise fall back to initial data
		if (this._model) {
			if (this._model.loading) {
				const color = this.themeService.getColorTheme().getColor(TAB_ACTIVE_FOREGROUND);
				return URI.parse('data:image/svg+xml;utf8,' + encodeURIComponent(LOADING_SPINNER_SVG(color?.toString())));
			}
			if (this._model.favicon) {
				return URI.parse(this._model.favicon);
			}
			// Model exists but no favicon yet, use default
			return Codicon.globe;
		}
		// Model not created yet, use initial data if available
		if (this._initialData.favicon) {
			return URI.parse(this._initialData.favicon);
		}
		return Codicon.globe;
	}

	override getName(): string {
		// POLLIS: a title the opener gave is shown whole, as the opener wrote it
		const label = this.openerTitle;
		if (label) {
			return label;
		}
		const hasTitle = this._model ? !!this._model.title : !!this._initialData.title;
		const name = hasTitle ? this.title! : this.getDescription(Verbosity.SHORT) || BrowserEditorInput.DEFAULT_LABEL;
		return truncate(name, MAX_TITLE_LENGTH);
	}

	override getTitle(verbosity = Verbosity.MEDIUM): string {
		const hasTitle = this._model ? !!this._model.title : !!this._initialData.title;
		const description = this.getDescription(verbosity);
		const label = this.openerTitle;
		if (label) {
			return description ? `${label} (${description})` : label;
		}
		const title = hasTitle ? `${this.title} (${description})` : description;
		return title || BrowserEditorInput.DEFAULT_LABEL;
	}

	override getDescription(verbosity = Verbosity.MEDIUM): string | undefined {
		return this.url && this.getURLTitles.get(this.url)[verbosity];
	}

	private readonly getURLTitles = new LRUCachedFunction((url: string) => {
		let _parsed: URI | undefined = undefined;
		let _short: string | undefined = undefined;
		let _medium: string | undefined = undefined;
		let _long: string | undefined = undefined;
		function getParsed() {
			if (!_parsed) {
				_parsed = URI.parse(url);
			}
			return _parsed;
		}
		return {
			get [Verbosity.SHORT]() {
				if (!_short) {
					_short = getParsed().authority;
				}
				return _short;
			},
			get [Verbosity.MEDIUM]() {
				if (!_medium) {
					_medium = getParsed().with({ query: '', fragment: '' }).toString();
				}
				return _medium;
			},
			get [Verbosity.LONG]() {
				if (!_long) {
					_long = getParsed().with({ fragment: '' }).toString();
				}
				return _long;
			}
		};
	});

	override canReopen(): boolean {
		return true;
	}

	override matches(otherInput: EditorInput | IUntypedEditorInput): boolean {
		if (super.matches(otherInput)) {
			return true;
		}

		if (otherInput instanceof BrowserEditorInput) {
			return this._id === otherInput._id;
		}

		// Check if it's an untyped input with a browser view resource
		if (hasKey(otherInput, { resource: true }) && otherInput.resource?.scheme === BrowserViewUri.scheme) {
			const parsed = BrowserViewUri.parse(otherInput.resource);
			if (parsed) {
				return this._id === parsed.id;
			}
		}

		return false;
	}

	/**
	 * Creates a copy of this browser editor input with a new unique ID, creating an independent browser view with no linked state.
	 * This is used during Copy into New Window.
	 */
	override copy(): EditorInput {
		logBrowserOpen(this.telemetryService, 'copyToNewWindow');

		return this.instantiationService.createInstance(BrowserEditorInput, {
			id: generateUuid(),
			url: this.url,
			title: this.title,
			favicon: this.favicon,
			ephemeral: this._initialData.ephemeral
		});
	}

	override toUntyped(): IUntypedEditorInput {
		const viewState: IBrowserEditorViewState = {
			url: this.url,
			title: this.title,
			favicon: this.favicon,
			ephemeral: this._initialData.ephemeral
		};
		return {
			resource: this.resource,
			options: {
				override: BrowserEditorInput.EDITOR_ID,
				viewState
			}
		};
	}

	override dispose(): void {
		super.dispose(); // Emit `onWillDispose` event first, then clean up the model.
		if (this._model) {
			// `toUntyped()` is called after disposal. Store the latest data in `_initialData` so we can still get them there.
			this._initialData = {
				id: this._id,
				url: this._model.url,
				title: this._model.title,
				favicon: this._model.favicon,
				ephemeral: this._initialData.ephemeral
			};
			this._model.dispose();
			this._model = undefined;
		}
	}

	serialize(): IBrowserEditorInputData {
		return {
			id: this._id,
			url: this.url,
			title: this.title,
			favicon: this.favicon,
			ephemeral: this._initialData.ephemeral,
			label: this._label,
			reuseKey: this.reuseKey,
			pages: this._pages
		};
	}
}

export class BrowserEditorSerializer implements IEditorSerializer {
	canSerialize(editorInput: EditorInput): editorInput is BrowserEditorInput {
		return editorInput instanceof BrowserEditorInput;
	}

	serialize(editorInput: EditorInput): string | undefined {
		if (!this.canSerialize(editorInput)) {
			return undefined;
		}

		return JSON.stringify(editorInput.serialize());
	}

	deserialize(instantiationService: IInstantiationService, serializedEditor: string): EditorInput | undefined {
		try {
			const data: IBrowserEditorInputData = JSON.parse(serializedEditor);
			return instantiationService.createInstance(BrowserEditorInput, data);
		} catch {
			return undefined;
		}
	}
}
