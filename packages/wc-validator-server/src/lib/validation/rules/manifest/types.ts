import * as pathLib from 'node:path';
import {errorCodes, type ValidationProblem} from '../../errors.js';
import {findNodeAtPath} from '../../utils.js';
import type {
  ValidationRule,
  ValidationRuleArgs,
} from '../../validation-rule.js';
import {visitPackage} from '../../../manifest/visitor.js';
import type {Module} from 'custom-elements-manifest';

/**
 * Validates that custom elements manifest types are valid.
 */
export const validateManifestTypes: ValidationRule = async function* ({
  packageName,
  version,
  customElementsManifestFileName,
  manifestTree,
  manifestData,
  files,
}: ValidationRuleArgs) {
  if (
    customElementsManifestFileName === undefined ||
    manifestTree === undefined ||
    manifestData === undefined
  ) {
    return;
  }

  const problems: Array<ValidationProblem> = [];
  const manifestDir = pathLib.dirname(customElementsManifestFileName);

  let mod: Module;

  visitPackage(
    {
      visitModule(m) {
        mod = m;
      },
      visitType(type, path) {
        if (type?.references === undefined) {
          return;
        }
        let lastEnd = 0;
        let i = 0;
        for (const ref of type.references) {
          const node = findNodeAtPath(manifestTree, path + `/references/${i}`)!;

          if (
            (ref.start === undefined && ref.end !== undefined) ||
            (ref.start !== undefined && ref.end === undefined)
          ) {
            problems.push({
              filePath: 'package.json',
              key: 'custom-elements-manifest',
              path,
              code: errorCodes.invalid_type,
              message: `Invalid type reference start or end: ${ref}`,
              start: node?.offset,
              length: node?.length,
              severity: 'error',
            } satisfies ValidationProblem);
          } else if (ref.start !== undefined && ref.end !== undefined) {
            if (ref.start < lastEnd || ref.end <= ref.start) {
              problems.push({
                filePath: 'package.json',
                key: 'custom-elements-manifest',
                path,
                code: errorCodes.invalid_type,
                message: `Invalid type reference range: start=${ref.start}, end=${ref.end}`,
                start: node?.offset,
                length: node?.length,
                severity: 'error',
              } satisfies ValidationProblem);
            }
            lastEnd = ref.end;
          }
          i++;
        }
      },
      visitTypeReference(ref, path) {
        if (ref.package === undefined || ref.package !== packageName) {
          // console.warn('Cross-package references not supported yet');
          return;
        }

        // Go async so we can do I/O
        (async () => {
          const node = findNodeAtPath(manifestTree, path)!;

          // Validate that the type declaration exists
          if (ref.module?.endsWith('.js')) {
            const modPath = pathLib.join(manifestDir, ref.module);
            const extName = pathLib.extname(ref.module);
            const declarationPath =
              modPath.substring(0, modPath.length - extName.length) + '.d.ts';
            try {
              await files.getFile(packageName, version, declarationPath);

              // console.log('  found declaration file', declarationPath);
              // TODO: validate the type declaration exists using TypeScript
            } catch (e) {
              // console.log('  could not find declaration file', declarationPath);
              if (
                e instanceof Error &&
                'statusCode' in e &&
                e.statusCode === 404
              ) {
                problems.push({
                  filePath: mod.path,
                  key: 'custom-elements-manifest',
                  path,
                  code: errorCodes.file_not_found,
                  message: `Type declaration not found: ${declarationPath}`,
                  start: node?.offset,
                  length: node?.length,
                  severity: 'error',
                } satisfies ValidationProblem);
              }
            }
          }
        })();
      },
    },
    manifestData,
  );

  yield* problems;
};
