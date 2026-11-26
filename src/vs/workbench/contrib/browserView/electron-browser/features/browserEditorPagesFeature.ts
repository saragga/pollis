/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// POLLIS: Previous Page, the page and Next Page on the browser's bar, as a reader's toolbar has them, for a tab whose
// opener gave it pages (workbench.action.browser.open, `pages`), such as a scan that Britannica Through the Editions opens.
// They are on the bar while the tab is at one of its pages. For pages that are places in one page, such as those of a
// Gutenberg ebook, the page on the bar follows the scroll, and Previous Page and Next Page scroll to the page.

import { $, addDisposableListener, append, EventLike, EventType } from '../../../../../base/browser/dom.js';
import { BaseActionViewItem, IBaseActionViewItemOptions } from '../../../../../base/browser/ui/actionbar/actionViewItems.js';
import { IAction } from '../../../../../base/common/actions.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../../nls.js';
import { IActionViewItemService } from '../../../../../platform/actions/browser/actionViewItemService.js';
import { Action2, MenuId, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { ContextKeyExpr, IContextKey, IContextKeyService, RawContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../../common/contributions.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { BrowserEditorInput } from '../../common/browserEditorInput.js';
import { IBrowserViewModel } from '../../common/browserView.js';
import { BrowserEditor, BrowserEditorContribution } from '../browserEditor.js';
import { BROWSER_EDITOR_ACTIVE, BrowserActionCategory, BrowserActionGroup } from '../browserViewActions.js';

const CONTEXT_BROWSER_HAS_PAGES = new RawContextKey<boolean>('browserHasPages', false, localize('browser.hasPages', "Whether the browser tab is at one of the pages its opener gave it"));
const CONTEXT_BROWSER_CAN_GO_TO_PREVIOUS_PAGE = new RawContextKey<boolean>('browserCanGoToPreviousPage', false, localize('browser.canGoToPreviousPage', "Whether the browser tab has a page before the one it is at"));
const CONTEXT_BROWSER_CAN_GO_TO_NEXT_PAGE = new RawContextKey<boolean>('browserCanGoToNextPage', false, localize('browser.canGoToNextPage', "Whether the browser tab has a page after the one it is at"));

/** The browser tab an editor shows. */
function browserTab(editor: unknown): BrowserEditorInput | undefined {
	return editor instanceof BrowserEditor && editor.input instanceof BrowserEditorInput ? editor.input : undefined;
}

/** Keeps the context keys of the pages up to date with the tab the editor shows and the page it is at. */
class BrowserEditorPagesSupport extends BrowserEditorContribution {
	private readonly _hasPages: IContextKey<boolean>;
	private readonly _canGoToPreviousPage: IContextKey<boolean>;
	private readonly _canGoToNextPage: IContextKey<boolean>;

	constructor(
		editor: BrowserEditor,
		@IContextKeyService contextKeyService: IContextKeyService,
	) {
		super(editor);
		this._hasPages = CONTEXT_BROWSER_HAS_PAGES.bindTo(contextKeyService);
		this._canGoToPreviousPage = CONTEXT_BROWSER_CAN_GO_TO_PREVIOUS_PAGE.bindTo(contextKeyService);
		this._canGoToNextPage = CONTEXT_BROWSER_CAN_GO_TO_NEXT_PAGE.bindTo(contextKeyService);
	}

	protected override subscribeToModel(model: IBrowserViewModel, store: DisposableStore): void {
		const tab = browserTab(this.editor);
		if (tab) {
			// Pages that are places in one page, such as those of a Gutenberg ebook: the page in view follows the scroll. The
			// starts of the pages go to the browser view once, and each page loaded takes them from there
			let watched: readonly string[] | undefined;
			const watch = () => {
				const texts = tab.pages?.texts;
				const starts = tab.pageStarts;
				if (texts && starts && texts !== watched) {
					watched = texts;
					void model.watchPageStarts(starts);
				}
			};
			// A new page, or another address, changes the tab's title too
			store.add(tab.onDidChangeLabel(() => {
				watch();
				this._update(tab);
			}));
			store.add(model.onDidChangePageInView(index => tab.setPageInView(index)));
			watch();
		}
		this._update(tab);
	}

	override clear(): void {
		this._hasPages.reset();
		this._canGoToPreviousPage.reset();
		this._canGoToNextPage.reset();
	}

	private _update(tab: BrowserEditorInput | undefined): void {
		const page = tab?.page;
		const pages = tab?.pages;
		this._hasPages.set(page !== undefined);
		this._canGoToPreviousPage.set(page !== undefined && pages !== undefined && page > pages.first);
		this._canGoToNextPage.set(page !== undefined && pages !== undefined && (pages.last === undefined || page < pages.last));
	}
}

BrowserEditor.registerContribution(BrowserEditorPagesSupport);

// -- Actions ------------------------------------------------------------

class PreviousPageAction extends Action2 {
	static readonly ID = 'workbench.action.browser.previousPage';

	constructor() {
		super({
			id: PreviousPageAction.ID,
			title: localize2('browser.previousPageAction', "Previous Page"),
			category: BrowserActionCategory,
			icon: Codicon.arrowUp,
			f1: true,
			precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_CAN_GO_TO_PREVIOUS_PAGE),
			menu: {
				id: MenuId.BrowserActionsToolbar,
				group: BrowserActionGroup.BarPages,
				order: 1,
				when: CONTEXT_BROWSER_HAS_PAGES,
			},
		});
	}

	run(accessor: ServicesAccessor, browserEditor = accessor.get(IEditorService).activeEditorPane): void {
		const tab = browserTab(browserEditor);
		const page = tab?.page;
		if (tab && page !== undefined) {
			tab.goToPage(page - 1);
		}
	}
}

/** The page the tab is at: on the bar a field to type a page in (BrowserPageNumberActionViewItem); from the Command Palette, a prompt. */
class GoToPageAction extends Action2 {
	static readonly ID = 'workbench.action.browser.goToPage';

	constructor() {
		super({
			id: GoToPageAction.ID,
			title: localize2('browser.goToPageAction', "Go to Page"),
			category: BrowserActionCategory,
			icon: Codicon.book,
			f1: true,
			precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_PAGES),
			menu: {
				id: MenuId.BrowserActionsToolbar,
				group: BrowserActionGroup.BarPages,
				order: 2,
				when: CONTEXT_BROWSER_HAS_PAGES,
			},
		});
	}

	async run(accessor: ServicesAccessor, browserEditor = accessor.get(IEditorService).activeEditorPane): Promise<void> {
		const quickInputService = accessor.get(IQuickInputService);
		const tab = browserTab(browserEditor);
		const page = tab?.page;
		if (!tab || page === undefined) {
			return;
		}
		const value = await quickInputService.input({
			prompt: localize('browser.goToPagePrompt', "The number of the page to go to"),
			value: String(page),
			validateInput: async text => /^\d+$/.test(text.trim()) ? undefined : localize('browser.goToPageNumber', "A page number, such as {0}", page),
		});
		if (value !== undefined) {
			tab.goToPage(Number(value.trim()));
		}
	}
}

