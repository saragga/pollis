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
// index of them all, .build/toolboxes/toolboxes.json, and a copy of each toolbox's README.md,
// .build/toolboxes/<name>-README.md, which Pollis shows before the toolbox is installed (both
// READMEs, this one and the one in the .vsix, get the version on the line below their title):
//   { "toolboxes": [ { "id", "name", "description", "author", "version", "vsix", "readme" } ] }
// The .vsix is the zip that vsce writes (extension.vsixmanifest, [Content_Types].xml and the
// extension's files under extension/), written here so that packaging needs neither vsce nor the
// network. A toolbox has no code, so nothing is compiled and there are no dependencies.
//
// To publish the toolboxes (bump "version" in a toolbox's package.json when it changes, or the
// installed copies are not offered the update):
//   1. node build/pollis/packageToolboxes.ts
//   2. Replace the files of the branch toolboxes-dist of saragga/pollis (one commit, no history
//      kept) by every file in .build/toolboxes (each .vsix and README, and toolboxes.json):
//        git worktree add --detach /tmp/toolboxes-dist && cd /tmp/toolboxes-dist
//        git checkout --orphan toolboxes-dist-new && git rm -rfq . && cp <repo>/.build/toolboxes/* .
//        git add -A && git commit --no-verify -m "Toolboxes" && git push -f origin HEAD:toolboxes-dist
//        cd <repo> && git worktree remove /tmp/toolboxes-dist && git branch -D toolboxes-dist-new
//      Pollis downloads https://raw.githubusercontent.com/saragga/pollis/toolboxes-dist/toolboxes.json
//      and the .vsix files next to it (raw.githubusercontent.com allows the cross-origin requests
//      that GitHub release downloads refuse). raw.githubusercontent.com caches for up to 5 minutes.

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
	/** Shown as the publisher in the Toolboxes section and on the installed extension. */
	readonly author?: string | { readonly name?: string };
	readonly license?: string;
	readonly categories?: string[];
	readonly engines?: { readonly vscode?: string };
	readonly repository?: { readonly url?: string };
	/** The icon, relative to the extension folder. */
	readonly icon?: string;
}

/** One toolbox in toolboxes.json. */
interface ToolboxIndexEntry {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly author?: string;
	readonly version: string;
	readonly vsix: string;
	/** The toolbox's README.md, published as `<name>-README.md`; absent when it has none. */
	readonly readme?: string;
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

function vsixManifestXml(manifest: ToolboxManifest, hasReadme: boolean): string {
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
		...(hasReadme ? ['\t\t<Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true" />'] : []),
		...(manifest.icon ? [`\t\t<Asset Type="Microsoft.VisualStudio.Services.Icons.Default" Path="extension/${escapeXml(manifest.icon)}" Addressable="true" />`] : []),
		'\t</Assets>',
		'</PackageManifest>',
		'',
	].join('\n');
}

/** The README with the version on the line below its title, so it is always the packaged one. */
function readmeWithVersion(readme: string, version: string): string {
	return readme.replace(/^(#[^\n]*\n)/, `$1\nVersion ${version}\n`);
}

/** Writes the .vsix of the toolbox in `folder` and returns its index entry. */
function packageToolbox(folder: string): ToolboxIndexEntry {
	const manifest: ToolboxManifest = JSON.parse(fs.readFileSync(path.join(folder, 'package.json'), 'utf-8'));
	if (!manifest.name || !manifest.publisher || !manifest.version) {
		throw new Error(`${path.relative(ROOT, folder)}/package.json needs a name, a publisher and a version`);
	}
	const files = listFiles(folder);
	if (manifest.icon && !files.includes(manifest.icon)) {
		throw new Error(`${path.relative(ROOT, folder)}/package.json names the icon ${manifest.icon}, which does not exist`);
	}
	const hasReadme = files.includes('README.md');
	const entries: ZipEntry[] = [
		{ name: 'extension.vsixmanifest', data: Buffer.from(vsixManifestXml(manifest, hasReadme), 'utf-8') },
		{ name: '[Content_Types].xml', data: Buffer.from(contentTypesXml(['extension.vsixmanifest', ...files]), 'utf-8') },
		...files.map(file => ({
			name: `extension/${file}`,
			data: file === 'README.md'
				? Buffer.from(readmeWithVersion(fs.readFileSync(path.join(folder, file), 'utf-8'), manifest.version), 'utf-8')
				: fs.readFileSync(path.join(folder, file)),
		})),
	];
	const vsix = `${manifest.name}-${manifest.version}.vsix`;
	fs.writeFileSync(path.join(OUT_DIR, vsix), writeZip(entries));
	console.log(`${vsix}: ${files.length} files`);
	const readme = hasReadme ? `${manifest.name}-README.md` : undefined;
	if (readme) {
		fs.writeFileSync(path.join(OUT_DIR, readme), readmeWithVersion(fs.readFileSync(path.join(folder, 'README.md'), 'utf-8'), manifest.version), 'utf-8');
	}
	return {
		id: `${manifest.publisher}.${manifest.name}`,
		name: manifest.displayName ?? manifest.name,
		description: manifest.description ?? '',
		author: authorName(manifest.author),
		version: manifest.version,
		vsix,
		readme,
	};
}

/** The author's name: a package.json author is "Name <email> (url)" or { "name" }. */
function authorName(author: ToolboxManifest['author']): string | undefined {
	const name = typeof author === 'string' ? author.replace(/\s*[<(].*$/, '').trim() : author?.name?.trim();
	return name || undefined;
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
	console.log(`${toolboxes.length} toolboxes written to ${path.relative(ROOT, OUT_DIR)}/ (the .vsix files, the READMEs and toolboxes.json)`);
	console.log('Publish every file there to the branch toolboxes-dist of saragga/pollis (see the steps at the top of this script).');
}

main();
