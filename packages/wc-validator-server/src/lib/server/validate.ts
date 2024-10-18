import type {
  ClassDeclaration,
  ClassField,
  ClassMethod,
  CustomElementDeclaration,
  Declaration,
  Export,
  Module,
} from 'custom-elements-manifest';
import type {Middleware} from 'zipadee';
import {html, HTMLPartial} from 'zipadee';
import {
  getCustomElementDeclarations,
  getCustomElementExports,
} from '../manifest/custom-elements.js';
import {parseSpecifier, type NpmFileReference} from '../npm/npm.js';
import {type PackageService} from '../npm/package-service.js';
import {
  getProblems,
  validatePackage,
  type ValidationProblem,
} from '../validation/validate.js';

export const validateHandler =
  (files: PackageService): Middleware =>
  async (req, res) => {
    const query = req.url!.searchParams;
    const packageNameAndVersion = query.get('packageName');
    const skipDbReadParam = query.get('skipDbRead');
    const skipDbRead = skipDbReadParam !== null;

    let error: string | undefined;
    let npmLocation: NpmFileReference | undefined;

    try {
      if (packageNameAndVersion === null) {
        throw new Error('No package name given');
      }
      npmLocation = parseSpecifier(packageNameAndVersion!);
      if (npmLocation === undefined) {
        throw new Error(`Invalid package name: ${packageNameAndVersion}`);
      }
      if (npmLocation.path !== '') {
        throw new Error(`Invalid package name: ${packageNameAndVersion}`);
      }
    } catch (e) {
      error = (e as Error).message;
    }

    let body: HTMLPartial;
    if (error !== undefined) {
      body = html` <p>Error: ${error}</p> `;
    } else {
      const packageName = npmLocation!.pkg;
      const version = npmLocation!.version ?? 'latest';

      const result = await validatePackage({
        packageName,
        version,
        files,
        skipDbRead,
      });
      const {
        customElementsManifestFileName,
        manifestData,
        manifestSource,
        problems,
        packageJson,
      } = result;

      const customElementExports =
        manifestData !== undefined
          ? getCustomElementExports(manifestData, packageName, version)
          : undefined;
      const customElementExportsCount = customElementExports?.length ?? 0;

      const customElementExportsByDeclaration = new Map(
        (customElementExports ?? []).map((customElement) => [
          customElement.declaration,
          customElement,
        ]),
      );

      const customElementDeclarations =
        manifestData !== undefined
          ? getCustomElementDeclarations(manifestData)
          : undefined;
      const customElementDeclarationsCount =
        customElementDeclarations?.length ?? 0;

      body = html`
        <header>
          <h1>Custom Elements Manifest Validator</h1>
        </header>
        <main>
          <h1>Validation Results</h1>
          <h3>Package: <code>${packageName}@${version}</code></h3>
          <section>
            <h2>Problems</h2>
            ${problems.length === 0
              ? html`<p>No problems found</p>`
              : html`
                  <table>
                    <tr>
                      <th>File</th>
                      <th>Path</th>
                      <th>Severity</th>
                      <th>Message</th>
                    </tr>
                    ${problems.map(
                      (problem) => html`
                        <tr>
                          <td>${problem.filePath}</td>
                          <td>${problem.path}</td>
                          <td>${problem.severity}</td>
                          <td>${problem.message}</td>
                        </tr>
                      `,
                    )}
                  </table>
                `}
          </section>
          <section>
            <h2>package.json</h2>
            <h4>Metadata</h4>
            <table class="meta">
              <tr>
                <th>Package name</th>
                <td>${packageJson.name}</td>
              </tr>
              <tr>
                <th>Version</th>
                <td>${packageJson.version}</td>
              </tr>
              <tr>
                <th>Repository</th>
                <td>${JSON.stringify(packageJson.repository)}</td>
              </tr>
            </table>
            <h4>Checked fields</h4>
            <table class="properties">
              <tr>
                <th>Field</th>
                <th></th>
                <th>Value</th>
              </tr>
              <tr>
                <td>type</td>
                <td>
                  ${renderValidationIcon(
                    getProblems('package.json', 'type', problems),
                  )}
                </td>
                <td>${packageJson.type}</td>
              </tr>
              <tr>
                <td>description</td>
                <td>
                  ${renderValidationIcon(
                    getProblems('package.json', 'description', problems),
                  )}
                </td>
                <td>${packageJson.description}</td>
              </tr>
              <tr>
                <td>main</td>
                <td>
                  ${renderValidationIcon(
                    getProblems('package.json', 'main', problems),
                  )}
                </td>
                <td>${packageJson.main}</td>
              </tr>
              <tr>
                <td>customElements</td>
                <td>
                  ${renderValidationIcon(
                    getProblems('package.json', 'customElements', problems),
                  )}
                </td>
                <td>${packageJson.customElements}</td>
              </tr>
              <tr>
                <td>exports</td>
                <td>
                  ${renderValidationIcon(
                    getProblems('package.json', 'exports', problems),
                  )}
                </td>
                <td></td>
              </tr>
            </table>
          </section>
          <section>
            <h2>Custom Elements Manifest</h2>

            <h4>Metadata</h4>
            <table class="meta">
              <tr>
                <th>Filename</th>
                <td>${customElementsManifestFileName}</td>
              </tr>
              <tr>
                <th>File size</th>
                <td>${new TextEncoder().encode(manifestSource).length}</td>
              </tr>
            </table>

            <h4>Checked fields</h4>
            <table class="properties">
              <tr>
                <th>Field</th>
                <th></th>
                <th>Value</th>
              </tr>
              <tr>
                <td>schemaVersion</td>
                <td>
                  ${renderValidationIcon(
                    getProblems(
                      'custom-elements-manifest',
                      'schemaVersion',
                      problems,
                    ),
                  )}
                </td>
                <td>${manifestData?.schemaVersion}</td>
              </tr>
              <tr>
                <td>deprecated</td>
                <td>
                  ${renderValidationIcon(
                    getProblems(
                      'custom-elements-manifest',
                      'deprecated',
                      problems,
                    ),
                  )}
                </td>
                <td>${manifestData?.deprecated ?? ''}</td>
              </tr>
              <tr>
                <td>readme</td>
                <td>
                  ${renderValidationIcon(
                    getProblems('custom-elements-manifest', 'readme', problems),
                  )}
                </td>
                <td>${manifestData?.readme ?? ''}</td>
              </tr>
            </table>
          </section>
          <section>
            <h2>Custom Elements</h2>
            <p>
              ${customElementExportsCount} custom
              element${customElementExportsCount === 1 ? '' : 's'} exports found
            </p>
            <p>
              ${customElementDeclarationsCount} custom
              element${customElementDeclarationsCount === 1 ? '' : 's'}
              declarations found
            </p>
            <h3>Custom Element Exports</h3>
            ${customElementExportsCount === 0
              ? html`<p>No custom element exports</p>`
              : html`
                  <table>
                    <tr>
                      <th>Tag Name</th>
                      <th>Export Module</th>
                      <th>Declaration</th>
                      <th>Declaration Module</th>
                    </tr>
                    ${customElementExports!.map((customElement) => {
                      const jsExportName =
                        customElement.jsExports[0]?.name === 'default'
                          ? undefined
                          : customElement.jsExports[0]?.name;
                      const className =
                        jsExportName ?? customElement.declaration.name;
                      const tagName =
                        customElement.customElementExport?.name ??
                        customElement.declaration.tagName;
                      const declarationModule =
                        customElement.declarationReference.module ??
                        customElement.module.path;
                      return html`
                        <tr>
                          <td>
                            ${tagName
                              ? html`<code>&lt;${tagName}&gt;</code>`
                              : ''}
                          </td>
                          <td>${customElement.module.path}</td>
                          <td>
                            <code>${className}</code>
                          </td>
                          <td>${declarationModule}</td>
                        </tr>
                      `;
                    })}
                  </table>
                `}
            <h3>Custom Element Declarations</h3>
            ${customElementDeclarationsCount === 0
              ? html`<p>No custom element declarations</p>`
              : html`
                  <table>
                    <tr>
                      <th>Name</th>
                      <th>Module</th>
                      <th>Tag Name (from class)</th>
                      <th>Exported</th>
                    </tr>
                    ${customElementDeclarations!.map((customElement) => {
                      customElement.declaration.tagName;
                      return html`
                        <tr>
                          <td>
                            <code>${customElement.declaration.name}</code>
                          </td>
                          <td>${customElement.module.path}</td>
                          <td>
                            <code
                              >${customElement.declaration.tagName
                                ? html`<code
                                    >&lt;${customElement.declaration
                                      .tagName}&gt;</code
                                  >`
                                : ''}</code
                            >
                          </td>
                          <td>
                            ${customElementExportsByDeclaration.has(
                              customElement.declaration,
                            )
                              ? 'Yes'
                              : 'No'}
                          </td>
                        </tr>
                      `;
                    })}
                  </table>
                `}
          </section>
          <section>
            <h2>Modules</h2>
            ${(manifestData?.modules.length ?? 0) === 0
              ? html`<p>No modules found</p>`
              : html`
                  ${manifestData?.modules.map(
                    (module) => html`
                      <h3>
                        <a name="${module.path}">${module.path}</a>
                      </h3>

                      <h4>Metadata</h4>
                      <table class="meta">
                        <tr>
                          <th>Kind</th>
                          <td>${module.kind}</td>
                        </tr>
                        <tr>
                          <th>Description</th>
                          <td>${module.description ?? ''}</td>
                        </tr>
                        <tr>
                          <th>Summary</th>
                          <td>${module.summary ?? ''}</td>
                        </tr>
                        <tr>
                          <th>Deprecated</th>
                          <td>${module.deprecated ?? ''}</td>
                        </tr>
                      </table>

                      <h4>Exports</h4>
                      ${module.exports === undefined
                        ? html`<p>No exports</p>`
                        : html`<table>
                            <tr>
                              <th>Name</th>
                              <th>Kind</th>
                              <th>Details</th>
                            </tr>
                            ${module.exports.map(
                              (expt) =>
                                html`<tr>
                                  <td><code>${expt.name}</code></td>
                                  <td>${expt.kind}</td>
                                  <td>
                                    ${isLocalExport(module, expt)
                                      ? ''
                                      : html`re-export from
                                          <a href="#${expt.declaration.module}"
                                            >${expt.declaration.module}</a
                                          >`}
                                  </td>
                                </tr>`,
                            )}
                          </table>`}
                      <h4>Declarations</h4>
                      ${module.declarations === undefined
                        ? html`<p>No declarations</p>`
                        : html`<table>
                            <tr>
                              <th>Name</th>
                              <th>Kind</th>
                              <th>Type</th>
                            </tr>
                            ${module.declarations.map(
                              (decl) =>
                                html`<tr>
                                  <td><code>${decl.name}</code></td>
                                  <td>${decl.kind}</td>
                                  <td>
                                    <code
                                      >${getDeclarationType(decl) ?? ''}</code
                                    >
                                  </td>
                                </tr>`,
                            )}
                          </table>`}
                      ${module.declarations
                        ?.filter((m) => m.kind === 'class')
                        .map((decl) => {
                          return renderClass(decl);
                        })}
                    `,
                  )}
                `}
          </section>
        </main>
      `;
    }

    res.body = html`
      <!doctype html>
      <html>
        <head>
          <title>Web Component Validator</title>
          <link rel="stylesheet" href="/static/site.css" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossorigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          ${body}
        </body>
      </html>
    `;
  };

