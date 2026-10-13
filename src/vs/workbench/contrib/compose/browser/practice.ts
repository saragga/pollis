/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Compose > Practice: multiple-choice exercises whose data and answers Julia computes, a new version for
// each seed. Practise a Topic lists the topics on a page and asks the exercises of the one picked one at a
// time, from the first or from the exercise picked; Write an Exercise starts one
// from a template and previews it beside the editor on every save. An exercise is a TOML file, described
// in media/practice/practice.jl, the script that makes the versions; the bundled exercises are in
// media/practice/exercises/<topic>/ and the user's in ~/.pollis/practice/<topic>/, merged by topic.

import { VSBuffer } from '../../../../base/common/buffer.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { Event } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { FileAccess } from '../../../../base/common/network.js';
import { basename, dirname, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { localize, localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { IQuickInputService, IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
import { IEditorService, SIDE_GROUP } from '../../../services/editor/common/editorService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { parseToml } from '../../model/browser/common/tomlPanelData.js';
import { ITerminalService } from '../../terminal/browser/terminal.js';
import { WebviewInput } from '../../webviewPanel/browser/webviewEditorInput.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { LIBRARY_PAGE_HELPERS, LIBRARY_PAGE_STYLE } from './libraryPage.js';

export const PRACTISE_TOPIC_COMMAND_ID = 'pollis.practice.topic';
export const WRITE_EXERCISE_COMMAND_ID = 'pollis.practice.write';

const PRACTICE_SCRIPT = 'vs/workbench/contrib/compose/browser/media/practice/practice.jl';
const BUNDLED_EXERCISES = 'vs/workbench/contrib/compose/browser/media/practice/exercises';
const TOPIC_FILE = 'topic.toml';

/** An exercise file and its title (its file name when it has none, or does not parse). */
interface IExercise {
	readonly resource: URI;
	readonly title: string;
}

/** A topic: its exercises from Pollis and from the user, in the order of their file names. */
interface ITopic {
	readonly name: string;
	readonly title: string;
	readonly description?: string;
	readonly order: number;
	readonly exercises: IExercise[];
	/** Whether Pollis has the topic, and whether the user wrote some of its exercises or its topic.toml. */
	readonly bundled: boolean;
	readonly mine: boolean;
}

/** One version of an exercise, as practice.jl writes it: either the exercise or the error it raised. */
interface IVersion {
	readonly file: string;
	readonly seed?: number;
	readonly title?: string;
	readonly panel?: string | null;
	readonly question?: string;
	readonly choices?: string[];
	readonly answer?: number;
	readonly explanation?: string;
	readonly error?: string;
}

type PageMessage =
	| { command: 'ready' }
	| { command: 'check'; choice: number }
	| { command: 'next' }
	| { command: 'previous' }
	| { command: 'newData' }
	| { command: 'learnMore' }
	| { command: 'again' }
	| { command: 'edit' };

type BrowseMessage =
	| { command: 'ready' }
	| { command: 'practise'; topic: string; start: number };

interface IPick<T> extends IQuickPickItem {
	readonly value: T;
}

/** The user's exercises, one folder per topic. */
function practiceFolder(pathService: IPathService): URI {
	return joinPath(pathService.userHome({ preferLocal: true }), '.pollis', 'practice');
}

function text(value: unknown): string | undefined {
	return typeof value === 'string' && value ? value : undefined;
}

/** A random seed, so each session has its own data. */
function newSeed(): number {
	return Math.floor(Math.random() * 1_000_000);
}

/** The topics of Pollis and of the user, merged by folder name; the user's topic.toml and exercises win. */
async function readTopics(fileService: IFileService, pathService: IPathService): Promise<ITopic[]> {
	const topics = new Map<string, { title?: string; description?: string; order?: number; bundled: boolean; mine: boolean; exercises: Map<string, IExercise> }>();
	const userRoot = practiceFolder(pathService);
	for (const root of [FileAccess.asFileUri(BUNDLED_EXERCISES), userRoot]) {
		const mine = root === userRoot;
		if (!await fileService.exists(root)) {
			continue;
		}
		for (const folder of (await fileService.resolve(root)).children ?? []) {
			if (!folder.isDirectory || folder.name.startsWith('.')) {
				continue;
			}
			let topic = topics.get(folder.name);
			if (!topic) {
				topic = { bundled: false, mine: false, exercises: new Map() };
				topics.set(folder.name, topic);
			}
			topic.mine ||= mine;
			topic.bundled ||= !mine;
			for (const child of (await fileService.resolve(folder.resource)).children ?? []) {
				if (child.isDirectory || !child.name.endsWith('.toml')) {
					continue;
				}
				if (child.name === TOPIC_FILE) {
					try {
						const toml = parseToml((await fileService.readFile(child.resource)).value.toString());
						topic.title = text(toml.title) ?? topic.title;
						topic.description = text(toml.description) ?? topic.description;
						topic.order = typeof toml.order === 'number' ? toml.order : topic.order;
					} catch {
						// A topic.toml that does not parse leaves the folder name as the title
					}
				} else {
					let title: string | undefined;
					try {
						title = text(parseToml((await fileService.readFile(child.resource)).value.toString()).title);
					} catch {
						// An exercise that does not parse is listed by its file name; Julia reports the error
					}
					topic.exercises.set(child.name, { resource: child.resource, title: title ?? child.name.replace(/\.toml$/, '') });
				}
			}
		}
	}
	return [...topics].map(([name, topic]) => ({
		name,
		title: topic.title ?? name,
		description: topic.description,
		order: topic.order ?? Number.MAX_SAFE_INTEGER,
		bundled: topic.bundled,
		mine: topic.mine,
		exercises: [...topic.exercises].sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([, exercise]) => exercise),
	})).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

interface IJuliaServices {
	readonly terminalService: ITerminalService;
	readonly configurationService: IConfigurationService;
	readonly fileService: IFileService;
	readonly pathService: IPathService;
	readonly progressService: IProgressService;
}

/** One version of each exercise, made by practice.jl in a hidden terminal from `seed` (the i-th exercise from seed + i). */
async function makeVersions({ terminalService, configurationService, fileService, pathService, progressService }: IJuliaServices, files: readonly URI[], seed: number): Promise<IVersion[]> {
	const folder = practiceFolder(pathService);
	await fileService.createFolder(folder);
	const out = joinPath(folder, `.versions-${generateUuid()}.json`);
	const julia = configurationService.getValue<string>('julia.executablePath') || 'julia';
	return progressService.withProgress({ location: ProgressLocation.Notification, delay: 1500, title: localize('practice.making', "Making the exercises with Julia...") }, async () => {
		const instance = await terminalService.createTerminal({
			config: {
				name: localize('practice.terminal', "Practice"),
				executable: julia,
				args: ['--startup-file=no', FileAccess.asFileUri(PRACTICE_SCRIPT).fsPath, out.fsPath, String(seed), ...files.map(file => file.fsPath)],
				cwd: folder,
				hideFromUser: true,
				isTransient: true,
			},
		});
		try {
			const exit = instance.exitCode ?? await Event.toPromise(instance.onExit);
			if (!await fileService.exists(out)) {
				const reason = typeof exit === 'object' ? exit.message : localize('practice.exitCode', "exit code {0}", String(exit));
				throw new Error(localize('practice.juliaFailed', "Julia could not make the exercises ({0}). Check that Julia is installed, or set its path in the julia.executablePath setting.", reason));
			}
			return (JSON.parse((await fileService.readFile(out)).value.toString()) as { exercises: IVersion[] }).exercises;
		} finally {
			instance.dispose();
			if (await fileService.exists(out)) {
				await fileService.del(out);
			}
		}
	});
}

/** A version without its answer and explanation, for the page before the user checks. */
function question(version: IVersion) {
	return { title: version.title, question: version.question, choices: version.choices, panel: !!version.panel };
}

const openPreviews = new Map<string, WebviewInput>();

function openPage(webviewWorkbenchService: IWebviewWorkbenchService, title: string, mode: 'practice' | 'preview', group?: typeof SIDE_GROUP): WebviewInput {
	const webviewInput = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		mode === 'practice' ? 'pollis.practice' : 'pollis.practice.preview',
		title,
		undefined,
		{ group, preserveFocus: mode === 'preview' }
	);
	webviewInput.webview.setHtml(pageHtml());
	return webviewInput;
}

/**
 * Practise a Topic: the topic's exercises one at a time, from `start`, checked here so the page never
 * holds the answers. The user can go back and forth and skip; an exercise answered shows its answer again.
 */
async function practiseTopic(accessor: ServicesAccessor, topic: ITopic, start: number): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const notificationService = accessor.get(INotificationService);
	const commandService = accessor.get(ICommandService);
	const julia: IJuliaServices = {
		terminalService: accessor.get(ITerminalService),
		configurationService: accessor.get(IConfigurationService),
		fileService: accessor.get(IFileService),
		pathService: accessor.get(IPathService),
		progressService: accessor.get(IProgressService),
	};
	const files = topic.exercises.map(exercise => exercise.resource);

	/** The versions that rendered; the exercises that raised an error are reported and left out. */
	const make = async (files: readonly URI[], seed: number) => {
		const versions = await makeVersions(julia, files, seed);
		const failed = versions.filter(version => version.error);
		if (failed.length) {
			notificationService.warn(localize('practice.someFailed', "Left out, because Julia raised an error: {0}", failed.map(version => `${basename(URI.file(version.file))} (${version.error})`).join('; ')));
		}
		return versions.filter(version => !version.error);
	};

	let versions: IVersion[];
	try {
		versions = await make(files, newSeed());
	} catch (error) {
		notificationService.error(toErrorMessage(error));
		return;
	}
	if (!versions.length) {
		return;
	}

	const webviewInput = openPage(webviewWorkbenchService, topic.title, 'practice');
	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => disposables.dispose()));

	// The exercise picked on the topics page, found among the versions that rendered
	let index = Math.max(0, versions.findIndex(version => version.file === files[start]?.fsPath));
	/** The choice made in each exercise answered, by index. */
	const answers = new Map<number, number>();
	let busy = false;
	const post = (message: object) => webviewInput.webview.postMessage(message);
	const result = (i: number) => {
		const choice = answers.get(i)!;
		return { command: 'result', choice, answer: versions[i].answer, correct: choice === versions[i].answer, explanation: versions[i].explanation };
	};
	const postExercise = () => {
		post({ command: 'exercise', topic: topic.title, index, total: versions.length, ...question(versions[index]) });
		if (answers.has(index)) {
			post(result(index));
		}
	};
	const run = async (action: () => Promise<void>) => {
		if (busy) {
			return;
		}
		busy = true;
		post({ command: 'busy', busy: true });
		try {
			await action();
		} catch (error) {
			notificationService.error(toErrorMessage(error));
		} finally {
			busy = false;
			post({ command: 'busy', busy: false });
		}
	};

	disposables.add(webviewInput.webview.onMessage((e: { message: PageMessage }) => {
		const message = e.message;
		const version = versions[index];
		if (message.command === 'ready') {
			postExercise();
		} else if (message.command === 'check' && !answers.has(index) && version) {
			answers.set(index, message.choice);
			post(result(index));
		} else if (message.command === 'next') {
			if (index + 1 < versions.length) {
				index++;
				postExercise();
			} else {
				const score = [...answers].filter(([i, choice]) => choice === versions[i].answer).length;
				post({ command: 'done', topic: topic.title, score, total: versions.length, skipped: versions.length - answers.size });
			}
		} else if (message.command === 'previous' && index > 0) {
			index--;
			postExercise();
		} else if (message.command === 'newData' && version) {
			run(async () => {
				const [fresh] = await make([URI.file(version.file)], newSeed());
				if (fresh) {
					versions[index] = fresh;
					answers.delete(index);
					postExercise();
				}
			});
		} else if (message.command === 'learnMore' && version?.panel) {
			commandService.executeCommand(version.panel);
		} else if (message.command === 'again') {
			run(async () => {
				const fresh = await make(files, newSeed());
				if (fresh.length) {
					versions = fresh;
					index = 0;
					answers.clear();
					postExercise();
				}
			});
		}
	}));
}

