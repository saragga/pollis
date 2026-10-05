/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../../vs/nls.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import './toolboxExtensions.js';

// The Analytics Toolbox comes from its extension (extensions/pollis-toolbox-analytics), see toolboxExtensions.ts
// The Economics and Econometrics Toolboxes come from their extensions (extensions/pollis-toolbox-economics, extensions/pollis-toolbox-econometrics);
// Game Theory is in the Optimise menu

// Epidemiology Toolbox hidden for now: uncomment its three blocks to restore it.
/*
// Define a new submenu ID for "Epidemiology Toolbox"
const E_CMTSubmenuId = new MenuId('menubarE_CMTSubmenu');
*/


// ------------------- TOOLBOXES ------------------------

// Domain-specific toolboxes live in their own top-level menu, separate from
// Explore (which is organized by action, not by domain).
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
	submenu: MenuId.MenubarToolboxesMenu,
	title: {
		value: 'Toolboxes',
		original: 'Toolboxes',
		mnemonicTitle: localize({ key: 'mToolboxes', comment: ['&& denotes a mnemonic'] }, "&&Toolboxes")
	},
	order: 9.5
});

/*
// Epidemiology Toolbox
MenuRegistry.appendMenuItem(MenuId.MenubarToolboxesMenu, {
	group: '3_toolboxes',
	submenu: E_CMTSubmenuId,
	title: localize('showStatistics.ept', 'Epidemiology Toolbox'),
	order: 1,
});
*/






/*
// ===================================================
// SUBMENU: Epidemiology
// ===================================================

MenuRegistry.appendMenuItem(E_CMTSubmenuId, {
	group: '1_ect',
	command: { id: 'chiara.statistics.cest', title: localize('ect.cest', 'Epidemiological Inference') },
	order: 1,
}); // Pathogen.jl, Rt-without-renewal

MenuRegistry.appendMenuItem(E_CMTSubmenuId, {
	group: '2_ect',
	command: { id: 'chiara.simulate.epi-comp', title: localize('ect.epi-comp', 'Compartmental Models') },
	order: 2,
}); // DifferentialEquations.jl

MenuRegistry.appendMenuItem(E_CMTSubmenuId, {
	group: '2_ect',
	command: { id: 'chiara.simulate.epi-ude', title: localize('ect.epi-ude', 'Universal Differential Equations for Epidemiology') },
	order: 3,
}); // DiffEqFlux.jl, Lux.jl
*/
