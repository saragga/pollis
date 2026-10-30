/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { joinPath } from '../../../../base/common/resources.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ISecretStorageService } from '../../../../platform/secrets/common/secrets.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { ASK_CHAT_MODEL, ASK_CLOUD_PROVIDERS, ASK_LOCAL_PREFIX, askCloudModel, askPassageLabel, IAskPollisAnswer, IAskPollisEvalItem, IAskPollisFound, IAskPollisPassage, IAskPollisService, IAskTopicCounts, ICompareRun, ICompareRunAnswer, ICompareRunModel, ICompareRunQuestion, ICompareRunScore, ICompareRunUnrated } from '../common/askPollis.js';
import { askModelName } from './askPollisWebview.js';
import { askFolder, CompareSampler, CompareTestSets, evalItem, ICompareSample, ICompareSamples, isEvalItem, mergeEvalItems } from './compareShared.js';

// What Evaluate Answering Models runs (compareModelsPage.ts): the test sets, each a JSON array of RAGTools.jl's QAEvalItem, the
// Standard one that Pollis ships, read from Pollis each time, and the user's, in ~/.pollis/ask/sets, which Pollis
// never changes but at the user's own request; Make Questions, which has RAGTools.jl write them from passages spread over the documents; and a run. A
// run finds the passages of each question once, or takes those an earlier run found with the same index and settings
// (IAskPollisService.searchStamp), then has each model answer every question from them, as Ask Pollis
// would (IAskPollisService.answer: the same instruction, the same passages), the cloud models together and the local
// ones one after the other, each server stopped once it has answered, the embedding model of the search and the chat
// model of Ask Pollis before them, so that each runs alone in memory. The judges then rate each answer, and RAGTools.jl places each question's own passage among
// those found, in a Julia process of the Julia extension (language-julia.pollisCompareModels, ask_compare.jl), given the
// keys of the cloud providers it needs from Secret Storage; two judges on this computer in one process each, one after
// the other, so that each is alone in memory too. The run is kept in Comparisons.duckdb. There is one runner
// per window, so that a run goes on when the page is closed, and the page opened again shows how far it has come.

/** How many passages of each topic Make Questions asks about, at first: the user changes them beside Make Questions... */
export const QUESTION_COUNTS: IAskTopicCounts = { pollis: 4, julia: 2, panels: 4 };

/** What the Julia extension's command answers (pollisCompareModels.ts). */
interface IJuliaAnswer {
	readonly lines?: readonly IJuliaLine[];
	readonly error?: string;
}

/** A line the script wrote: a question made, a rating, a place, or what went wrong for an item. */
interface IJuliaLine {
	readonly item?: IAskPollisEvalItem;
	readonly score?: {
		readonly id: string; readonly judge: string; readonly relevance: number; readonly completeness: number; readonly clarity: number;
		readonly consistency: number; readonly helpfulness: number; readonly final_rating: number; readonly rationale: string;
	};
	readonly rank?: { readonly id: number; readonly rank: number | null };
	readonly failed?: number | string;
	readonly judge?: string;
	readonly error?: string;
}

interface IJuliaProgress {
	readonly status: 'starting' | 'installing' | 'running';
	readonly done: number;
	readonly total: number;
	/** The tokens read and written by the judges until then. */
	readonly tokens?: readonly [number, number];
}

/** A model as the Julia script is given it. */
interface IJuliaModel {
	readonly name: string;
	readonly provider: string;
	readonly file?: string;
}

/** How far a task has come, for the page. */
export interface ICompareProgress {
	readonly text: string;
	readonly done: number;
	readonly total: number;
}

/** What a task of the runner ends with: a run, questions made, or why it could not be done. */
export interface ICompareEnd {
	readonly run?: ICompareRun;
	readonly items?: readonly IAskPollisEvalItem[];
	readonly error?: string;
	readonly stopped?: boolean;
}

/** Why a model gave no answer, or nothing when it gave one or was stopped. */
function answerError(answer: IAskPollisAnswer, text: string, stopped: boolean): string | undefined {
	if (answer.noKey) {
		return localize('compareModels.noKey', "No key for {0}: in Help > Ask Pollis, choose a model of {0} with the button of the model, under the question, then Set API key beside it.", answer.noKey.label);
	}
	if (answer.refused) {
		return localize('compareModels.refused', "{0} declined to answer the question.", answer.model);
	}
	return answer.error === undefined && (text || stopped) ? undefined : localize('compareModels.notAnswered', "{0} did not answer. {1}", answer.model, answer.error ?? '');
}

