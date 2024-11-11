import { Transform, FileInfo, API, ImportSpecifier } from "jscodeshift";

const transform: Transform = (fileInfo: FileInfo, api: API) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Track if we need to update imports
  let needsImportUpdate = false;

  // Replace assertEnvVars function calls
  root
    .find(j.CallExpression, {
      callee: {
        type: "Identifier",
        name: "assertEnvVars",
      },
    })
    .forEach((path) => {
      needsImportUpdate = true;
      const originalArg = path.node.arguments[0];

      // Create the new fromEnvironment call
      const newCall = j.callExpression(j.identifier("fromEnvironment"), [
        j.objectExpression([
          j.property(
            "init",
            j.identifier("required"),
            j.callExpression(
              j.memberExpression(j.identifier("Object"), j.identifier("keys")),
              [originalArg]
            )
          ),
        ]),
      ]);

      j(path).replaceWith(newCall);
    });

  // Update imports if we made any replacements
  if (needsImportUpdate) {
    // Find existing import from core
    const existingImport = root
      .find(j.ImportDeclaration)
      .filter((path) => path.node.source.value === "mongodb-rag-core")
      .at(0);

    // Find and remove assertEnvVars from imports
    root
      .find(j.ImportDeclaration)
      .filter(
        (path) =>
          path.node.specifiers?.some(
            (specifier) =>
              specifier.type === "ImportSpecifier" &&
              specifier.imported.name === "assertEnvVars"
          ) ?? false
      )
      .forEach((path) => {
        const specifiers = path.node.specifiers || [];
        if (specifiers.length === 1) {
          j(path).remove();
        } else {
          path.node.specifiers = specifiers.filter(
            (spec) =>
              spec.type !== "ImportSpecifier" ||
              spec.imported.name !== "assertEnvVars"
          );
        }
      });

    // Add fromEnvironment to existing import or create new import
    if (existingImport.length) {
      // Check if fromEnvironment is already imported
      const hasFromEnvironment =
        existingImport
          .get()
          .node.specifiers?.some(
            (spec: ImportSpecifier) =>
              spec.type === "ImportSpecifier" &&
              spec.imported.name === "fromEnvironment"
          ) ?? false;
      console.log("hasFromEnvironment", hasFromEnvironment);

      if (!hasFromEnvironment) {
        // Add fromEnvironment to existing specifiers
        existingImport
          .get()
          .node.specifiers?.push(
            j.importSpecifier(j.identifier("fromEnvironment"))
          );
      }
    } else {
      // Create new import if no existing import found
      root
        .get()
        .node.program.body.unshift(
          j.importDeclaration(
            [j.importSpecifier(j.identifier("fromEnvironment"))],
            j.literal("mongodb-rag-core")
          )
        );
    }
  }

  return root.toSource();
};

export default transform;

export const parser = "ts";
