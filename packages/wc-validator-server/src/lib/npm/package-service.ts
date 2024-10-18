import type {Package, Version} from './npm.js';

/**
 * An object that can fetch npm package metadata and files.
 */

export interface PackageService {
  /**
   * Fetch package metadata from the npm registry.
   *
   * The response must be compatible with the npm registry Package Metadata
   * API: https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
   *
   * If a package is not found, the returned Promise must reject with an
   * HttpError with status 404.
   */
  getPackageMetadata(packageName: string): Promise<Package>;

  /**
   * Fetch package metadata for a specific version from the npm registry.
   */
  getPackageVersionMetadata(
    packageName: string,
    version: string,
  ): Promise<Version>;

  /**
   * Fetch a file from a package.
   *
   * The returned Promise must reject with an HttpError with status 404 if the
   * file is not found.
   */
  getFile(packageName: string, version: string, path: string): Promise<string>;
}
