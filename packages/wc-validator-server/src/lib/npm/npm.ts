export interface NpmFileReference {
  pkg: string;
  version?: string | undefined;
  path: string;
}

const specifierRegex = /^((?:@[^/@]+\/)?[^/@]+)(?:@([^/]+))?\/?(.*)$/;

/**
 * Parses an import specifier that's in the format "<pkg>[@<version>][/<path>]"
 */
export const parseSpecifier = (
  specifier: string,
): NpmFileReference | undefined => {
  const match = specifier.match(specifierRegex);
  if (match === null) {
    return undefined;
  }
  const [, pkg, version, path] = match;
  return {pkg, version, path};
};

export interface HttpError extends Error {
  statusCode: number;
}

/**
 * npm package metadata as returned from the npm registry
 * https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md
 *
 * TODO (justinfagnani): can we get this interface from somewhere canonical?
 */
export interface Package {
  name: string;
  description?: string;
  'dist-tags': {[tag: string]: string};
  versions: {[tag: string]: Version};
  time: {
    modified: string;
    created: string;
    [version: string]: string;
  };
}

export interface Version {
  name: string;
  version: string;
  description?: string;
  dist: Dist;
  type?: 'module' | 'commonjs';
  main?: string;
  module?: string;

  author?: {name: string};
  homepage?: string;
  keywords?: string[];

  repository?: {
    type: 'git' | 'svn';
    url: string;
  };

  customElements?: string;
}

export interface Dist {
  tarball: string;
}
