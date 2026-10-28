/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ILocalizedString, localize, localize2 } from '../../../nls.js';
import product from '../../../platform/product/common/product.js';
import { isMacintosh, isLinux, language, isWeb } from '../../../base/common/platform.js';
import { FileAccess, AppResourcePath } from '../../../base/common/network.js';
import { ITelemetryService } from '../../../platform/telemetry/common/telemetry.js';
import { IOpenerService } from '../../../platform/opener/common/opener.js';
import { URI } from '../../../base/common/uri.js';
import { MenuId, Action2, registerAction2, MenuRegistry } from '../../../platform/actions/common/actions.js';
import { KeyChord, KeyMod, KeyCode } from '../../../base/common/keyCodes.js';
import { IProductService } from '../../../platform/product/common/productService.js';
import { ServicesAccessor } from '../../../platform/instantiation/common/instantiation.js';
import { KeybindingWeight } from '../../../platform/keybinding/common/keybindingsRegistry.js';
import { Categories } from '../../../platform/action/common/actionCommonCategories.js';
import { ICommandService } from '../../../platform/commands/common/commands.js';
import { ContextKeyExpr } from '../../../platform/contextkey/common/contextkey.js';
import { IsMacNativeContext } from '../../../platform/contextkey/common/contextkeys.js';
import { IsSessionsWindowContext } from '../../common/contextkeys.js';
import { BrowserViewCommandId } from '../../../platform/browserView/common/browserView.js';
import { IFileService } from '../../../platform/files/common/files.js';
import { INotificationService } from '../../../platform/notification/common/notification.js';
import { joinPath } from '../../../base/common/resources.js';
import { IPathService } from '../../services/path/common/pathService.js';

class KeybindingsReferenceAction extends Action2 {

	static readonly ID = 'workbench.action.keybindingsReference';
	static readonly AVAILABLE = !!(isLinux ? product.keyboardShortcutsUrlLinux : isMacintosh ? product.keyboardShortcutsUrlMac : product.keyboardShortcutsUrlWin);

	constructor() {
		super({
			id: KeybindingsReferenceAction.ID,
			title: {
				...localize2('keybindingsReference', "Keyboard Shortcuts Reference"),
				mnemonicTitle: localize({ key: 'miKeyboardShortcuts', comment: ['&& denotes a mnemonic'] }, "&&Keyboard Shortcuts Reference"),
			},
			category: Categories.Help,
			f1: true,
			keybinding: {
				weight: KeybindingWeight.WorkbenchContrib,
				when: null,
				primary: KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyMod.CtrlCmd | KeyCode.KeyR)
			}
		});
	}

	run(accessor: ServicesAccessor): void {
		const productService = accessor.get(IProductService);
		const openerService = accessor.get(IOpenerService);

		const url = isLinux ? productService.keyboardShortcutsUrlLinux : isMacintosh ? productService.keyboardShortcutsUrlMac : productService.keyboardShortcutsUrlWin;
		if (url) {
			openerService.open(URI.parse(url));
		}
	}
}

class OpenIntroductoryVideosUrlAction extends Action2 {

	static readonly ID = 'workbench.action.openVideoTutorialsUrl';
	static readonly AVAILABLE = !!product.introductoryVideosUrl;

	constructor() {
		super({
			id: OpenIntroductoryVideosUrlAction.ID,
			title: {
				...localize2('openVideoTutorialsUrl', "Video Tutorials"),
				mnemonicTitle: localize({ key: 'miVideoTutorials', comment: ['&& denotes a mnemonic'] }, "&&Video Tutorials"),
			},
			category: Categories.Help,
			f1: true
		});
	}

	run(accessor: ServicesAccessor): void {
		const productService = accessor.get(IProductService);
		const openerService = accessor.get(IOpenerService);

		if (productService.introductoryVideosUrl) {
			openerService.open(URI.parse(productService.introductoryVideosUrl));
		}
	}
}

class OpenTipsAndTricksUrlAction extends Action2 {

	static readonly ID = 'workbench.action.openTipsAndTricksUrl';
	static readonly AVAILABLE = !!product.tipsAndTricksUrl;

