/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antonio Saragga Seabra. All rights reserved.
 *  Proprietary and confidential. Unauthorised copying or distribution is prohibited.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { INotebookService } from '../../notebook/common/notebookService.js';
import { INotebookKernelService } from '../../notebook/common/notebookKernelService.js';
import { NotebookTextModel } from '../../notebook/common/model/notebookTextModel.js';
import { CellKind, CellEditType, ICellEditOperation } from '../../notebook/common/notebookCommon.js';
import { autoSelectJuliaKernel } from './handlers/model.handler.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';

/**
 * Makes Julia the default kernel for Jupyter notebooks in Pollis: whenever a notebook opens
 * with no kernel already selected, auto-select the Julia kernel (same helper used by the
 * webview "Send to Notebook" action). An explicit prior selection is left untouched.
 */
class JuliaDefaultNotebookKernel extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'pollis.juliaDefaultNotebookKernel';

	constructor(
		@INotebookService notebookService: INotebookService,
		@INotebookKernelService notebookKernelService: INotebookKernelService,
		@IModelService modelService: IModelService,
		@ILanguageService languageService: ILanguageService,
	) {
		super();

		const setCellsToJulia = (notebook: NotebookTextModel) => {
			if (notebook.uri.scheme !== Schemas.untitled) { return; }
			const juliaLanguageSelection = languageService.createById('julia');
			const edits: ICellEditOperation[] = [];
			notebook.cells.forEach((cell, index) => {
				if (cell.cellKind === CellKind.Code && cell.language !== 'julia') {
					edits.push({ editType: CellEditType.CellLanguage, index, language: 'julia' });
					// Also update the open text model so the editor reflects the change immediately.
					const textModel = modelService.getModel(cell.uri);
					textModel?.setLanguage(juliaLanguageSelection);
				}
			});
			if (edits.length) {
				notebook.applyEdits(edits, true, undefined, () => undefined, undefined, false);
			}
		};

		const maybeSelectJulia = (notebook: NotebookTextModel) => {
			if (notebook.viewType !== 'jupyter-notebook') { return; }
			if (notebookKernelService.getMatchingKernel(notebook).selected) {
				// Kernel already selected — still ensure untitled cells are Julia.
				setCellsToJulia(notebook);
				return;
			}
			autoSelectJuliaKernel(notebook, notebookKernelService);
		};

		// After kernel selection, switch untitled notebook cells to Julia.
		this._register(notebookKernelService.onDidChangeSelectedNotebooks(({ notebook }) => {
			const model = notebookService.getNotebookTextModel(notebook);
			if (model?.viewType === 'jupyter-notebook') {
				setCellsToJulia(model);
			}
		}));

		for (const notebook of notebookService.getNotebookTextModels()) {
			maybeSelectJulia(notebook);
		}
		this._register(notebookService.onDidAddNotebookDocument(maybeSelectJulia));
	}
}

registerWorkbenchContribution2(JuliaDefaultNotebookKernel.ID, JuliaDefaultNotebookKernel, WorkbenchPhase.AfterRestored);