const renderValidationIcon = (
  problems: ValidationProblem | Array<ValidationProblem> | undefined,
) => {
  if (problems === undefined) {
    return '✅';
  }
  if (Array.isArray(problems)) {
    if (problems.length === 0) {
      return '✅';
    }
    if (problems.some((p) => p.severity === 'error')) {
      return '❌';
    }
    return '⚠️';
  }
  if (problems.severity === 'error') {
    return '❌';
  }
  return '⚠️';
};

const isLocalExport = (module: Module, exprt: Export): boolean => {
  return (
    exprt.declaration.module === undefined ||
    exprt.declaration.module === module.path
  );
};

const getDeclarationType = (decl: Declaration) => {
  if (decl.kind === 'variable') {
    return decl.type?.text;
  }
  if (decl.kind === 'function' || decl.kind === 'mixin') {
    return `(${decl.parameters?.map((p) => p.type?.text).join(', ')}) => ${decl.return?.type?.text}`;
  }
  return undefined;
};

const renderClass = (decl: ClassDeclaration) => {
  return html`
    <h4>${decl.name}</h4>
    ${(decl as CustomElementDeclaration).customElement !== undefined
      ? html`<p>Custom Element</p>`
      : ''}
    ${decl.summary !== undefined ? html`<p>${decl.summary}</p>` : ''}
    ${decl.description !== undefined ? html`<p>${decl.description}</p>` : ''}
    ${decl.deprecated !== undefined ? html`<p>${decl.deprecated}</p>` : ''}
    <h5>Fields</h5>
    <table>
      <tr>
        <th>Name</th>
        <th>Visibility</th>
        <th>Type</th>
        <th>Summary</th>
        <th>Description</th>
        <th>Deprecated</th>
      </tr>
      ${decl.members
        ?.filter(
          (m): m is ClassField => m.kind === 'field' && m.static !== true,
        )
        .map(
          (prop) => html`
            <tr>
              <td>${prop.name}</td>
              <td>${prop.privacy}</td>
              <td>${prop.type?.text}</td>
              <td>${prop.summary}</td>
              <td>${prop.description}</td>
              <td>${prop.deprecated}</td>
            </tr>
          `,
        )}
    </table>
    <h5>Methods</h5>
    <table>
      <tr>
        <th>Name</th>
        <th>Visibility</th>
        <th>Summary</th>
        <th>Description</th>
        <th>Deprecated</th>
      </tr>
      ${decl.members
        ?.filter(
          (m): m is ClassMethod => m.kind === 'method' && m.static !== true,
        )
        .map(
          (prop) => html`
            <tr>
              <td>${prop.name}</td>
              <td>${prop.privacy}</td>
              <td>${prop.summary}</td>
              <td>${prop.description}</td>
              <td>${prop.deprecated}</td>
            </tr>
          `,
        )}
    </table>
  `;
};