	constructor() {
		super({
			id: OpenTipsAndTricksUrlAction.ID,
			title: {
				...localize2('openTipsAndTricksUrl', "Tips and Tricks"),
				mnemonicTitle: localize({ key: 'miTipsAndTricks', comment: ['&& denotes a mnemonic'] }, "Tips and Tri&&cks"),
			},
			category: Categories.Help,
			f1: true
		});
	}

	run(accessor: ServicesAccessor): void {
		const productService = accessor.get(IProductService);
		const openerService = accessor.get(IOpenerService);

		if (productService.tipsAndTricksUrl) {
			openerService.open(URI.parse(productService.tipsAndTricksUrl));
		}
	}
}

class OpenDocumentationUrlAction extends Action2 {

	static readonly ID = 'workbench.action.openDocumentationUrl';
	static readonly AVAILABLE = !!(isWeb ? product.serverDocumentationUrl : product.documentationUrl);

	constructor() {
		super({
			id: OpenDocumentationUrlAction.ID,
			title: {
				...localize2('openDocumentationUrl', "Documentation"),
				mnemonicTitle: localize({ key: 'miDocumentation', comment: ['&& denotes a mnemonic'] }, "&&Documentation"),
			},
			category: Categories.Help,
			f1: true,
			menu: {
				id: MenuId.MenubarHelpMenu,
				group: '1_welcome',
				order: 3
			}
		});
	}

	run(accessor: ServicesAccessor): void {
		const productService = accessor.get(IProductService);
		const openerService = accessor.get(IOpenerService);
		const url = isWeb ? productService.serverDocumentationUrl : productService.documentationUrl;

		if (url) {
			openerService.open(URI.parse(url));
		}
	}
}

class OpenNewsletterSignupUrlAction extends Action2 {

	static readonly ID = 'workbench.action.openNewsletterSignupUrl';
	static readonly AVAILABLE = !!product.newsletterSignupUrl;

	constructor() {
		super({
			id: OpenNewsletterSignupUrlAction.ID,
			title: localize2('newsletterSignup', 'Signup for the VS Code Newsletter'),
			category: Categories.Help,
			f1: true
		});
	}

	run(accessor: ServicesAccessor) {
		const productService = accessor.get(IProductService);
		const openerService = accessor.get(IOpenerService);
		const telemetryService = accessor.get(ITelemetryService);
		openerService.open(URI.parse(`${productService.newsletterSignupUrl}?machineId=${encodeURIComponent(telemetryService.machineId)}`));
	}
}

class OpenYouTubeUrlAction extends Action2 {

	static readonly ID = 'workbench.action.openYouTubeUrl';
	static readonly AVAILABLE = !!product.youTubeUrl;

	constructor() {
		super({
			id: OpenYouTubeUrlAction.ID,
			title: {
				...localize2('openYouTubeUrl', "Join Us on YouTube"),
				mnemonicTitle: localize({ key: 'miYouTube', comment: ['&& denotes a mnemonic'] }, "&&Join Us on YouTube"),
			},
			category: Categories.Help,
			f1: true
		});
	}

	run(accessor: ServicesAccessor): void {
		const productService = accessor.get(IProductService);
		const openerService = accessor.get(IOpenerService);

		if (productService.youTubeUrl) {
			openerService.open(URI.parse(productService.youTubeUrl));
		}
	}
}

class OpenRequestFeatureUrlAction extends Action2 {

	static readonly ID = 'workbench.action.openRequestFeatureUrl';
	static readonly AVAILABLE = !!product.requestFeatureUrl;

	constructor() {
		super({
			id: OpenRequestFeatureUrlAction.ID,
			title: {
				...localize2('openUserVoiceUrl', "Search Feature Requests"),
				mnemonicTitle: localize({ key: 'miUserVoice', comment: ['&& denotes a mnemonic'] }, "&&Search Feature Requests"),
			},
			category: Categories.Help,
			f1: true,
			// Pollis: next to Report Issue (issue.contribution.ts), which is in '4_feedback' order 3
			menu: {
				id: MenuId.MenubarHelpMenu,
				group: '4_feedback',
				order: 2
			}
		});
	}

	run(accessor: ServicesAccessor): void {
		const productService = accessor.get(IProductService);
		const openerService = accessor.get(IOpenerService);

		if (productService.requestFeatureUrl) {
			openerService.open(URI.parse(productService.requestFeatureUrl));
		}
	}
}

