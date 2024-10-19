/**
 * @fileoverview
 *
 * Fetches a package tarball from npm and extracts it to the local filesystem
 * for local development.
 */

import {mkdir, writeFile} from 'node:fs/promises';
import {parseArgs} from 'node:util';
import npmFetch from 'npm-registry-fetch';
import {valid} from 'semver';
import {extract} from 'tar';
import {
  getPackageMetadataPath,
  getPackagePath,
  getPackageVersionPath,
} from '../lib/npm/local-package-service.js';
import {parseSpecifier} from '../lib/npm/npm.js';

const {positionals} = parseArgs({allowPositionals: true});

const packageNameAndVersion = positionals[0];
if (packageNameAndVersion === undefined) {
  console.error('No package name given');
  process.exit(1);
}

const npmLocation = parseSpecifier(packageNameAndVersion);
if (npmLocation === undefined) {
  console.error(`Invalid package name: ${packageNameAndVersion}`);
  process.exit(1);
}

if (npmLocation.path !== '') {
  console.error(`Invalid package name: ${packageNameAndVersion}`);
  process.exit(1);
}

const packageName = npmLocation.pkg;
let {version} = npmLocation;

// Fetch package metadata
const response = await npmFetch(`/${packageName}`);
const metadataSource = await response.text();
const metadataPath = getPackageMetadataPath(packageName);
await mkdir(getPackagePath(packageName), {recursive: true});
await writeFile(metadataPath, metadataSource);
const metadata = JSON.parse(metadataSource);

// Determine version
if (version === undefined || !valid(version)) {
  const tagVersion = metadata['dist-tags'][npmLocation.version ?? 'latest'];
  if (tagVersion === undefined) {
    throw new Error(`Version not found: ${version}`);
  }
  version = tagVersion as string;
}

// Fetch tarball
const packageVersionDoc = metadata.versions[version];
const dist = packageVersionDoc.dist;
const tarballUrl = dist.tarball;
console.log('tarballUrl', tarballUrl);
const tarball = await npmFetch(tarballUrl);
console.log('tarball', tarball.ok, tarball.size);
await mkdir(getPackageVersionPath(packageName, version), {recursive: true});
const stream = extract({
  cwd: getPackageVersionPath(packageName, version),
});
tarball.body.pipe(stream);
