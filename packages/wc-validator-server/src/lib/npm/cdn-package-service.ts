import npmFetch from 'npm-registry-fetch';
import type {Package, Version} from './npm.js';
import type {PackageService} from './package-service.js';

/**
 * An implementation of NpmPackageService that fetches metadata from the npm
 * registry and files from the an npm CDN.
 */
export class CdnPackageService implements PackageService {
  readonly cdnPrefix: string;

  constructor(cdnPrefix: string) {
    this.cdnPrefix = cdnPrefix;
  }

  getPackageMetadata(packageName: string): Promise<Package> {
    return npmFetch.json(
      `/${packageName}`,
    ) as Promise<unknown> as Promise<Package>;
  }

  getPackageVersionMetadata(
    packageName: string,
    version: string,
  ): Promise<Version> {
    return npmFetch.json(
      `/${packageName}/${version}`,
    ) as Promise<unknown> as Promise<Version>;
  }

  async getFile(
    packageName: string,
    version: string,
    path: string,
  ): Promise<string> {
    const cdnUrl = this.cdnPrefix + `${packageName}@${version}/${path}`;
    const response = await fetch(cdnUrl);
    return response.text();
  }
}