class OpenLicenseUrlAction extends Action2 {

	static readonly ID = 'workbench.action.openLicenseUrl';
	static readonly AVAILABLE = !!(isWeb ? product.serverLicense : product.licenseUrl);

	constructor() {
		super({
			id: OpenLicenseUrlAction.ID,
			title: {
				...localize2('openLicenseUrl', "View License"),
				mnemonicTitle: localize({ key: 'miLicense', comment: ['&& denotes a mnemonic'] }, "View &&License"),
			},
			category: Categories.Help,
			f1: true
		});
	}

	run(accessor: ServicesAccessor): void {
		const productService = accessor.get(IProductService);
		const openerService = accessor.get(IOpenerService);
		const url = isWeb ? productService.serverLicenseUrl : productService.licenseUrl;

		if (url) {
			if (language) {
				const queryArgChar = url.indexOf('?') > 0 ? '&' : '?';
				openerService.open(URI.parse(`${url}${queryArgChar}lang=${language}`));
			} else {
				openerService.open(URI.parse(url));
			}
		}
	}
}

class OpenPrivacyStatementUrlAction extends Action2 {

	static readonly ID = 'workbench.action.openPrivacyStatementUrl';
	static readonly AVAILABLE = !!product.privacyStatementUrl;

	constructor() {
		super({
			id: OpenPrivacyStatementUrlAction.ID,
			title: {
				...localize2('openPrivacyStatement', "Privacy Statement"),
				mnemonicTitle: localize({ key: 'miPrivacyStatement', comment: ['&& denotes a mnemonic'] }, "Privac&&y Statement"),
			},
			category: Categories.Help,
			f1: true
		});
	}

	run(accessor: ServicesAccessor): void {
		const productService = accessor.get(IProductService);
		const openerService = accessor.get(IOpenerService);

		if (productService.privacyStatementUrl) {
			openerService.open(URI.parse(productService.privacyStatementUrl));
		}
	}
}

class GetStartedWithAccessibilityFeatures extends Action2 {

	static readonly ID = 'workbench.action.getStartedWithAccessibilityFeatures';

	constructor() {
		super({
			id: GetStartedWithAccessibilityFeatures.ID,
			title: localize2('getStartedWithAccessibilityFeatures', 'Get Started with Accessibility Features'),
			category: Categories.Help,
			f1: true,
			precondition: IsSessionsWindowContext.negate()
		});
	}
	run(accessor: ServicesAccessor): void {
		const commandService = accessor.get(ICommandService);
		commandService.executeCommand('workbench.action.openWalkthrough', 'SetupAccessibility');
	}
}

class AskVSCodeCopilot extends Action2 {
	static readonly ID = 'workbench.action.askVScode';