let browsePage: WebviewInput | undefined;

/** The topics page: each topic with its exercises; a topic practises from the first, an exercise from itself. */
async function browseTopics(accessor: ServicesAccessor): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const fileService = accessor.get(IFileService);
	const pathService = accessor.get(IPathService);
	const instantiationService = accessor.get(IInstantiationService);

	let topics: ITopic[] = [];
	const post = (webviewInput: WebviewInput) => webviewInput.webview.postMessage({
		command: 'topics',
		topics: topics.map(topic => ({ name: topic.name, title: topic.title, description: topic.description, bundled: topic.bundled, mine: topic.mine, exercises: topic.exercises.map(exercise => exercise.title) })),
	});
	const read = async () => {
		topics = (await readTopics(fileService, pathService)).filter(topic => topic.exercises.length);
	};

	// Opened again, the page lists the exercises written since
	if (browsePage && !browsePage.isDisposed()) {
		await read();
		post(browsePage);
		webviewWorkbenchService.revealWebview(browsePage, browsePage.group ?? -1, false);
		return;
	}
	await read();
	const title = localize('practice.browse.title', "Practise a Topic");
	const webviewInput = browsePage = webviewWorkbenchService.openWebview(
		{
			title,
			options: { retainContextWhenHidden: true },
			contentOptions: { allowScripts: true, localResourceRoots: [] },
			extension: undefined,
		},
		'pollis.practice.topics',
		title,
		undefined,
		{},
	);
	webviewInput.webview.setHtml(browseHtml());
	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		browsePage = undefined;
		disposables.dispose();
	}));
	disposables.add(webviewInput.webview.onMessage((e: { message: BrowseMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			post(webviewInput);
		} else if (message.command === 'practise') {
			const topic = topics.find(candidate => candidate.name === message.topic);
			if (topic) {
				instantiationService.invokeFunction(practiseTopic, topic, message.start);
			}
		}
	}));
}

