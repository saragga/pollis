/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../nls.js';
import { IProductService } from '../../product/common/productService.js';

export function createNativeAboutDialogDetails(productService: IProductService): { title: string; details: string; detailsToCopy: string } {
	const buildDate = productService.date
		? new Date(productService.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
		: 'Unknown';

	const poweredBy = productService.poweredBy;
	const poweredByLines = [
		localize('poweredByHeader', "Powered by"),
		localize('poweredByGemma', "· AI: Gemma {0}", poweredBy?.gemma ?? 'Unknown'),
		localize('poweredByJulia', "· Analytics: Julia {0}", poweredBy?.julia ?? 'Unknown'),
		localize('poweredByDatabases', "· Databases: DuckDB {0}, LanceDB {1}", poweredBy?.duckdb ?? 'Unknown', poweredBy?.lancedb ?? 'Unknown'),
		localize('poweredByCodeOSS', "· Platform: Code OSS {0}", poweredBy?.codeoss ?? productService.version),
	].join('\n');

	const copyrightYear = productService.date ? new Date(productService.date).getFullYear() : new Date().getFullYear();

	const legalLines: string[] = [];
	if (productService.licenseUrl) {
		legalLines.push(localize('aboutLicense', "License: {0}", productService.licenseUrl));
	}
	if (productService.privacyStatementUrl) {
		legalLines.push(localize('aboutPrivacy', "Privacy: {0}", productService.privacyStatementUrl));
	}

	const details = [
		localize('aboutVersion', "Version: {0}", productService.pollisVersion ?? productService.version),
		localize('aboutBuildDate', "Build Date: {0}", buildDate),
		// allow-any-unicode-next-line
		localize('aboutCopyright', "© {0} Antonio Saragga Seabra", copyrightYear),
		'',
		poweredByLines,
		...(legalLines.length ? ['', ...legalLines] : []),
	].join('\n');

	return {
		title: productService.nameLong,
		details: details,
		detailsToCopy: details
	};
}