	constructor() {
		super({
			id: AskVSCodeCopilot.ID,
			title: localize2('askVScode', 'Ask @vscode'),
			category: Categories.Help,
			f1: true,
			precondition: ContextKeyExpr.and(ContextKeyExpr.equals('chatSetupHidden', false), ContextKeyExpr.equals('chatSetupDisabledInWorkspace', false), IsSessionsWindowContext.negate())
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const commandService = accessor.get(ICommandService);
		commandService.executeCommand('workbench.action.chat.open', { mode: 'agent', query: '@vscode ', isPartialQuery: true });

	}
}


class ShowLicenseAction extends Action2 {

	static readonly ID = 'pollis.action.showLicense';

	constructor() {
		super({
			id: ShowLicenseAction.ID,
			title: {
				...localize2('showLicense', "View License"),
				mnemonicTitle: localize({ key: 'miShowLicense', comment: ['&& denotes a mnemonic'] }, "View &&License"),
			},
			category: Categories.Help,
			f1: true,
			menu: {
				id: MenuId.MenubarHelpMenu,
				group: '5_legal',
				order: 1
			}
		});
	}

	run(accessor: ServicesAccessor): void {
		const commandService = accessor.get(ICommandService);
		const uri = FileAccess.asFileUri('vs/workbench/browser/media/pollis-license.md' as AppResourcePath);
		commandService.executeCommand('markdown.showPreview', uri);
	}
}

class ShowThirdPartyNoticesAction extends Action2 {

	static readonly ID = 'pollis.action.showThirdPartyNotices';

	constructor() {
		super({
			id: ShowThirdPartyNoticesAction.ID,
			title: {
				...localize2('showThirdPartyNotices', "View Third-Party Notices"),
				mnemonicTitle: localize({ key: 'miShowThirdPartyNotices', comment: ['&& denotes a mnemonic'] }, "View &&Third-Party Notices"),
			},
			category: Categories.Help,
			f1: true,
			menu: {
				id: MenuId.MenubarHelpMenu,
				group: '5_legal',
				order: 2
			}
		});
	}

	run(accessor: ServicesAccessor): void {
		const commandService = accessor.get(ICommandService);
		const uri = FileAccess.asFileUri('vs/workbench/browser/media/pollis-notice.md' as AppResourcePath);
		commandService.executeCommand('markdown.showPreview', uri);
	}
}

class ShowReleaseNotesAction extends Action2 {

	static readonly ID = 'pollis.action.showReleaseNotes';

	constructor() {
		super({
			id: ShowReleaseNotesAction.ID,
			title: {
				...localize2('showReleaseNotes', "Show Release Notes"),
				mnemonicTitle: localize({ key: 'miReleaseNotes', comment: ['&& denotes a mnemonic'] }, "Show &&Release Notes"),
			},
			category: Categories.Help,
			f1: true,
		});
	}

	run(accessor: ServicesAccessor): void {
		const commandService = accessor.get(ICommandService);
		const uri = FileAccess.asFileUri('vs/workbench/browser/media/pollis-release-notes.md' as AppResourcePath);
		commandService.executeCommand('markdown.showPreview', uri);
	}
}

// --- Actions Registration

if (KeybindingsReferenceAction.AVAILABLE) {
	registerAction2(KeybindingsReferenceAction);
}

if (OpenIntroductoryVideosUrlAction.AVAILABLE) {
	registerAction2(OpenIntroductoryVideosUrlAction);
}

if (OpenTipsAndTricksUrlAction.AVAILABLE) {
	registerAction2(OpenTipsAndTricksUrlAction);
}

if (OpenDocumentationUrlAction.AVAILABLE) {
	registerAction2(OpenDocumentationUrlAction);
}

if (OpenNewsletterSignupUrlAction.AVAILABLE) {
	registerAction2(OpenNewsletterSignupUrlAction);
}

if (OpenYouTubeUrlAction.AVAILABLE) {
	registerAction2(OpenYouTubeUrlAction);
}

if (OpenRequestFeatureUrlAction.AVAILABLE) {
	registerAction2(OpenRequestFeatureUrlAction);
}

if (OpenLicenseUrlAction.AVAILABLE) {
	registerAction2(OpenLicenseUrlAction);
}

if (OpenPrivacyStatementUrlAction.AVAILABLE) {
	registerAction2(OpenPrivacyStatementUrlAction);
}

registerAction2(GetStartedWithAccessibilityFeatures);

registerAction2(AskVSCodeCopilot);

registerAction2(ShowReleaseNotesAction);
registerAction2(ShowLicenseAction);
registerAction2(ShowThirdPartyNoticesAction);

// Pollis: the Help menu holds About (Windows and Linux only; on macOS it is in the Pollis application
// menu), Welcome, Search Feature Requests and Report Issue, then View License and View Third-Party
// Notices (registered above).
MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
	group: '1_about',
	command: {
		id: 'workbench.action.showAboutDialog',
		title: localize({ key: 'miAboutProduct', comment: ['&& denotes a mnemonic', '{0} is the product name'] }, "&&About {0}", product.nameLong)
	},
	order: 1,
	when: IsMacNativeContext.toNegated()
});

// Pollis: Welcome in a group of its own, so a separator follows it
MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
	group: '2_0welcome',
	command: {
		id: 'workbench.action.openWalkthrough',
		title: localize({ key: 'miWelcome', comment: ['&& denotes a mnemonic'] }, "&&Welcome")
	},
	order: 1
});

/** The Help > Documentation, Video Tutorials and Notebook Courses submenus. */
const MenubarHelpDocumentationMenu = new MenuId('MenubarHelpDocumentationMenu');
const MenubarHelpVideoTutorialsMenu = new MenuId('MenubarHelpVideoTutorialsMenu');
const MenubarHelpNotebookCoursesMenu = new MenuId('MenubarHelpNotebookCoursesMenu');

MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
	group: '2_welcome',
	title: localize({ key: 'miDocumentationMenu', comment: ['&& denotes a mnemonic'] }, "&&Documentation"),
	submenu: MenubarHelpDocumentationMenu,
	order: 2
});

MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
	group: '2_welcome',
	title: localize({ key: 'miVideoTutorialsMenu', comment: ['&& denotes a mnemonic'] }, "&&Video Tutorials"),
	submenu: MenubarHelpVideoTutorialsMenu,
	order: 3
});

MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
	group: '2_welcome',
	title: localize({ key: 'miNotebookCoursesMenu', comment: ['&& denotes a mnemonic'] }, "&&Notebook Courses"),
	submenu: MenubarHelpNotebookCoursesMenu,
	order: 4
});

/** A Help submenu entry that opens a web page; `title` is its Command Palette name. */
interface IHelpLink {
	readonly id: string;
	readonly title: ILocalizedString;
	readonly mnemonicTitle: string;
	readonly menu: MenuId;
	readonly order: number;
	readonly url: string;
}

function registerHelpLink(link: IHelpLink): void {
	registerAction2(class extends Action2 {
		constructor() {
			super({
				id: link.id,
				title: { ...link.title, mnemonicTitle: link.mnemonicTitle },
				category: Categories.Help,
				f1: true,
				menu: { id: link.menu, group: '1_links', order: link.order }
			});
		}

		run(accessor: ServicesAccessor): void {
			accessor.get(IOpenerService).open(URI.parse(link.url));
		}
	});
}

/**
 * Opens a document of Help > Documentation, `file` in ~/.pollis/documents. Pollis compiles the documents there from
 * their LaTeX sources, its docs/ folder, when the Julia REPL starts (compile_documents.jl of the Julia extension).
 */
