import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {valid} from 'semver';
import type {HttpError, Package, Version} from './npm.js';
import type {PackageService} from './package-service.js';

export const getPackagePath = (packageName: string) =>
  path.resolve('fixtures', packageName);

export const getPackageMetadataPath = (packageName: string) =>
  path.resolve(getPackagePath(packageName), 'doc.json');

export const getPackageVersionPath = (packageName: string, version: string) =>
  path.resolve(getPackagePath(packageName), version);

export const getPackageFilePath = (
  packageName: string,
  version: string,
  filePath: string,
) =>
  path.resolve(
    getPackageVersionPath(packageName, version),
    'package',
    filePath,
  );

export const getPackageJsonPath = (packageName: string, version: string) =>
  getPackageFilePath(packageName, version, 'package.json');

export class LocalPackageService implements PackageService {
  /**
   * Fetch package metadata from the npm registry.
   *
   * See https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
   */
  async getPackageMetadata(packageName: string): Promise<Package> {
    const metadataPath = getPackageMetadataPath(packageName);
    const source = await readFile(metadataPath, 'utf-8');
    return JSON.parse(source);
  }

  async getPackageVersionMetadata(
    packageName: string,
    version: string,
  ): Promise<Version> {
    // console.log('getPackageVersionMetadata', packageName, version);
    // If the request version is a dist tag, get the actual version from the
    // package metadata.
    if (!valid(version)) {
      const metadata = await this.getPackageMetadata(packageName);
      if (metadata === undefined) {
        // TODO: return a problem instead, and store in DB
        throw new Error(`Package not found: ${packageName}`);
      }
      const distTags = metadata['dist-tags'];
      const tagVersion = distTags[version];
      if (tagVersion === undefined) {
        throw new Error(`Version not found: ${version}`);
      }
      version = tagVersion;
    }
    const packageJsonPath = getPackageJsonPath(packageName, version);
    // console.log('packageJsonPath', packageJsonPath);
    const source = await readFile(packageJsonPath, 'utf-8');
    return JSON.parse(source);
  }

  async getFile(
    packageName: string,
    version: string,
    filePath: string,
  ): Promise<string> {
    const locaPath = getPackageFilePath(packageName, version, filePath);
    try {
      return await readFile(locaPath, 'utf-8');
    } catch (e) {
      // console.log('error', (e as any).constructor.name, (e as any).code, e);
      if ((e as Error & {code: string}).code === 'ENOENT') {
        const httpError = new Error(`File not found: ${locaPath}`);
        (httpError as HttpError).statusCode = 404;
        throw httpError;
      }
      throw e;
    }
  }
}