/** The preview of an exercise beside its editor: a new version on every save, or the error Julia raised. */
async function previewExercise(accessor: ServicesAccessor, file: URI): Promise<void> {
	const webviewWorkbenchService = accessor.get(IWebviewWorkbenchService);
	const editorService = accessor.get(IEditorService);
	const commandService = accessor.get(ICommandService);
	const notificationService = accessor.get(INotificationService);
	const julia: IJuliaServices = {
		terminalService: accessor.get(ITerminalService),
		configurationService: accessor.get(IConfigurationService),
		fileService: accessor.get(IFileService),
		pathService: accessor.get(IPathService),
		progressService: accessor.get(IProgressService),
	};

	const open = openPreviews.get(file.toString());
	if (open && !open.isDisposed()) {
		webviewWorkbenchService.revealWebview(open, open.group ?? -1, true);
		return;
	}
	const webviewInput = openPage(webviewWorkbenchService, localize('practice.previewTitle', "Preview: {0}", basename(file)), 'preview', SIDE_GROUP);
	openPreviews.set(file.toString(), webviewInput);
	const disposables = new DisposableStore();
	disposables.add(webviewInput.webview.onDidDispose(() => {
		openPreviews.delete(file.toString());
		disposables.dispose();
	}));

	let seed = newSeed();
	let version: IVersion | undefined;
	const render = async () => {
		webviewInput.webview.postMessage({ command: 'busy', busy: true });
		try {
			[version] = await makeVersions(julia, [file], seed);
			webviewInput.webview.postMessage({ command: 'preview', file: basename(file), version });
		} catch (error) {
			webviewInput.webview.postMessage({ command: 'preview', file: basename(file), version: { file: file.fsPath, error: toErrorMessage(error) } });
		} finally {
			webviewInput.webview.postMessage({ command: 'busy', busy: false });
		}
	};
	const rerender = disposables.add(new RunOnceScheduler(() => render(), 300));
	const watcher = disposables.add(julia.fileService.createWatcher(dirname(file), { recursive: false, excludes: [] }));
	disposables.add(watcher.onDidChange(e => {
		if (e.contains(file)) {
			rerender.schedule();
		}
	}));

	disposables.add(webviewInput.webview.onMessage((e: { message: PageMessage }) => {
		const message = e.message;
		if (message.command === 'ready') {
			render();
		} else if (message.command === 'newData') {
			seed = newSeed();
			render();
		} else if (message.command === 'edit') {
			editorService.openEditor({ resource: file }).catch(error => notificationService.error(toErrorMessage(error)));
		} else if (message.command === 'learnMore' && version?.panel) {
			commandService.executeCommand(version.panel);
		}
	}));
}