class NextPageAction extends Action2 {
	static readonly ID = 'workbench.action.browser.nextPage';

	constructor() {
		super({
			id: NextPageAction.ID,
			title: localize2('browser.nextPageAction', "Next Page"),
			category: BrowserActionCategory,
			icon: Codicon.arrowDown,
			f1: true,
			precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_CAN_GO_TO_NEXT_PAGE),
			menu: {
				id: MenuId.BrowserActionsToolbar,
				group: BrowserActionGroup.BarPages,
				order: 3,
				when: CONTEXT_BROWSER_HAS_PAGES,
			},
		});
	}

	run(accessor: ServicesAccessor, browserEditor = accessor.get(IEditorService).activeEditorPane): void {
		const tab = browserTab(browserEditor);
		const page = tab?.page;
		if (tab && page !== undefined) {
			tab.goToPage(page + 1);
		}
	}
}

registerAction2(PreviousPageAction);
registerAction2(GoToPageAction);
registerAction2(NextPageAction);

/**
 * The page on the bar, between Previous Page and Next Page: "Page", a field with the number of the page the tab is at,
 * where another number and Enter go to that page, and "of" the last page when it is known. The bar gives it the browser
 * editor as its context.
 */
class BrowserPageNumberActionViewItem extends BaseActionViewItem {
	private readonly _editorListener = this._register(new MutableDisposable());
	private readonly _tabListener = this._register(new MutableDisposable());
	private _editor: BrowserEditor | undefined;
	private _field: HTMLInputElement | undefined;
	private _last: HTMLElement | undefined;
	/** The page the field last showed. */
	private _shownPage: number | undefined;