/** Why the Julia process gave nothing. */
function juliaError(error: string): string {
	switch (error) {
		case 'running':
			return localize('compareModels.juliaBusy', "Another evaluation is running.");
		case 'noJulia':
			return localize('compareModels.noJulia', "Julia was not found. The evaluation runs RAGTools.jl in Julia.");
		case 'failed':
			return localize('compareModels.juliaFailed', "The Julia process of the evaluation could not be started.");
		default:
			return error;
	}
}

/** What a passage is given to the judge as: as the model that answered was given it. */
function judgedPassage(passage: IAskPollisPassage): string {
	return `${askPassageLabel(passage)}\n${passage.text}`;
}

export class CompareModelsRunner {

	private readonly _onDidProgress = new Emitter<ICompareProgress | undefined>();
	/** How far the task has come, and nothing once it has ended. */
	readonly onDidProgress = this._onDidProgress.event;

	private readonly _onDidEnd = new Emitter<ICompareEnd>();
	readonly onDidEnd = this._onDidEnd.event;

	private source: CancellationTokenSource | undefined;
	private _progress: ICompareProgress | undefined;
	/** The samples of the run: the tokens read and written by the models answering, then by the judges. */
	private readonly sampler: CompareSampler;
	/** A new sample of the run; the first of a run starts its charts again. */
	readonly onDidSample: Event<ICompareSample>;
	readonly sets: CompareTestSets;

	constructor(
		@IAskPollisService private readonly askPollisService: IAskPollisService,
		@ICommandService private readonly commandService: ICommandService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@ISecretStorageService private readonly secretStorageService: ISecretStorageService,
		@IFileService private readonly fileService: IFileService,
		@IPathService private readonly pathService: IPathService,
		@IProductService private readonly productService: IProductService,
	) {
		this.sampler = new CompareSampler(commandService);
		this.onDidSample = this.sampler.onDidSample;
		this.sets = new CompareTestSets(fileService, pathService);
	}

	/** How far the task running has come, or nothing when none runs. */
	get progress(): ICompareProgress | undefined {
		return this._progress;
	}

	get running(): boolean {
		return !!this.source;
	}

	/** The samples of the run running, or of the last one. */
	get samples(): ICompareSamples {
		return this.sampler.samples;
	}


	private report(text: string, done = 0, total = 0): void {
		this._progress = { text, done, total };
		this._onDidProgress.fire(this._progress);
	}

	private end(end: ICompareEnd): ICompareEnd {
		this.sampler.stop();
		this.source?.dispose();
		this.source = undefined;
		this._progress = undefined;
		this._onDidProgress.fire(undefined);
		this._onDidEnd.fire(end);
		return end;
	}

	stop(): void {
		this.source?.cancel();
		this.commandService.executeCommand('language-julia.pollisCompareStop').catch(() => undefined);
	}

	private stopServer(file: string): Promise<unknown> {
		return this.commandService.executeCommand('language-julia.pollisStopLlamaServer', { model: file }).catch(() => undefined);
	}

	/** The chat model of Ask Pollis stopped, so that a local model of the comparison is alone in memory. */
	private stopAskModel(): Promise<unknown> {
		return this.stopServer(this.configurationService.getValue<string>('pollis.ask.chatModel')?.trim() || ASK_CHAT_MODEL);
	}

	private juliaModel(value: string): IJuliaModel {
		const cloud = askCloudModel(value);
		if (cloud) {
			return { name: cloud.id, provider: cloud.provider };
		}
		const file = value.slice(ASK_LOCAL_PREFIX.length);
		return { name: askModelName(file), provider: 'local', file };
	}

