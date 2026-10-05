/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2026 Antonio Saragga Seabra
 *  Licensed under the GNU Affero General Public License v3.0 or later. See LICENSE.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Package the Pollis toolbox extensions as .vsix files, for the Toolboxes section of the
// Extensions pane (src/vs/workbench/contrib/extensions/browser/pollisToolboxesView.ts).
//
//   node build/pollis/packageToolboxes.ts
//
// For every toolboxes/<name>/package.json, writes .build/toolboxes/<name>-<version>.vsix and an
// index of them all, .build/toolboxes/toolboxes.json:
//   { "toolboxes": [ { "id", "name", "description", "version", "vsix" } ] }
// The .vsix is the zip that vsce writes (extension.vsixmanifest, [Content_Types].xml and the
// extension's files under extension/), written here so that packaging needs neither vsce nor the
// network. A toolbox has no code, so nothing is compiled and there are no dependencies.
//
// To publish the toolboxes (bump "version" in a toolbox's package.json when it changes, or the
// installed copies are not offered the update):
//   1. node build/pollis/packageToolboxes.ts
//   2. Attach every file in .build/toolboxes (each .vsix and toolboxes.json) to the GitHub release
//      with tag `toolboxes` on saragga/pollis, replacing the files already there. Pollis downloads
//      https://github.com/saragga/pollis/releases/download/toolboxes/toolboxes.json and the .vsix
//      files next to it.

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

const ROOT = path.join(import.meta.dirname, '..', '..');
const TOOLBOXES_DIR = path.join(ROOT, 'toolboxes');
const OUT_DIR = path.join(ROOT, '.build', 'toolboxes');

/** The fields of a toolbox's package.json that packaging reads. */
interface ToolboxManifest {
	readonly name: string;
	readonly displayName?: string;
	readonly description?: string;
	readonly version: string;
	readonly publisher: string;
	readonly license?: string;
	readonly categories?: string[];
	readonly engines?: { readonly vscode?: string };
	readonly repository?: { readonly url?: string };
}

/** One toolbox in toolboxes.json. */
interface ToolboxIndexEntry {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly version: string;
	readonly vsix: string;
}

/** A file of the zip: its path in the zip (forward slashes) and its content. */
interface ZipEntry {
	readonly name: string;
	readonly data: Buffer;
}

const CRC_TABLE = (() => {
	const table = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) {
			c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
		}
		table[n] = c >>> 0;
	}
	return table;
})();