/** A name for a file or folder, from a title: lower case, words joined by hyphens. */
function fileName(title: string): string {
	return title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** The template Write an Exercise starts from: an exercise that works, to change. */
function exerciseTemplate(title: string): string {
	return [
		'# An exercise for Compose > Practice: a question with one correct choice, computed by Julia.',
		'# Each {{expression}} is Julia, evaluated after setup. rng is seeded, so each version has its own data;',
		'# fmt(x, digits) writes x with fixed decimals and list(v) writes values separated by commas.',
		'# The choices are shuffled; answer is the correct one, counted from 1. Make the wrong choices typical',
		'# mistakes. Save, and the preview beside this file shows a new version, or the error Julia raised.',
		'',
		`title = ${JSON.stringify(title)}`,
		'# panel = "chiara.explore.dstats"    # the command of the Pollis panel that explains the method (Learn More)',
		'packages = ["Distributions"]         # installed when missing; Random, Statistics, LinearAlgebra and Printf are always loaded',
		`setup = '''`,
		'x = round.(rand(rng, Normal(50, 10), 8); digits = 1)',
		`'''`,
		`question = '''A sample of 8 values: {{list(x)}}. What is the sample mean?'''`,
		`choices = ['{{fmt(mean(x), 2)}}', '{{fmt(median(x), 2)}}', '{{fmt(sum(x) / 7, 2)}}', '{{fmt(maximum(x) - minimum(x), 2)}}']`,
		'answer = 1',
		`explanation = '''The mean is the sum of the values divided by n = 8: {{fmt(mean(x), 2)}}. The other choices are typical mistakes: the median, dividing by n - 1 and the range.'''`,
		'',
	].join('\n');
}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: PRACTISE_TOPIC_COMMAND_ID,
			title: localize2('practice.topic', "Practise a Topic..."),
			category: localize2('practice.category', "Practice"),
			f1: true,
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		await browseTopics(accessor);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: WRITE_EXERCISE_COMMAND_ID,
			title: localize2('practice.write', "Write an Exercise..."),
			category: localize2('practice.category', "Practice"),
			f1: true,
		});
	}
	async run(accessor: ServicesAccessor): Promise<void> {
		const quickInputService = accessor.get(IQuickInputService);
		const fileService = accessor.get(IFileService);
		const pathService = accessor.get(IPathService);
		const editorService = accessor.get(IEditorService);
		const notificationService = accessor.get(INotificationService);
		const instantiationService = accessor.get(IInstantiationService);
		const topics = await readTopics(fileService, pathService);
		const pick = await quickInputService.pick<IPick<ITopic | undefined>>([
			{ label: localize('practice.newTopic', "New Topic..."), value: undefined },
			...topics.map(topic => ({ label: topic.title, description: topic.name, detail: topic.description, value: topic })),
		], { title: localize('practice.write.pickTopic', "Topic of the Exercise"), placeHolder: localize('practice.write.pickTopicPlaceholder', "Your exercises are saved in ~/.pollis/practice, one folder per topic") });
		if (!pick) {
			return;
		}
		const root = practiceFolder(pathService);
		try {
			let folder: URI;
			if (pick.value) {
				folder = joinPath(root, pick.value.name);
			} else {
				const topicTitle = (await quickInputService.input({
					title: localize('practice.newTopic.title', "New Topic"),
					prompt: localize('practice.newTopic.prompt', "The topic's title, e.g. Probability Distributions"),
					validateInput: async value => {
						const name = fileName(value);
						if (!name) {
							return localize('practice.newTopic.empty', "A title with at least one letter or digit.");
						}
						return topics.some(topic => topic.name === name) ? localize('practice.newTopic.exists', "There is a topic {0} already: pick it instead.", name) : undefined;
					},
				}))?.trim();
				if (!topicTitle) {
					return;
				}
				folder = joinPath(root, fileName(topicTitle));
				await fileService.writeFile(joinPath(folder, TOPIC_FILE), VSBuffer.fromString(`title = ${JSON.stringify(topicTitle)}\ndescription = ""\n`));
			}
			await fileService.createFolder(folder);
			const title = (await quickInputService.input({
				title: localize('practice.write.title', "New Exercise"),
				prompt: localize('practice.write.prompt', "The exercise's title, e.g. The mean of a sample"),
				validateInput: async value => {
					const name = fileName(value);
					if (!name) {
						return localize('practice.write.empty', "A title with at least one letter or digit.");
					}
					return await fileService.exists(joinPath(folder, `${name}.toml`)) ? localize('practice.write.exists', "{0}.toml exists already in this topic.", name) : undefined;
				},
			}))?.trim();
			if (!title) {
				return;
			}
			const file = joinPath(folder, `${fileName(title)}.toml`);
			await fileService.writeFile(file, VSBuffer.fromString(exerciseTemplate(title)));
			await editorService.openEditor({ resource: file });
			await instantiationService.invokeFunction(previewExercise, file);
		} catch (error) {
			notificationService.error(localize('practice.write.failed', "Could not write the exercise: {0}", toErrorMessage(error)));
		}
	}
});

