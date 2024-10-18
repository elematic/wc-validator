import {findNodeAtLocation, type Node} from 'jsonc-parser';
import type {PackageService} from '../npm/package-service.js';
import type {ValidationProblem} from './errors.js';

export const getProblems = (
  filePathOrKey: string,
  path: string,
  problems: Array<ValidationProblem>,
) => {
  return problems.filter(
    (problem) =>
      (problem.filePath === filePathOrKey || problem.key === filePathOrKey) &&
      problem.path === path,
  );
};

export const collect = async <T>(asyncIterable: AsyncIterable<T>) => {
  const results: Array<T> = [];
  for await (const result of asyncIterable) {
    results.push(result);
  }
  return results;
};

/**
 * Returns the jsonc-parser node at the given instance path as returned by AJV.
 */
export const findNodeAtPath = (node: Node, path: string) => {
  const parts = path.split('/').map((part) => {
    if (/^\d+$/.test(part)) {
      return Number(part);
    }
    return part;
  });
  return findNodeAtLocation(node, parts);
};

export interface ValidateManifestArgs {
  packageName: string;
  version: string;
  files: PackageService;
  skipDbRead?: boolean;
}