async function openDocument(accessor: ServicesAccessor, file: string, title: string): Promise<void> {
	const commandService = accessor.get(ICommandService);
	const fileService = accessor.get(IFileService);
	const notificationService = accessor.get(INotificationService);
	const uri = joinPath(await accessor.get(IPathService).userHome(), '.pollis', 'documents', file);
	if (await fileService.exists(uri)) {
		commandService.executeCommand(BrowserViewCommandId.Open, uri.toString(true));
	} else {
		notificationService.info(localize('documentNotCompiled', "{0} is not compiled yet. Pollis compiles its documentation from the LaTeX sources when Julia starts, and the status bar shows how far it has come.", title));
	}
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.action.openTourOfPollis',
			title: {
				...localize2('openTourOfPollis', "A Tour of Pollis"),
				mnemonicTitle: localize({ key: 'miTourOfPollis', comment: ['&& denotes a mnemonic'] }, "A &&Tour of Pollis"),
			},
			category: Categories.Help,
			f1: true,
			menu: { id: MenubarHelpDocumentationMenu, group: '0_pollis', order: 1 }
		});
	}

	run(accessor: ServicesAccessor): Promise<void> {
		return openDocument(accessor, 'pollis-tour.pdf', localize('openTourOfPollis', "A Tour of Pollis"));
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.action.openPollisGuide',
			title: {
				...localize2('openPollisGuide', "The Pollis Guide"),
				mnemonicTitle: localize({ key: 'miPollisGuide', comment: ['&& denotes a mnemonic'] }, "The Pollis &&Guide"),
			},
			category: Categories.Help,
			f1: true,
			menu: { id: MenubarHelpDocumentationMenu, group: '0_pollis', order: 2 }
		});
	}

	run(accessor: ServicesAccessor): Promise<void> {
		return openDocument(accessor, 'pollis-guide.pdf', localize('openPollisGuide', "The Pollis Guide"));
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.action.openPollisAIPlus',
			title: {
				...localize2('openPollisAIPlus', "Pollis AI+"),
				mnemonicTitle: localize({ key: 'miPollisAIPlus', comment: ['&& denotes a mnemonic'] }, "Pollis &&AI+"),
			},
			category: Categories.Help,
			f1: true,
			menu: { id: MenubarHelpDocumentationMenu, group: '0_pollis', order: 4 }
		});
	}

	run(accessor: ServicesAccessor): Promise<void> {
		return openDocument(accessor, 'pollis-ai-brochure.pdf', localize('openPollisAIPlus', "Pollis AI+"));
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.action.openTourOfPollisAIPlus',
			title: {
				...localize2('openTourOfPollisAIPlus', "A Tour of Pollis AI+"),
				mnemonicTitle: localize({ key: 'miTourOfPollisAIPlus', comment: ['&& denotes a mnemonic'] }, "A Tour of Pollis AI&&+"),
			},
			category: Categories.Help,
			f1: true,
			menu: { id: MenubarHelpDocumentationMenu, group: '0_pollis', order: 3 }
		});
	}

	run(accessor: ServicesAccessor): Promise<void> {
		return openDocument(accessor, 'pollis-ai-tour.pdf', localize('openTourOfPollisAIPlus', "A Tour of Pollis AI+"));
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.action.openDrillDownDataPackages',
			title: {
				...localize2('openDrillDownDataPackages', "Drill-down: Data Packages"),
				mnemonicTitle: localize({ key: 'miDrillDownDataPackages', comment: ['&& denotes a mnemonic'] }, "Drill-down: &&Data Packages"),
			},
			category: Categories.Help,
			f1: true,
			menu: { id: MenubarHelpDocumentationMenu, group: '0_pollis', order: 5 }
		});
	}

	run(accessor: ServicesAccessor): Promise<void> {
		return openDocument(accessor, 'pollis-drilldown-data-packages.pdf', localize('openDrillDownDataPackages', "Drill-down: Data Packages"));
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.action.openDrillDownLiteratureRadar',
			title: {
				...localize2('openDrillDownLiteratureRadar', "Drill-down: Literature Radar"),
				mnemonicTitle: localize({ key: 'miDrillDownLiteratureRadar', comment: ['&& denotes a mnemonic'] }, "Drill-down: &&Literature Radar"),
			},
			category: Categories.Help,
			f1: true,
			menu: { id: MenubarHelpDocumentationMenu, group: '0_pollis', order: 6 }
		});
	}

	run(accessor: ServicesAccessor): Promise<void> {
		return openDocument(accessor, 'pollis-drilldown-literature-radar.pdf', localize('openDrillDownLiteratureRadar', "Drill-down: Literature Radar"));
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.action.openDrillDownAskPollis',
			title: {
				...localize2('openDrillDownAskPollis', "Drill-down: Ask Pollis"),
				mnemonicTitle: localize({ key: 'miDrillDownAskPollis', comment: ['&& denotes a mnemonic'] }, "Drill-down: Ask &&Pollis"),
			},
			category: Categories.Help,
			f1: true,
			menu: { id: MenubarHelpDocumentationMenu, group: '0_pollis', order: 7 }
		});
	}

	run(accessor: ServicesAccessor): Promise<void> {
		return openDocument(accessor, 'pollis-drilldown-ask-pollis.pdf', localize('openDrillDownAskPollis', "Drill-down: Ask Pollis"));
	}
});

/**
 * Compiles the documents of Help > Documentation now, rather than when the Julia REPL next starts, or waits for the
 * compile already running (the Julia extension's command language-julia.pollisCompileDocuments).
 */
registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'pollis.action.compileDocuments',
			title: {
				...localize2('compileDocuments', "Compile the Documents Now"),
				mnemonicTitle: localize({ key: 'miCompileDocuments', comment: ['&& denotes a mnemonic'] }, "&&Compile the Documents Now"),
			},
			category: Categories.Help,
			f1: true,
			menu: { id: MenubarHelpDocumentationMenu, group: '2_compile', order: 1 }
		});
	}

	async run(accessor: ServicesAccessor): Promise<void> {
		const commandService = accessor.get(ICommandService);
		const notificationService = accessor.get(INotificationService);
		let answer: { total?: number; failed?: number; error?: string } | undefined;
		try {
			answer = await commandService.executeCommand('language-julia.pollisCompileDocuments');
		} catch {
			answer = { error: 'failed' };
		}
		if (answer?.error === 'noJulia') {
			notificationService.info(localize('compileDocumentsNoJulia', "The documents are compiled with Julia, which Pollis cannot find. Install Julia, then try again."));
		} else if (!answer || answer.error) {
			notificationService.error(localize('compileDocumentsFailed', "The documents could not be compiled."));
		} else if (answer.failed) {
			notificationService.warn(localize('compileDocumentsSomeFailed', "{0} of the {1} documents could not be compiled. Their logs are in ~/.pollis/documents.", answer.failed, answer.total ?? answer.failed));
		} else if (answer.total === undefined) {
			notificationService.info(localize('compileDocumentsUpToDate', "Every document is compiled and up to date."));
		} else {
			notificationService.info(localize('compileDocumentsDone', "The documents are compiled."));
		}
	}
});

