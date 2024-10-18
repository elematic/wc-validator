import {errorCodes, type ValidationProblem} from '../../errors.js';
import {findNodeAtPath} from '../../utils.js';
import type {
  ValidationRule,
  ValidationRuleArgs,
} from '../../validation-rule.js';
import {visitPackage} from '../../../manifest/visitor.js';
import type {Module} from 'custom-elements-manifest';
import {resolveReference} from '../../../manifest/references.js';
/**
 * Validates that custom elements manifest references are valid.
 */
export const validateManifestReferences: ValidationRule = async function* ({
  packageName,
  version,
  customElementsManifestFileName,
  manifestTree,
  manifestData,
}: ValidationRuleArgs) {
  if (
    customElementsManifestFileName === undefined ||
    manifestTree === undefined ||
    manifestData === undefined
  ) {
    return;
  }

  const problems: Array<ValidationProblem> = [];

  let mod: Module;

  visitPackage(
    {
      visitModule(m) {
        mod = m;
      },
      visitTypeReference(_ref) {
        // TODO: Type references aren't exported in the manifest, so we can't
        // validate them without reading the declaration file. Return false to
        // skip them for now.
        return false;
      },
      visitReference(ref, path) {
        if (ref.package === undefined || ref.package !== packageName) {
          // console.warn('Cross-package references not supported yet');
          return;
        }
        const resolved = resolveReference(
          manifestData,
          mod,
          ref,
          packageName,
          version,
        );
        if (resolved === undefined) {
          const node = findNodeAtPath(manifestTree, path);
          problems.push({
            filePath: customElementsManifestFileName,
            key: 'custom-elements-manifest',
            path: path,
            code: errorCodes.invalid_reference,
            message: `Could not resolve reference ${JSON.stringify(ref)}`,
            start: node?.offset,
            length: node?.length,
            severity: 'error',
          } satisfies ValidationProblem);
        }
      },
    },
    manifestData,
  );

  yield* problems;
};
