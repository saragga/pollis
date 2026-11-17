/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../../nls.js';
import { MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { TOOLBOX_END_GROUP } from '../common/toolboxPanels.js';

/** The command of every item of a coming-soon toolbox: the items are greyed out, so it is never run. */
const COMING_SOON_COMMAND = 'pollis.toolboxes.comingSoon';

/** Coming-soon toolboxes sit at the end of Extend, below the installed ones. */
const COMING_SOON_GROUP = `${TOOLBOX_END_GROUP}_comingSoon`;

CommandsRegistry.registerCommand(COMING_SOON_COMMAND, () => { });

// Extend is always in the menu bar: it holds the coming-soon toolboxes even when no toolbox is installed
MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
	submenu: MenuId.MenubarExtendMenu,
	title: {
		value: localize('extendMenu', "Extend"),
		original: 'Extend',
		mnemonicTitle: localize({ key: 'mExtend', comment: ['&& denotes a mnemonic'] }, "E&&xtend")
	},
	order: 9
});

/** Adds the greyed-out items of a coming-soon menu, one group after another. */
function appendComingSoonItems(menu: MenuId, groups: readonly (readonly string[])[]): void {
	groups.forEach((titles, groupIndex) => {
		titles.forEach((title, index) => {
			MenuRegistry.appendMenuItem(menu, {
				group: `${groupIndex + 1}_comingSoon`,
				command: { id: COMING_SOON_COMMAND, precondition: ContextKeyExpr.false(), title },
				order: index + 1
			});
		});
	});
}

// Geoscience Toolbox: Climate Science, Earth System Modelling

const GEOSCIENCE_MENU = new MenuId('pollisComingSoon.geoscience');

MenuRegistry.appendMenuItem(MenuId.MenubarExtendMenu, {
	submenu: GEOSCIENCE_MENU,
	title: localize('comingSoon.geoscience', "Geoscience Toolbox (Coming Soon)"),
	group: COMING_SOON_GROUP,
	order: 1
});

appendComingSoonItems(GEOSCIENCE_MENU, [
	[
		localize('comingSoon.geoscience.climateData', "Climate Data Access and Download"),
		localize('comingSoon.geoscience.atmosphere', "Atmospheric Analysis"),
		localize('comingSoon.geoscience.ocean', "Ocean and Sea Surface Analysis"),
		localize('comingSoon.geoscience.indices', "Climate Indices and Teleconnections"),
		localize('comingSoon.geoscience.extremes', "Extreme Weather Event Analysis"),
		localize('comingSoon.geoscience.projections', "Climate Change Projections"),
	],
	[
		localize('comingSoon.geoscience.oceanModel', "Ocean Circulation Modelling"),
		localize('comingSoon.geoscience.atmosphereModel', "Atmospheric Modelling"),
		localize('comingSoon.geoscience.landModel', "Land Surface Modelling"),
		localize('comingSoon.geoscience.iceModel', "Ice Sheet and Glacier Modelling"),
		localize('comingSoon.geoscience.carbon', "Carbon Cycle and Biogeochemistry"),
		localize('comingSoon.geoscience.coupled', "Coupled Earth System Simulation"),
	],
]);

// Smart Regions Toolbox

const SMART_REGIONS_MENU = new MenuId('pollisComingSoon.smartRegions');
const SMART_CITIES_MENU = new MenuId('pollisComingSoon.smartRegions.smartCities');
const SMART_RURAL_AREAS_MENU = new MenuId('pollisComingSoon.smartRegions.smartRuralAreas');
const SMART_REGIONS_FILES_MENU = new MenuId('pollisComingSoon.smartRegions.accessFiles');
const SMART_REGIONS_LIBRARIES_MENU = new MenuId('pollisComingSoon.smartRegions.accessDataLibraries');
const SMART_REGIONS_MAPS_MENU = new MenuId('pollisComingSoon.smartRegions.mapVisualisation');

MenuRegistry.appendMenuItem(MenuId.MenubarExtendMenu, {
	submenu: SMART_REGIONS_MENU,
	title: localize('comingSoon.smartRegions', "Smart Regions Toolbox (Coming Soon)"),
	group: COMING_SOON_GROUP,
	order: 2
});

// Access Files and Access Data Libraries of the toolbox's own, not in Explore: the user may move their items to any menu from the toolbox's Edit button
MenuRegistry.appendMenuItem(SMART_REGIONS_MENU, {
	submenu: SMART_REGIONS_FILES_MENU,
	title: localize('comingSoon.smartRegions.accessFiles', "Access Files"),
	group: '0_comingSoon',
	order: 1
});

MenuRegistry.appendMenuItem(SMART_REGIONS_MENU, {
	submenu: SMART_REGIONS_LIBRARIES_MENU,
	title: localize('comingSoon.smartRegions.accessDataLibraries', "Access Data Libraries"),
	group: '0_comingSoon',
	order: 2
});

