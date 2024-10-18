import type {Package} from 'custom-elements-manifest';
import {
  parseTree,
  printParseErrorCode,
  type Node,
  type ParseError,
} from 'jsonc-parser';
import {errorCodes, type ValidationProblem} from './errors.js';
import {type ValidateManifestArgs} from './utils.js';

export const parseManifest = async (
  args: ValidateManifestArgs,
  customElementsManifestFileName: string,
) => {
  const {packageName, version, files} = args;
  const problems: Array<ValidationProblem> = [];

  // Fetch manifest
  const manifestSource = await files.getFile(
    packageName,
    version,
    customElementsManifestFileName,
  );

  // Parse manifest to AST
  const parseErrors: Array<ParseError> = [];
  let manifestTree: Node | undefined;
  if (manifestSource !== undefined) {
    manifestTree = parseTree(manifestSource, parseErrors, {
      disallowComments: true,
    })!;
  }
  for (const e of parseErrors) {
    problems.push({
      filePath: customElementsManifestFileName,
      key: 'custom-elements-manifest',
      path: undefined,
      code: errorCodes.JSON_parse_error,
      message: `JSON parse error ${printParseErrorCode(e.error)}`,
      start: e.offset,
      length: e.length,
      severity: 'error',
    } as const);
  }

  const canParseManifest =
    manifestSource !== undefined && parseErrors.length === 0;

  // Parse manifest to data
  // Assume that double parsing is roughly near the same performance as turning
  // the AST into a data object, and a lot less code.
  const manifestData = canParseManifest
    ? (JSON.parse(manifestSource!) as Package)
    : undefined;

  return {
    customElementsManifestFileName,
    manifestData,
    manifestSource,
    manifestTree,
    problems,
  };
};