	constructor(action: IAction, options: IBaseActionViewItemOptions) {
		super(undefined, action, options);
	}

	override render(container: HTMLElement): void {
		super.render(container);
		container.classList.add('browser-page-number');
		append(container, $('span', undefined, localize('browser.pageLabel', "Page")));
		const field = this._field = append(container, $<HTMLInputElement>('input.browser-page-number-field'));
		field.type = 'text';
		field.inputMode = 'numeric';
		field.setAttribute('aria-label', localize('browser.pageNumber', "Page number"));
		this._last = append(container, $('span.browser-page-number-last'));
		// The keys typed in the field are the field's, not the bar's
		this._register(addDisposableListener(field, EventType.KEY_DOWN, (e: KeyboardEvent) => {
			e.stopPropagation();
			if (e.key === 'Enter') {
				const tab = browserTab(this._editor);
				const page = field.value.trim();
				if (tab && /^\d+$/.test(page)) {
					tab.goToPage(Number(page));
				} else {
					this._update();
				}
			} else if (e.key === 'Escape') {
				this._update();
				field.blur();
			}
		}));
		this._register(addDisposableListener(field, EventType.BLUR, () => this._update()));
		this._update();
	}

	override setActionContext(context: unknown): void {
		super.setActionContext(context);
		if (context instanceof BrowserEditor && context !== this._editor) {
			this._editor = context;
			// The editor shows another tab with another model
			this._editorListener.value = context.onDidChangeModel(() => this._watchTab());
			this._watchTab();
		}
	}

	override onClick(_event: EventLike): void {
		this._field?.focus();
		this._field?.select();
	}

	private _watchTab(): void {
		this._tabListener.value = browserTab(this._editor)?.onDidChangeLabel(() => this._update());
		this._update();
	}

	private _update(): void {
		const tab = browserTab(this._editor);
		const page = tab?.page;
		// While the field has the focus, what is typed in it stays, unless the tab goes to another page (after Enter, say)
		if (this._field && (this._field !== this._field.ownerDocument.activeElement || page !== this._shownPage)) {
			this._shownPage = page;
			this._field.value = page === undefined ? '' : String(page);
			this._field.style.width = `${Math.max(3, this._field.value.length + 1)}ch`;
		}
		if (this._last) {
			const last = tab?.pages?.last;
			this._last.textContent = last === undefined ? '' : localize('browser.pageOf', "of {0}", last);
		}
	}
}

/** Draws Go to Page on the bar as the page itself. */
class BrowserPageNumberViewItemContribution extends Disposable implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.browserView.pageNumberViewItem';

	constructor(@IActionViewItemService actionViewItemService: IActionViewItemService) {
		super();
		this._register(actionViewItemService.register(MenuId.BrowserActionsToolbar, GoToPageAction.ID, (action, options) => new BrowserPageNumberActionViewItem(action, options)));
	}
}

registerWorkbenchContribution2(BrowserPageNumberViewItemContribution.ID, BrowserPageNumberViewItemContribution, WorkbenchPhase.BlockRestore);