registerHelpLink({
	id: 'pollis.action.openCodeOssDocumentation',
	title: localize2('openCodeOssDocumentation', "Code - OSS Documentation"),
	mnemonicTitle: localize({ key: 'miCodeOssDocumentation', comment: ['&& denotes a mnemonic'] }, "&&Code - OSS"),
	menu: MenubarHelpDocumentationMenu,
	order: 2,
	url: 'https://code.visualstudio.com/docs#vscode'
});

registerHelpLink({
	id: 'pollis.action.openJuliaDocumentation',
	title: localize2('openJuliaDocumentation', "Julia Programming Language Documentation"),
	mnemonicTitle: localize({ key: 'miJuliaDocumentation', comment: ['&& denotes a mnemonic'] }, "&&Julia Programming Language"),
	menu: MenubarHelpDocumentationMenu,
	order: 1,
	url: 'https://docs.julialang.org/en/v1/'
});

registerHelpLink({
	id: 'pollis.action.openCodeOssVideoTutorials',
	title: localize2('openCodeOssVideoTutorials', "Code - OSS Video Tutorials"),
	mnemonicTitle: localize({ key: 'miCodeOssVideoTutorials', comment: ['&& denotes a mnemonic'] }, "&&Code - OSS"),
	menu: MenubarHelpVideoTutorialsMenu,
	order: 3,
	url: 'https://code.visualstudio.com/docs/getstarted/introvideos'
});

registerHelpLink({
	id: 'pollis.action.openJuliaVideoTutorials',
	title: localize2('openJuliaVideoTutorials', "Julia Programming Language Video Tutorials"),
	mnemonicTitle: localize({ key: 'miJuliaVideoTutorials', comment: ['&& denotes a mnemonic'] }, "&&Julia Programming Language"),
	menu: MenubarHelpVideoTutorialsMenu,
	order: 1,
	url: 'https://www.youtube.com/user/JuliaLanguage'
});

registerHelpLink({
	id: 'pollis.action.openJuliaHpcVideoTutorials',
	title: localize2('openJuliaHpcVideoTutorials', "High Performance Computing in Julia Video Tutorials"),
	mnemonicTitle: localize({ key: 'miJuliaHpcVideoTutorials', comment: ['&& denotes a mnemonic'] }, "&&High Performance Computing in Julia"),
	menu: MenubarHelpVideoTutorialsMenu,
	order: 2,
	url: 'https://www.youtube.com/playlist?list=PLUAq6xQKFgGr39PiyrPk_C9dhBKvWcjUA'
});

registerHelpLink({
	id: 'pollis.action.openComputationalThinking',
	title: localize2('openComputationalThinking', "MIT Computational Thinking (Pluto Notebooks)"),
	mnemonicTitle: localize({ key: 'miComputationalThinking', comment: ['&& denotes a mnemonic'] }, "&&MIT Computational Thinking (Pluto)"),
	menu: MenubarHelpNotebookCoursesMenu,
	order: 1,
	url: 'https://computationalthinking.mit.edu'
});

registerHelpLink({
	id: 'pollis.action.openQuantEconJulia',
	title: localize2('openQuantEconJulia', "QuantEcon Julia Lectures (Jupyter Notebooks)"),
	mnemonicTitle: localize({ key: 'miQuantEconJulia', comment: ['&& denotes a mnemonic'] }, "&&QuantEcon Julia Lectures (Jupyter)"),
	menu: MenubarHelpNotebookCoursesMenu,
	order: 2,
	url: 'https://julia.quantecon.org'
});
