import {FieldValue, Firestore, type Settings} from '@google-cloud/firestore';
import type {Package} from 'custom-elements-manifest/schema.js';
import type {Node} from 'jsonc-parser';
import type {Version} from '../npm/npm.js';
import {type ValidationProblem} from './errors.js';
import {parseManifest} from './manifest.js';
import {parsePackageJson} from './package-json.js';
import {validateManifestDeprecated} from './rules/manifest/deprecated.js';
import {validateManifestJsonSchema} from './rules/manifest/json-schema.js';
import {validateManifestModuleExists} from './rules/manifest/module-exists.js';
import {validateManifestReadme} from './rules/manifest/readme.js';
import {validateManifestReferences} from './rules/manifest/references.js';
import {validateManifestSchemaVersion} from './rules/manifest/schema-version.js';
import {validateTagNameIsExported} from './rules/manifest/tag-name-is-exported.js';
import {validateManifestTypes} from './rules/manifest/types.js';
import {validatePackageJsonCustomElements} from './rules/package-json/custom-elements.js';
import {validatePackageJsonDescription} from './rules/package-json/description.js';
import {validatePackageJsonExports} from './rules/package-json/exports.js';
import {validatePackageKeywords} from './rules/package-json/keywords.js';
import {validatePackageJsonMain} from './rules/package-json/main.js';
import {validatePackageJsonType} from './rules/package-json/type.js';
import {collect, type ValidateManifestArgs} from './utils.js';
import type {ValidationRule, ValidationRuleArgs} from './validation-rule.js';

export type {ValidationProblem} from './errors.js';
export {getProblems} from './utils.js';

const {FIRESTORE_DB_NAME} = process.env;
const firestoreDbName = FIRESTORE_DB_NAME ?? undefined;

// console.log('firestoreDbName', firestoreDbName);

const db = new Firestore({
  databaseId: firestoreDbName,
  ignoreUndefinedProperties: true,
} as Settings);

const rules: Array<ValidationRule> = [
  validatePackageJsonType,
  validatePackageJsonDescription,
  validatePackageJsonMain,
  validatePackageJsonExports,
  validatePackageJsonCustomElements,
  validatePackageKeywords,
  validateManifestSchemaVersion,
  validateManifestDeprecated,
  validateManifestReadme,
  validateManifestJsonSchema,
  validateManifestModuleExists,
  validateManifestReferences,
  validateManifestTypes,
  validateTagNameIsExported,
];

/**
 * Validates an npm package/version against a number of checks for custom
 * element manifest correctness.
 */
export const validatePackage = async (
  args: ValidateManifestArgs,
): Promise<{
  customElementsManifestFileName: string | undefined;
  manifestData: Package | undefined;
  manifestSource: string | undefined;
  problems: ValidationProblem[];
  packageJson: Version;
}> => {
  const {packageName, files, skipDbRead} = args;
  let {version} = args;

  const packageVersionMetadata = await files.getPackageVersionMetadata(
    packageName,
    version,
  );

  // If the request version was a dist tag, get the actual version
  version = packageVersionMetadata.version;

  const packageDocRef = db
    .collection('packages')
    .doc(packageName.replace('/', '__'))
    .collection('versions')
    .doc(version);

  if (!skipDbRead) {
    const packageDoc = await packageDocRef.get();

    if (packageDoc.exists && 1 > 0) {
      // console.log('Package doc already exists', packageDoc.ref.path);
      const data = packageDoc.data()!;
      const problems = data.problems as ValidationProblem[];
      const customElementsManifestFileName =
        data.customElementsManifestFileName;
      let packageJson: any;
      let manifestSource: string | undefined;
      let manifestData: Package | undefined;
      try {
        const packageJsonSource = await files.getFile(
          packageName,
          version,
          'package.json',
        );
        packageJson = JSON.parse(packageJsonSource);
        manifestSource = await files.getFile(
          packageName,
          version,
          customElementsManifestFileName,
        );
        manifestData = JSON.parse(manifestSource);
      } catch (e) {
        // Ignore error, it should already be reported as a problem.
      }
      return {
        customElementsManifestFileName,
        manifestData,
        manifestSource,
        problems,
        packageJson,
      };
    }
  }

  const problems: Array<ValidationProblem> = [];

  // This may fail if the package is not found or there's a network error, but
  // we let that error bubble up to the caller.
  const packageMetadata = await files.getPackageMetadata(packageName);
  const packagePath = `/packages/${packageName.replace('/', '__')}`;
  const packageRef = db.doc(packagePath);

  await packageRef.set({
    distTags: packageMetadata['dist-tags'],
    versions: Object.keys(packageMetadata.versions),
    lastModified: FieldValue.serverTimestamp(),
  });

  const {
    customElementsManifestFileName,
    problems: packgeJsonProblems,
    packageJson,
    packageJsonTree,
  } = await parsePackageJson({
    packageName,
    version,
    files,
  });
  problems.push(...packgeJsonProblems);

  let manifestSource: string | undefined = undefined;
  let manifestData: Package | undefined = undefined;
  let manifestTree: Node | undefined = undefined;

  if (customElementsManifestFileName !== undefined) {
    try {
      const result = await parseManifest(
        {
          packageName,
          version,
          files,
        },
        customElementsManifestFileName,
      );
      problems.push(...result.problems);
      ({manifestSource, manifestData, manifestTree} = result);
    } catch (e) {
      // TODO: ignore this error, since it should be reported already.
      // console.error(e);
    }
  }

  const ruleArgs: ValidationRuleArgs = {
    packageName,
    version,
    packageJsonTree,
    packageJson,
    customElementsManifestFileName,
    manifestTree,
    manifestData,
    files,
  };

  for (const rule of rules) {
    problems.push(...(await collect(rule(ruleArgs))));
  }

  // console.log('Writing package doc', packageDocRef.path);

  const packageDocData = {
    customElementsManifestFileName,
    problems,
  };
  if (skipDbRead) {
    const doc = await packageDocRef.get();
    if (doc.exists) {
      await packageDocRef.update(packageDocData);
    } else {
      await packageDocRef.create(packageDocData);
    }
  } else {
    await packageDocRef.create(packageDocData);
  }

  return {
    customElementsManifestFileName,
    manifestData,
    manifestSource,
    problems,
    packageJson,
  };
};