	/**
	 * Runs `job` in the Julia process, with the keys of the cloud providers of `models` from Secret Storage, its
	 * progress reported with `label` ({0} done of {1}).
	 */
	private async runJulia(job: object, models: readonly string[], label: string): Promise<IJuliaAnswer> {
		// The judges' tokens, counted on from those of the answers
		const before = { ...this.sampler.tokens };
		const keys: { [variable: string]: string } = {};
		for (const value of models) {
			const cloud = askCloudModel(value);
			if (cloud) {
				const provider = ASK_CLOUD_PROVIDERS[cloud.provider];
				const key = await this.secretStorageService.get(provider.secretKey);
				if (!key) {
					return { error: localize('compareModels.noKey', "No key for {0}: in Help > Ask Pollis, choose a model of {0} with the button of the model, under the question, then Set API key beside it.", provider.label) };
				}
				keys[provider.envVar] = key;
			}
		}
		const local = models.filter(value => value.startsWith(ASK_LOCAL_PREFIX)).map(value => value.slice(ASK_LOCAL_PREFIX.length));
		if (local.length) {
			await this.stopAskModel();
			// The memory of a model on this computer is taken as its server loads it, before Julia has asked anything
			this.report(localize('compareModels.loadingModels', "Loading {0} into memory...", local.map(askModelName).join(', ')));
		}
		const task = joinPath(await askFolder(this.pathService), `compare-${generateUuid()}.json`);
		await this.fileService.writeFile(task, VSBuffer.fromString(JSON.stringify(job)));
		const poll = mainWindow.setInterval(async () => {
			const progress = await this.commandService.executeCommand<IJuliaProgress>('language-julia.pollisCompareProgress').catch(() => undefined);
			if (!progress || !this.source) {
				return;
			}
			if (progress.status === 'installing') {
				this.report(localize('compareModels.installing', "Installing RAGTools.jl and PromptingTools.jl, the first time only: some minutes."));
			} else if (progress.status === 'running' && progress.total) {
				if (progress.tokens) {
					this.sampler.tokens = { read: before.read + progress.tokens[0], written: before.written + progress.tokens[1] };
				}
				this.report(label.replace('{0}', String(progress.done)).replace('{1}', String(progress.total)), progress.done, progress.total);
			}
		}, 1000);
		try {
			return await this.commandService.executeCommand<IJuliaAnswer>('language-julia.pollisCompareModels', { task: task.fsPath, keys, local }) ?? { error: 'failed' };
		} catch (err) {
			return { error: err instanceof Error ? err.message : String(err) };
		} finally {
			mainWindow.clearInterval(poll);
			await this.fileService.del(task).catch(() => undefined);
		}
	}

	/** Has the model `questionsBy` write a question and its answer for each of `counts` passages of each topic spread over the documents, added to the user's test set `testSet`. */
	async makeQuestions(questionsBy: string, testSet: string, counts: IAskTopicCounts): Promise<ICompareEnd> {
		if (this.source) {
			return { error: localize('compareModels.busy', "Wait for the run to end, or stop it.") };
		}
		this.source = new CancellationTokenSource();
		this.report(localize('compareModels.choosingPassages', "Choosing the passages to ask about..."));
		const passages = await this.askPollisService.spread(counts);
		if (!passages.length) {
			return this.end({ error: localize('compareModels.noIndex', "Pollis has not indexed its documents yet. It does when the Julia REPL starts.") });
		}
		this.report(localize('compareModels.startingJulia', "Starting the Julia process of the evaluation..."));
		const answer = await this.runJulia({
			task: 'questions',
			model: this.juliaModel(questionsBy),
			passages: passages.map(passage => ({ source: askPassageLabel(passage), context: passage.text })),
		}, [questionsBy], localize('compareModels.makingQuestions', "Making questions: {0} of {1} passages.", '{0}', '{1}'));
		const stopped = !!this.source?.token.isCancellationRequested;
		if (answer.error !== undefined) {
			return this.end({ error: juliaError(answer.error), stopped });
		}
		const lines = answer.lines ?? [];
		const items = lines.map(line => line.item).filter(isEvalItem).map(evalItem);
		const failed = lines.filter(line => line.failed !== undefined);
		if (!items.length && failed.length) {
			return this.end({ error: localize('compareModels.noQuestions', "No question was made. {0}", failed[0].error ?? ''), stopped });
		}
		// Added to the test set here, so that they are kept when the page was closed meanwhile
		await this.sets.write(testSet, mergeEvalItems(await this.sets.read(testSet), items));
		return this.end({ items, stopped });
	}