appendComingSoonItems(SMART_REGIONS_FILES_MENU, [
	[
		localize('comingSoon.smartRegions.geojson', "GeoJSON Files"),
		localize('comingSoon.smartRegions.geopackage', "GeoPackage Files"),
		localize('comingSoon.smartRegions.shapefiles', "Shapefiles"),
		localize('comingSoon.smartRegions.geoparquet', "GeoParquet and FlatGeobuf Files"),
		localize('comingSoon.smartRegions.kml', "KML and KMZ Files"),
		localize('comingSoon.smartRegions.gpx', "GPX Files"),
	],
	[
		localize('comingSoon.smartRegions.geotiff', "GeoTIFF Files"),
		localize('comingSoon.smartRegions.lasLaz', "LAS and LAZ Files"),
	],
	[
		localize('comingSoon.smartRegions.cityModels', "CityGML and CityJSON Files"),
		localize('comingSoon.smartRegions.gtfs', "GTFS Feeds"),
		localize('comingSoon.smartRegions.osmPbf', "OpenStreetMap PBF Files"),
	],
]);

appendComingSoonItems(SMART_REGIONS_LIBRARIES_MENU, [
	[
		localize('comingSoon.smartRegions.openStreetMap', "OpenStreetMap"),
		localize('comingSoon.smartRegions.overture', "Overture Maps"),
		localize('comingSoon.smartRegions.gisco', "Eurostat GISCO (NUTS Regions)"),
	],
	[
		localize('comingSoon.smartRegions.copernicus', "Copernicus Data Space"),
		localize('comingSoon.smartRegions.earthExplorer', "USGS EarthExplorer"),
		localize('comingSoon.smartRegions.dgtLidar', "DGT Lidar (Portugal)"),
	],
	[
		localize('comingSoon.smartRegions.mapillary', "Mapillary Street-Level Imagery"),
	],
]);

// Map Visualisation: the open sources first, whose data may also be analysed; Google Maps and Google's Photorealistic 3D Tiles may be displayed, with their attributions, but not analysed
MenuRegistry.appendMenuItem(SMART_REGIONS_MENU, {
	submenu: SMART_REGIONS_MAPS_MENU,
	title: localize('comingSoon.smartRegions.maps', "Map Visualisation"),
	group: '1_comingSoon',
	order: 0
});

appendComingSoonItems(SMART_REGIONS_MAPS_MENU, [
	[
		localize('comingSoon.smartRegions.osmBaseMaps', "OpenStreetMap Base Maps"),
		localize('comingSoon.smartRegions.copernicusLayers', "Copernicus Imagery Layers"),
		localize('comingSoon.smartRegions.mapillaryViewer', "Mapillary Street-Level Viewer"),
	],
	[
		localize('comingSoon.smartRegions.googleMaps', "Google Maps"),
		localize('comingSoon.smartRegions.google3dTiles', "Google Photorealistic 3D Tiles"),
	],
]);

appendComingSoonItems(SMART_REGIONS_MENU, [
	[
		localize('comingSoon.smartRegions.projections', "Coordinate Transformations and Projections"),
		localize('comingSoon.smartRegions.indexing', "Spatial Indexing"),
	],
	[
		localize('comingSoon.smartRegions.kriging', "Spatial Statistics and Kriging"),
		localize('comingSoon.smartRegions.econometrics', "Spatial Econometrics"),
		localize('comingSoon.smartRegions.raster', "Raster Analysis"),
		localize('comingSoon.smartRegions.networks', "Route and Network Analysis"),
	],
	[
		localize('comingSoon.smartRegions.remoteSensing', "Remote Sensing"),
		localize('comingSoon.smartRegions.pointClouds', "Point Cloud Processing"),
		localize('comingSoon.smartRegions.terrain', "Terrain and Elevation Analysis"),
	],
]);

MenuRegistry.appendMenuItem(SMART_REGIONS_MENU, {
	submenu: SMART_CITIES_MENU,
	title: localize('comingSoon.smartCities', "Smart Cities"),
	group: '4_comingSoon',
	order: 1
});

MenuRegistry.appendMenuItem(SMART_REGIONS_MENU, {
	submenu: SMART_RURAL_AREAS_MENU,
	title: localize('comingSoon.smartRuralAreas', "Smart Rural Areas"),
	group: '4_comingSoon',
	order: 2
});

appendComingSoonItems(SMART_CITIES_MENU, [[
	localize('comingSoon.smartCities.mobility', "Urban Mobility and Traffic"),
	localize('comingSoon.smartCities.buildings', "Buildings and Energy"),
	localize('comingSoon.smartCities.airQuality', "Air Quality"),
	localize('comingSoon.smartCities.heatIslands', "Urban Heat Islands"),
	localize('comingSoon.smartCities.landUse', "Land Use and Zoning"),
	localize('comingSoon.smartCities.publicServices', "Access to Public Services"),
]]);

appendComingSoonItems(SMART_RURAL_AREAS_MENU, [[
	localize('comingSoon.smartRuralAreas.agriculture', "Precision Agriculture"),
	localize('comingSoon.smartRuralAreas.water', "Water Resources and Irrigation"),
	localize('comingSoon.smartRuralAreas.accessibility', "Rural Accessibility and Connectivity"),
	localize('comingSoon.smartRuralAreas.landCover', "Land Cover Change"),
	localize('comingSoon.smartRuralAreas.renewables', "Renewable Energy Siting"),
	localize('comingSoon.smartRuralAreas.hazards', "Natural Hazards"),
]]);