/** The topics page: its texts come from here, its topics from the `topics` message. */
function browseHtml(): string {
	const text = {
		topic: localize('practice.browse.topic', "Topic"),
		exercises: localize('practice.browse.exercises', "Exercises"),
		source: localize('practice.browse.source', "Source"),
		pollis: localize('practice.browse.pollis', "Pollis"),
		mine: localize('practice.browse.mine', "Pollis and yours"),
		onlyMine: localize('practice.browse.onlyMine', "Yours"),
		practiseAll: localize('practice.browse.practiseAll', "Practise All"),
		none: localize('practice.noTopics', "There are no exercises yet: write one with Compose > Practice > Write an Exercise."),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
${LIBRARY_PAGE_STYLE}
	.topic { width: 34%; }
	.exercise { display: block; text-align: left; margin: 0 0 4px 0; }
	.number { display: inline-block; min-width: 2.4em; color: var(--vscode-descriptionForeground); }
	.title .number { color: inherit; min-width: 0; margin-right: 6px; }
	</style>
</head>
<body>
<div class="container">
	<h1>${localize('practice.browse.title', "Practise a Topic")}</h1>
	<p class="subtitle">${localize('practice.browse.intro', "Multiple-choice exercises whose data and answers Julia computes, with new data every time. Pick a topic to practise its exercises in order, or an exercise to start from it; you can skip an exercise and come back to it. The exercises you write with Write an Exercise are kept in ~/.pollis/practice and listed here with Pollis' own.")}</p>
	<table>
		<thead><tr><th>${text.topic}</th><th>${text.exercises}</th><th>${text.source}</th></tr></thead>
		<tbody id="topics"></tbody>
	</table>
	<p class="subtitle" id="none" hidden>${text.none}</p>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const body = document.getElementById('topics');

${LIBRARY_PAGE_HELPERS}

	function practise(topic, start) {
		vscode.postMessage({ command: 'practise', topic: topic.name, start });
	}

	function render(topics) {
		body.textContent = '';
		document.getElementById('none').hidden = topics.length > 0;
		// Topics are numbered 1, 2, ... and their exercises 1.1, 1.2, ..., so a set of them can be named by number
		topics.forEach((topic, t) => {
			const row = element('tr');
			const name = cell(row, 'topic');
			const title = element('div', 'title');
			title.append(element('span', 'number', (t + 1) + '.'), document.createTextNode(topic.title));
			title.addEventListener('click', () => practise(topic, 0));
			name.appendChild(title);
			if (topic.description) {
				name.appendChild(element('p', 'description', topic.description));
			}
			name.appendChild(link(TEXT.practiseAll, () => practise(topic, 0)));
			const exercises = cell(row);
			topic.exercises.forEach((exercise, i) => {
				const line = link('', () => practise(topic, i));
				line.classList.add('exercise');
				line.append(element('span', 'number', (t + 1) + '.' + (i + 1)), document.createTextNode(exercise));
				exercises.appendChild(line);
			});
			cell(row, 'nowrap small').textContent = !topic.mine ? TEXT.pollis : topic.bundled ? TEXT.mine : TEXT.onlyMine;
			body.appendChild(row);
		});
	}

	window.addEventListener('message', event => {
		if (event.data.command === 'topics') {
			render(event.data.topics);
		}
	});
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}

/** The page of both modes, told apart by its messages: Practise a Topic asks and checks; the preview shows the answer and the explanation at once. */
function pageHtml(): string {
	const text = {
		progress: localize('practice.page.progress', "{0}: Exercise {1} of {2}"),
		check: localize('practice.page.check', "Check"),
		next: localize('practice.page.next', "Next"),
		previous: localize('practice.page.previous', "Previous"),
		finish: localize('practice.page.finish', "See Score"),
		newData: localize('practice.page.newData', "New Data"),
		learnMore: localize('practice.page.learnMore', "Learn More"),
		again: localize('practice.page.again', "Practise Again"),
		edit: localize('practice.page.edit', "Edit Exercise"),
		correct: localize('practice.page.correct', "Correct."),
		wrong: localize('practice.page.wrong', "Not quite: the answer is {0}."),
		score: localize('practice.page.score', "You answered {0} of {1} correctly."),
		skipped: localize('practice.page.skipped', "You answered {0} of {1} correctly, and skipped {2}."),
		making: localize('practice.page.making', "Julia is making a version..."),
		seed: localize('practice.page.seed', "{0}, version from seed {1}. Save the file for a new preview."),
		error: localize('practice.page.error', "Julia raised an error. Fix the exercise and save."),
		answerIs: localize('practice.page.answerIs', "Correct choice"),
		explanation: localize('practice.page.explanation', "Explanation"),
	};
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
	<style>
		* { box-sizing: border-box; }
		body { font-family: var(--vscode-font-family); font-size: 13px; margin: 0; color: var(--vscode-foreground); background-color: var(--vscode-editor-background); }
		.container { padding: 20px; max-width: 780px; }
		.subtitle, .small { color: var(--vscode-descriptionForeground); }
		.subtitle { margin: 0 0 6px 0; }
		.small { font-size: 12px; }
		h1 { font-size: 22px; font-weight: 300; margin: 0 0 14px 0; line-height: 1.25; }
		.question { font-size: 15px; line-height: 1.55; margin: 0 0 14px 0; }
		.choice { display: flex; gap: 10px; width: 100%; text-align: left; font: inherit; font-size: 14px; line-height: 1.45; color: var(--vscode-foreground); background: none; border: 1px solid var(--vscode-widget-border); border-radius: 4px; padding: 8px 12px; margin: 0 0 8px 0; cursor: pointer; }
		.choice:hover:not(:disabled) { background: var(--vscode-list-hoverBackground); }
		.choice:disabled { cursor: default; }
		.choice .letter { font-weight: 600; min-width: 1.2em; }
		.choice.selected { border-color: var(--vscode-focusBorder); outline: 1px solid var(--vscode-focusBorder); }
		.choice.correct { border-color: var(--vscode-testing-iconPassed); background: var(--vscode-diffEditor-insertedTextBackground); }
		.choice.wrong { border-color: var(--vscode-errorForeground); background: var(--vscode-diffEditor-removedTextBackground); }
		.actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; }
		button.action { font: inherit; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); border: none; border-radius: 2px; padding: 4px 12px; cursor: pointer; }
		button.action:hover:not(:disabled) { background: var(--vscode-button-secondaryHoverBackground); }
		button.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
		button.primary:hover:not(:disabled) { background: var(--vscode-button-hoverBackground); }
		button:disabled { opacity: 0.5; cursor: default; }
		.feedback { line-height: 1.5; margin: 0 0 8px 0; }
		.verdict { font-weight: 600; margin: 0 0 4px 0; }
		.verdict.correct { color: var(--vscode-testing-iconPassed); }
		.verdict.wrong { color: var(--vscode-errorForeground); }
		.error { color: var(--vscode-errorForeground); white-space: pre-wrap; font-family: var(--vscode-editor-font-family); font-size: 12px; }
		.score { font-size: 18px; margin: 10px 0; }
	</style>