	/**
	 * Asks every question of `items` of every model of `models`, `repeats` times, and has the answers rated by each
	 * judge of `judges`; the run is kept, as far as it came when stopped.
	 */
	async run(models: readonly ICompareRunModel[], judges: readonly ICompareRunModel[], repeats: number, items: readonly IAskPollisEvalItem[]): Promise<ICompareEnd> {
		if (this.source) {
			return { error: localize('compareModels.busy', "Wait for the run to end, or stop it.") };
		}
		if (!models.length) {
			return { error: localize('compareModels.noModels', "Choose the models to compare, above.") };
		}
		if (!items.length) {
			return { error: localize('compareModels.noItems', "No questions yet: Make Questions... writes them from the documents, and Add takes your own.") };
		}
		const source = this.source = new CancellationTokenSource();
		const token = source.token;
		const id = generateUuid();
		const started = Date.now();
		await this.sampler.start();
		this.sampler.mark('search');

		// The passages of each question, found once for every model: those found before with the same search stamp are
		// taken again, so that the embedding model loads only for the others, and every run gets the same passages
		const stamp = await this.askPollisService.searchStamp();
		const before = stamp ? await this.askPollisService.foundBefore(stamp.key, items.map(item => item.question)).catch(() => []) : [];
		const reused = before.filter(passages => passages !== undefined).length;
		if (stamp && reused) {
			this.sampler.note({ model: askModelName(stamp.embedder), event: 'reused', reused: [reused, items.length] });
		}
		const questions: ICompareRunQuestion[] = [];
		const found: IAskPollisFound[] = [];
		for (const [index, item] of items.entries()) {
			if (token.isCancellationRequested) {
				break;
			}
			const kept = before[index];
			if (kept) {
				questions.push({ index, item, passages: kept });
				continue;
			}
			this.report(localize('compareModels.finding', "Finding the passages of question {0} of {1}...", index + 1, items.length), index, items.length);
			const result = await this.askPollisService.search({ question: item.question });
			questions.push({ index, item, passages: result.passages });
			// Only a search by meaning and words is kept: one by words only, when the embedding model did not start, is not the same
			if (stamp && !result.wordsOnly) {
				found.push({ question: item.question, passages: result.passages });
			}
		}
		if (stamp && found.length) {
			await this.askPollisService.keepFound(stamp.key, found).catch(() => undefined);
		}
		if (questions.length && !questions.some(question => question.passages.length)) {
			return this.end({ error: localize('compareModels.nothingFound', "No passages were found: Pollis may not have indexed its documents yet.") });
		}
		// The embedding model of the search is not needed again in the run: its memory goes to the models answering and judging
		await this.askPollisService.stopSearchModel();

		// The answers: the cloud models together, each question after the other; the local models one after the other
		const answers: ICompareRunAnswer[] = [];
		const total = questions.length * models.length * repeats;
		const answerAll = async (model: ICompareRunModel) => {
			for (const question of questions) {
				for (let repeat = 0; repeat < repeats; repeat++) {
					if (token.isCancellationRequested || !question.passages.length) {
						continue;
					}
					let text = '';
					const answer = await this.askPollisService.answer([], question.item.question, question.passages, answered => text = answered, token, model.value);
					if (token.isCancellationRequested) {
						return;
					}
					const error = answerError(answer, text, false);
					answers.push({ id: generateUuid(), question: question.index, model: model.value, repeat, answer: text, error, timings: error ? undefined : answer.timings });
					this.sampler.tokens = { read: this.sampler.tokens.read + (answer.timings?.tokensRead ?? 0), written: this.sampler.tokens.written + (answer.timings?.tokensWritten ?? 0) };
					this.report(localize('compareModels.answering', "Answering: {0} of {1} answers, the last by {2}.", answers.length, total, model.label), answers.length, total);
				}
			}
		};
		this.sampler.mark('answer');
		this.report(localize('compareModels.answeringFirst', "Answering: the first answers..."), 0, total);
		const local = models.filter(model => model.local);
		if (local.length) {
			await this.stopAskModel();
		}
		await Promise.all([
			(async () => {
				for (const model of local) {
					await answerAll(model);
					await this.stopServer(model.value.slice(ASK_LOCAL_PREFIX.length));
				}
			})(),
			...models.filter(model => !model.local).map(model => answerAll(model)),
		]);

		// The ratings, and the places of the passages found
		const scores: ICompareRunScore[] = [];
		const unrated: ICompareRunUnrated[] = [];
		const ranks = new Map<number, number>();
		let error: string | undefined;
		const rated = answers.filter(answer => !answer.error && answer.answer);
		if (!token.isCancellationRequested && rated.length) {
			this.sampler.mark('judge');
			this.report(localize('compareModels.startingJulia', "Starting the Julia process of the evaluation..."));
			const byQuestion = new Map(questions.map(question => [question.index, question]));
			const judgedAnswers = rated.map(answer => {
				const question = byQuestion.get(answer.question)!;
				return { id: answer.id, question: question.item.question, passages: question.passages.map(judgedPassage), answer: answer.answer };
			});
			// The rank of each question's passage among those found, by its text as the documents have it now
			const retrieved = questions.filter(question => question.item.context && question.passages.length);
			const matches = await this.askPollisService.matches(retrieved.map(question => question.item.context)).catch(() => undefined);
			const retrieval = retrieved.map((question, index) => ({ id: question.index, context: matches?.[index]?.text ?? question.item.context, passages: question.passages.map(passage => passage.text) }));
			// Two judges on this computer judge one after the other, each in a Julia process of its own, so that each
			// model is alone in memory, its server started only when the other's has stopped
			const rounds = judges.filter(judge => judge.local).length > 1 ? judges.map(judge => [judge]) : [judges];
			const lines: IJuliaLine[] = [];
			let failure: string | undefined;
			for (const [round, roundJudges] of rounds.entries()) {
				if (token.isCancellationRequested) {
					break;
				}
				const answer = await this.runJulia({
					task: 'judge',
					judges: roundJudges.map(judge => this.juliaModel(judge.value)),
					answers: judgedAnswers,
					retrieval: round === 0 ? retrieval : [],
				}, roundJudges.map(judge => judge.value), rounds.length > 1
					? localize('compareModels.judgingBy', "Judging by {0}: {1} of {2} ratings.", roundJudges[0].label, '{0}', '{1}')
					: localize('compareModels.judging', "Judging: {0} of {1} ratings.", '{0}', '{1}'));
				lines.push(...answer.lines ?? []);
				failure ??= answer.error;
			}
			const judged: IJuliaAnswer = { lines, error: failure };
			const labels = new Map(judges.map(judge => [this.juliaModel(judge.value).name, judge.label]));
			for (const line of judged.lines ?? []) {
				if (line.score) {
					const { id: answer, judge, relevance, completeness, clarity, consistency, helpfulness, final_rating, rationale } = line.score;
					scores.push({ answer, judge: labels.get(judge) ?? judge, relevance, completeness, clarity, consistency, helpfulness, final: final_rating, rationale });
				} else if (line.rank) {
					ranks.set(line.rank.id, line.rank.rank ?? 0);
				} else if (typeof line.failed === 'string' && line.judge) {
					unrated.push({ answer: line.failed, judge: labels.get(line.judge) ?? line.judge, error: line.error ?? '' });
				}
			}
			if (judged.error !== undefined) {
				error = juliaError(judged.error);
			} else if (!scores.length) {
				error = localize('compareModels.notJudged', "No answer was rated. {0}", judged.lines?.find(line => line.failed !== undefined)?.error ?? '');
			}
		}

		const run: ICompareRun = {
			summary: {
				id,
				started,
				pollis: this.productService.pollisVersion ?? this.productService.version,
				models,
				judges: judges.map(judge => judge.label),
				repeats,
				questions: questions.length,
			},
			questions: questions.map(question => ranks.has(question.index) ? { ...question, rank: ranks.get(question.index) } : question),
			answers,
			scores,
			unrated,
		};
		if (answers.length) {
			await this.askPollisService.saveRun(run);
		}
		return this.end({ run, error, stopped: token.isCancellationRequested });
	}
}

