import {html, type RouterMiddleware} from 'zipadee';

export const homeHandler: RouterMiddleware = (_req, res) => {
  res.body = html`
    <!doctype html>
    <html>
      <head>
        <title>Custom Elements Validator</title>
        <link rel="stylesheet" href="/static/site.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header class="title">
          <h1>Custom Elements Manifest Validator</h1>
          <h4>By <a href="https://elematic.software">Elematic Software</a></h4>
          <h3>
            Make sure your web components are ready for tools that use the
            <a href="https://github.com/webcomponents/custom-elements-manifest"
              >Custom Elements Manifest</a
            >
            file format!
          </h3>
          <form action="/validate" method="get">
            <input name="packageName" placeholder="npm package name" />
            <button type="submit">Validate ></button>
          </form>
        </header>
        <main>
          <section>
            <h2>About</h2>
            <p>
              Custom Elements Manifest Validator validates an npm package and
              its custom elements manifest against the
              <a
                href="https://github.com/webcomponents/custom-elements-manifest"
                >Custom Elements Manifest</a
              >
              specification and checks for common mistakes and best practices.
            </p>
            <p>
              Passing validation means that the package is more likely to work
              well in tools that consume custom elements manifests such as
              component catalogs, IDEs, and type checkers.
            </p>
            <div class="alert">
              <h3>Warning!</h3>
              <p>
                This is a work in progress and may not catch all errors or
                provide the best error messages. Server errors may also occur.
              </p>
            </div>
          </section>
          <section>
            <h2>Checks</h2>
            <p>The validator performs several checks, including:</p>
            <h3><code>package.json</code> checks</h3>
            <ul>
              <li><code>type</code> is set to <code>"module"</code></li>
              <li><code>description</code> is set</li>
              <li><code>main</code> is set, and the file exists</li>
              <li><code>customElements</code> is set, and the file exists</li>
              <li><code>exports</code> is set</li>
              <li><code>keywords</code> includes "web components"</li>
            </ul>
            <h3>Custom Elements Manifest checks</h3>
            <ul>
              <li><code>schemaVersion</code> is set and current (2.1.0)</li>
              <li>
                The manifest file validates against the Custom Elements Manifest
                schema
              </li>
              <li><code>deprecated</code> is unset or <code>false</code></li>
              <li><code>readme</code> is unset or set to a valid path</li>
              <li>
                TODO: The manifest file is exported in <code>package.json</code>
              </li>
              <li>
                References
                <ul>
                  <li>
                    All package-local references resolve correctly to an export
                    or declaration (TODO: support cross-package references)
                  </li>
                  <li>
                    All package-local type references resolve to a declaration
                    file (TODO: support package exports and cross-package
                    references)
                  </li>
                  <li>
                    All package-local type references have valid start and end
                    offsets.
                  </li>
                  <li>
                    TODO: Type references are exported from their declaration
                    file.
                  </li>
                  <li>
                    TODO: Source references point to valid files and have valid
                    start and end offsets.
                  </li>
                </ul>
              </li>
              <li>
                Modules
                <ul>
                  <li>Module file exists</li>
                  <li>
                    Exports
                    <ul>
                      <li>TODO: export names are valid</li>
                      <li>
                        TODO: If export name is <code>*</code> the export module
                        is defined
                      </li>
                      <li>TODO: exported declarations have descriptions</li>
                      <li>TODO: exported declarations have types</li>
                    </ul>
                  </li>
                  <li>
                    Declarations
                    <ul>
                      <li>Custom Elements</li>
                      <ul>
                        <li>
                          Custom element declarations with a
                          <code>tagName</code> are exported as a
                          custom-element-export at least once.
                        </li>
                        <li>TODO: custom element names are valid</li>
                        <li>TODO: custom element descriptions are set</li>
                        <li>TODO: CSS property names are valid</li>
                        <li>TODO: part names are valid</li>
                        <li>TODO: slot names are valid</li>
                        <li>TODO: Event types extend <code>Event</code></li>
                        <li>
                          TODO: Attribute <code>fieldName</code> references
                          valid field
                        </li>
                        <li>TODO: <code>inheritedFrom</code> resolves</li>
                      </ul>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </section>
        </main>
      </body>
    </html>
  `;
};
