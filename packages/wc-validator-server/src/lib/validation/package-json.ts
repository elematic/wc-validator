import {
  findNodeAtLocation,
  parse,
  parseTree,
  printParseErrorCode,
  type ParseError,
} from 'jsonc-parser';
import {errorCodes, type ValidationProblem} from './errors.js';
import {type ValidateManifestArgs} from './utils.js';

export const parsePackageJson = async (args: ValidateManifestArgs) => {
  const {packageName, version, files} = args;
  const problems: Array<ValidationProblem> = [];

  // Fetch package.json *file* from the package, not from the npm registry API.
  // This is the actual source as uploaded to npm, so it's suitable for
  // reporting errors on.
  const packageJsonSource = await files.getFile(
    packageName,
    version,
    'package.json',
  );

  // Parse package.json
  const parseErrors: Array<ParseError> = [];
  const packageJsonTree = parseTree(packageJsonSource, parseErrors, {
    disallowComments: true,
  })!;
  for (const e of parseErrors) {
    problems.push({
      filePath: 'package.json',
      path: undefined,
      code: errorCodes.JSON_parse_error,
      message: `JSON parse error ${printParseErrorCode(e.error)}`,
      start: e.offset,
      length: e.length,
      severity: 'error',
    } as const);
  }

  // Get manifest file name
  let customElementsManifestFileName: string | undefined = undefined;
  const customElementsManifestNode = findNodeAtLocation(packageJsonTree, [
    'customElements',
  ]);
  if (customElementsManifestNode?.type === 'string') {
    customElementsManifestFileName = customElementsManifestNode.value;
  }

  const packageJson = parse(packageJsonSource, undefined, {
    disallowComments: true,
  });

  return {
    customElementsManifestFileName,
    problems,
    packageJson,
    packageJsonTree,
  };
};