/** The mean of `values`, or nothing for none. */
function mean(values: readonly number[]): number | undefined {
	return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined;
}

/** The standard deviation of `values`, or nothing for fewer than two. */
function deviation(values: readonly number[]): number | undefined {
	const average = mean(values);
	return values.length < 2 || average === undefined ? undefined : Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1));
}

/** The figures of a model in a run, a row of the Results table. */
export interface ICompareFigures {
	readonly value: string;
	readonly label: string;
	readonly local: boolean;
	readonly size?: string;
	/** The mean rating of each judge, in the order of the run's judges. */
	readonly scores: readonly (number | undefined)[];
	readonly relevance?: number;
	readonly completeness?: number;
	readonly clarity?: number;
	readonly consistency?: number;
	readonly helpfulness?: number;
	readonly notScored: number;
	readonly firstWord?: number;
	readonly seconds?: number;
	readonly reading?: number;
	readonly writing?: number;
	readonly tokensRead?: number;
	readonly tokensWritten?: number;
	/** With Repeats above 1, how much the rating and the seconds of the same question vary, on average. */
	readonly spreadScore?: number;
	readonly spreadSeconds?: number;
}

/** The figures of each model of `run`. */
export function compareFigures(run: ICompareRun): ICompareFigures[] {
	const { judges, repeats } = run.summary;
	const asked = run.questions.filter(question => question.passages.length).length * repeats;
	return run.summary.models.map(model => {
		const answers = run.answers.filter(answer => answer.model === model.value);
		const ids = new Set(answers.map(answer => answer.id));
		const scores = run.scores.filter(score => ids.has(score.answer));
		const part = (key: 'relevance' | 'completeness' | 'clarity' | 'consistency' | 'helpfulness') => mean(scores.map(score => score[key]));
		const timed = answers.map(answer => answer.timings).filter(timings => !!timings);
		const of = (key: 'firstWord' | 'seconds' | 'reading' | 'writing' | 'tokensRead' | 'tokensWritten') => mean(timed.map(timings => timings[key]).filter((value): value is number => typeof value === 'number'));
		// Scored by every judge; the questions not asked, after Stop, are not counted
		const scoredBy = new Map<string, number>();
		for (const score of scores) {
			scoredBy.set(score.answer, (scoredBy.get(score.answer) ?? 0) + 1);
		}
		const scored = answers.filter(answer => (scoredBy.get(answer.id) ?? 0) >= judges.length).length;
		let spreadScore: number | undefined;
		let spreadSeconds: number | undefined;
		if (repeats > 1) {
			const byQuestion = new Map<number, ICompareRunAnswer[]>();
			for (const answer of answers) {
				byQuestion.set(answer.question, [...byQuestion.get(answer.question) ?? [], answer]);
			}
			const firstJudge = judges[0];
			spreadScore = mean([...byQuestion.values()].map(group => deviation(group.map(answer => scores.find(score => score.answer === answer.id && score.judge === firstJudge)?.final).filter((value): value is number => value !== undefined))).filter((value): value is number => value !== undefined));
			spreadSeconds = mean([...byQuestion.values()].map(group => deviation(group.map(answer => answer.timings?.seconds).filter((value): value is number => value !== undefined))).filter((value): value is number => value !== undefined));
		}
		return {
			value: model.value,
			label: model.label,
			local: model.local,
			size: model.size,
			scores: judges.map(judge => mean(scores.filter(score => score.judge === judge).map(score => score.final))),
			relevance: part('relevance'),
			completeness: part('completeness'),
			clarity: part('clarity'),
			consistency: part('consistency'),
			helpfulness: part('helpfulness'),
			notScored: Math.max(0, (answers.length ? Math.max(asked, answers.length) : asked) - scored),
			firstWord: of('firstWord'),
			seconds: of('seconds'),
			reading: of('reading'),
			writing: of('writing'),
			tokensRead: of('tokensRead'),
			tokensWritten: of('tokensWritten'),
			spreadScore,
			spreadSeconds,
		};
	});
}

/** The line of the passages found: of the questions made from a passage, for how many it was among those found, and at what place. */
export function retrievalLine(run: ICompareRun): string {
	const ranked = run.questions.filter(question => question.rank !== undefined);
	if (!ranked.length) {
		return '';
	}
	const found = ranked.filter(question => question.rank! > 0);
	const passages = Math.max(...run.questions.map(question => question.passages.length));
	const place = mean(found.map(question => question.rank!));
	return place === undefined
		? localize('compareModels.retrievalNone', "The right passage among the {0} found for none of the {1} questions.", passages, ranked.length)
		: localize('compareModels.retrieval', "The right passage among the {0} found for {1} of {2} questions, at place {3} on average.", passages, found.length, ranked.length, place.toFixed(1));
}