function crc32(data: Buffer): number {
	let crc = 0xFFFFFFFF;
	for (let i = 0; i < data.length; i++) {
		crc = CRC_TABLE[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
	}
	return (crc ^ 0xFFFFFFFF) >>> 0;
}

/** A zip of the entries, deflated (or stored where deflating does not make them smaller). */
function writeZip(entries: readonly ZipEntry[]): Buffer {
	// A fixed date (1 January 2026), so the same files give the same .vsix
	const dosTime = 0;
	const dosDate = ((2026 - 1980) << 9) | (1 << 5) | 1;
	const locals: Buffer[] = [];
	const centrals: Buffer[] = [];
	let offset = 0;
	for (const entry of entries) {
		const name = Buffer.from(entry.name, 'utf-8');
		const deflated = zlib.deflateRawSync(entry.data, { level: 9 });
		const stored = deflated.length >= entry.data.length;
		const content = stored ? entry.data : deflated;
		const method = stored ? 0 : 8;
		const crc = crc32(entry.data);

		const local = Buffer.alloc(30);
		local.writeUInt32LE(0x04034B50, 0);
		local.writeUInt16LE(20, 4); // version needed to extract
		local.writeUInt16LE(0x0800, 6); // file name in UTF-8
		local.writeUInt16LE(method, 8);
		local.writeUInt16LE(dosTime, 10);
		local.writeUInt16LE(dosDate, 12);
		local.writeUInt32LE(crc, 14);
		local.writeUInt32LE(content.length, 18);
		local.writeUInt32LE(entry.data.length, 22);
		local.writeUInt16LE(name.length, 26);
		local.writeUInt16LE(0, 28);
		locals.push(local, name, content);

		const central = Buffer.alloc(46);
		central.writeUInt32LE(0x02014B50, 0);
		central.writeUInt16LE(20, 4); // version made by
		central.writeUInt16LE(20, 6);
		central.writeUInt16LE(0x0800, 8);
		central.writeUInt16LE(method, 10);
		central.writeUInt16LE(dosTime, 12);
		central.writeUInt16LE(dosDate, 14);
		central.writeUInt32LE(crc, 16);
		central.writeUInt32LE(content.length, 20);
		central.writeUInt32LE(entry.data.length, 24);
		central.writeUInt16LE(name.length, 28);
		central.writeUInt32LE(offset, 42);
		centrals.push(central, name);

		offset += local.length + name.length + content.length;
	}
	const centralDirectory = Buffer.concat(centrals);
	const end = Buffer.alloc(22);
	end.writeUInt32LE(0x06054B50, 0);
	end.writeUInt16LE(entries.length, 8);
	end.writeUInt16LE(entries.length, 10);
	end.writeUInt32LE(centralDirectory.length, 12);
	end.writeUInt32LE(offset, 16);
	return Buffer.concat([...locals, centralDirectory, end]);
}

/** The files of a folder, relative to it with forward slashes, sorted; dot files are left out. */
function listFiles(folder: string, prefix = ''): string[] {
	const files: string[] = [];
	for (const entry of fs.readdirSync(path.join(folder, prefix), { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
		if (entry.name.startsWith('.')) {
			continue;
		}
		const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
		if (entry.isDirectory()) {
			files.push(...listFiles(folder, relative));
		} else if (entry.isFile()) {
			files.push(relative);
		}
	}
	return files;
}

function escapeXml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

const CONTENT_TYPES: Record<string, string> = {
	'.json': 'application/json',
	'.vsixmanifest': 'text/xml',
	'.md': 'text/markdown',
	'.toml': 'text/plain',
	'.ipynb': 'application/x-ipynb+json',
	'.txt': 'text/plain',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
};

function contentTypesXml(names: readonly string[]): string {
	const extensions = [...new Set(names.map(name => path.posix.extname(name).toLowerCase()).filter(ext => ext))].sort();
	const defaults = extensions.map(ext => `<Default Extension="${escapeXml(ext)}" ContentType="${CONTENT_TYPES[ext] ?? 'application/octet-stream'}"/>`);
	return `<?xml version="1.0" encoding="utf-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">${defaults.join('')}</Types>\n`;
}

function vsixManifestXml(manifest: ToolboxManifest): string {
	const repository = manifest.repository?.url ?? '';
	const properties = [
		['Microsoft.VisualStudio.Code.Engine', manifest.engines?.vscode ?? '*'],
		['Microsoft.VisualStudio.Code.ExtensionDependencies', ''],
		['Microsoft.VisualStudio.Code.ExtensionPack', ''],
		['Microsoft.VisualStudio.Code.ExtensionKind', 'workspace'],
		['Microsoft.VisualStudio.Code.LocalizedLanguages', ''],
		...(repository ? [
			['Microsoft.VisualStudio.Services.Links.Source', repository],
			['Microsoft.VisualStudio.Services.Links.GitHub', repository],
		] : []),
	].map(([id, value]) => `\t\t\t<Property Id="${id}" Value="${escapeXml(value)}" />`);
	return [
		'<?xml version="1.0" encoding="utf-8"?>',
		'<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">',
		'\t<Metadata>',
		`\t\t<Identity Language="en-US" Id="${escapeXml(manifest.name)}" Version="${escapeXml(manifest.version)}" Publisher="${escapeXml(manifest.publisher)}" />`,
		`\t\t<DisplayName>${escapeXml(manifest.displayName ?? manifest.name)}</DisplayName>`,
		`\t\t<Description xml:space="preserve">${escapeXml(manifest.description ?? '')}</Description>`,
		'\t\t<Tags></Tags>',
		`\t\t<Categories>${escapeXml((manifest.categories ?? []).join(','))}</Categories>`,
		'\t\t<GalleryFlags>Public</GalleryFlags>',
		'\t\t<Properties>',
		...properties,
		'\t\t</Properties>',
		'\t</Metadata>',
		'\t<Installation>',
		'\t\t<InstallationTarget Id="Microsoft.VisualStudio.Code"/>',
		'\t</Installation>',
		'\t<Dependencies/>',
		'\t<Assets>',
		'\t\t<Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />',
		'\t</Assets>',
		'</PackageManifest>',
		'',
	].join('\n');
}

/** Writes the .vsix of the toolbox in `folder` and returns its index entry. */
function packageToolbox(folder: string): ToolboxIndexEntry {
	const manifest: ToolboxManifest = JSON.parse(fs.readFileSync(path.join(folder, 'package.json'), 'utf-8'));
	if (!manifest.name || !manifest.publisher || !manifest.version) {
		throw new Error(`${path.relative(ROOT, folder)}/package.json needs a name, a publisher and a version`);
	}
	const files = listFiles(folder);
	const entries: ZipEntry[] = [
		{ name: 'extension.vsixmanifest', data: Buffer.from(vsixManifestXml(manifest), 'utf-8') },
		{ name: '[Content_Types].xml', data: Buffer.from(contentTypesXml(['extension.vsixmanifest', ...files]), 'utf-8') },
		...files.map(file => ({ name: `extension/${file}`, data: fs.readFileSync(path.join(folder, file)) })),
	];
	const vsix = `${manifest.name}-${manifest.version}.vsix`;
	fs.writeFileSync(path.join(OUT_DIR, vsix), writeZip(entries));
	console.log(`${vsix}: ${files.length} files`);
	return {
		id: `${manifest.publisher}.${manifest.name}`,
		name: manifest.displayName ?? manifest.name,
		description: manifest.description ?? '',
		version: manifest.version,
		vsix,
	};
}

function main(): void {
	fs.rmSync(OUT_DIR, { recursive: true, force: true });
	fs.mkdirSync(OUT_DIR, { recursive: true });

	const folders = fs.readdirSync(TOOLBOXES_DIR, { withFileTypes: true })
		.filter(entry => entry.isDirectory() && fs.existsSync(path.join(TOOLBOXES_DIR, entry.name, 'package.json')))
		.map(entry => path.join(TOOLBOXES_DIR, entry.name))
		.sort();
	const toolboxes = folders.map(folder => packageToolbox(folder));
	fs.writeFileSync(path.join(OUT_DIR, 'toolboxes.json'), JSON.stringify({ toolboxes }, null, '\t') + '\n', 'utf-8');
	console.log(`${toolboxes.length} toolboxes written to ${path.relative(ROOT, OUT_DIR)}/ (the .vsix files and toolboxes.json)`);
	console.log('Attach every file there to the GitHub release with tag `toolboxes` on saragga/pollis.');
}

main();