</head>
<body>
<div class="container">
	<p class="subtitle" id="subtitle"></p>
	<h1 id="title"></h1>
	<div id="body"></div>
	<p class="small" id="busy" hidden>${text.making}</p>
</div>
<script>
	const vscode = acquireVsCodeApi();
	const TEXT = ${JSON.stringify(text)};
	const LETTERS = 'ABCDEFGHIJ';
	let selected = undefined;

	function element(tag, className, content) {
		const node = document.createElement(tag);
		if (className) { node.className = className; }
		if (content !== undefined) { node.textContent = content; }
		return node;
	}
	function format(template, ...values) {
		return template.replace(/\\{(\\d+)\\}/g, (match, i) => String(values[Number(i)]));
	}
	function button(label, command, primary) {
		const node = element('button', 'action' + (primary ? ' primary' : ''), label);
		if (command) { node.addEventListener('click', () => vscode.postMessage(command)); }
		return node;
	}
	function choiceButton(choice, i) {
		const node = element('button', 'choice');
		node.dataset.index = String(i + 1);
		node.append(element('span', 'letter', LETTERS[i]), element('span', '', choice));
		return node;
	}
	function setBusy(busy) {
		document.getElementById('busy').hidden = !busy;
		for (const node of document.querySelectorAll('button')) { node.disabled = busy || node.dataset.locked === 'true'; }
	}

	function showExercise(message) {
		selected = undefined;
		document.getElementById('subtitle').textContent = format(TEXT.progress, message.topic, message.index + 1, message.total);
		document.getElementById('title').textContent = message.title;
		const body = document.getElementById('body');
		body.replaceChildren();
		body.append(element('p', 'question', message.question));
		const choices = element('div');
		const check = button(TEXT.check, undefined, true);
		check.disabled = true;
		check.dataset.locked = 'true';
		message.choices.forEach((choice, i) => {
			const node = choiceButton(choice, i);
			node.addEventListener('click', () => {
				selected = i + 1;
				for (const other of choices.children) { other.classList.toggle('selected', other === node); }
				check.disabled = false;
				check.dataset.locked = 'false';
			});
			choices.append(node);
		});
		check.onclick = () => { if (selected) { vscode.postMessage({ command: 'check', choice: selected }); } };
		check.classList.add('check');
		// Previous and Next are always there, so an exercise can be skipped and come back to
		const previous = button(TEXT.previous, { command: 'previous' });
		if (message.index === 0) {
			previous.disabled = true;
			previous.dataset.locked = 'true';
		}
		const next = button(message.index + 1 === message.total ? TEXT.finish : TEXT.next, { command: 'next' });
		next.classList.add('next');
		const actions = element('div', 'actions');
		actions.append(check, previous, next, button(TEXT.newData, { command: 'newData' }));
		if (message.panel) { actions.append(button(TEXT.learnMore, { command: 'learnMore' })); }
		body.append(choices, actions, element('div', 'feedback'));
	}

	function showResult(message) {
		const body = document.getElementById('body');
		for (const node of body.querySelectorAll('.choice')) {
			const i = Number(node.dataset.index);
			node.disabled = true;
			node.dataset.locked = 'true';
			node.classList.remove('selected');
			node.classList.toggle('correct', i === message.answer);
			node.classList.toggle('wrong', i === message.choice && !message.correct);
		}
		body.querySelector('.check').remove();
		body.querySelector('.next').classList.add('primary');
		const feedback = body.querySelector('.feedback');
		feedback.replaceChildren(
			element('p', 'verdict ' + (message.correct ? 'correct' : 'wrong'), message.correct ? TEXT.correct : format(TEXT.wrong, LETTERS[message.answer - 1])),
			element('p', '', message.explanation)
		);
	}

	function showDone(message) {
		document.getElementById('subtitle').textContent = message.topic;
		document.getElementById('title').textContent = '';
		const body = document.getElementById('body');
		body.replaceChildren(element('p', 'score', message.skipped ? format(TEXT.skipped, message.score, message.total, message.skipped) : format(TEXT.score, message.score, message.total)));
		const actions = element('div', 'actions');
		actions.append(button(TEXT.again, { command: 'again' }, true));
		body.append(actions);
	}

	function showPreview(message) {
		const version = message.version;
		const body = document.getElementById('body');
		body.replaceChildren();
		const actions = element('div', 'actions');
		actions.append(button(TEXT.newData, { command: 'newData' }, true), button(TEXT.edit, { command: 'edit' }));
		if (version.error) {
			document.getElementById('subtitle').textContent = message.file;
			document.getElementById('title').textContent = TEXT.error;
			body.append(element('p', 'error', version.error), actions);
			return;
		}
		document.getElementById('subtitle').textContent = format(TEXT.seed, message.file, version.seed);
		document.getElementById('title').textContent = version.title;
		body.append(element('p', 'question', version.question));
		version.choices.forEach((choice, i) => {
			const node = choiceButton(choice, i);
			node.disabled = true;
			node.dataset.locked = 'true';
			node.title = i + 1 === version.answer ? TEXT.answerIs : '';
			node.classList.toggle('correct', i + 1 === version.answer);
			body.append(node);
		});
		if (version.panel) { actions.append(button(TEXT.learnMore, { command: 'learnMore' })); }
		body.append(actions, element('p', 'verdict', TEXT.explanation), element('p', 'feedback', version.explanation));
	}

	window.addEventListener('message', event => {
		const message = event.data;
		if (message.command === 'exercise') { showExercise(message); }
		else if (message.command === 'result') { showResult(message); }
		else if (message.command === 'done') { showDone(message); }
		else if (message.command === 'preview') { showPreview(message); }
		else if (message.command === 'busy') { setBusy(message.busy); }
	});
	vscode.postMessage({ command: 'ready' });
</script>
</body>
</html>`;
}
