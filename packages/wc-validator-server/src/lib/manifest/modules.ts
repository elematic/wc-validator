import type {Package} from 'custom-elements-manifest/schema.js';

export const getModule = (pkg: Package, path: string) => {
  path = normalizeModulePath(path);
  for (const mod of pkg.modules) {
    const modulePath = normalizeModulePath(mod.path);
    if (modulePath === path) {
      return mod;
    }
  }
  return undefined;
};

export const normalizeModulePath = (path: string) =>
  path.startsWith('/') ? path.substring(1) : path;
