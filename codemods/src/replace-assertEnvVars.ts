import {
  API,
  Collection,
  FileInfo,
  ImportDeclaration,
  ImportSpecifier,
  Transform,
} from "jscodeshift";

function findCoreImport(root: Collection<unknown>) {
  return root
    .find(ImportDeclaration)
    .filter((path) => path.node.source.value === "mongodb-rag-core")
    .at(0);
}

const transform: Transform = (fileInfo: FileInfo, api: API) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Find all instances of assertEnvVars in the file
  const assertEnvVarsCallExpressions = root.find(j.CallExpression, {
    callee: {
      type: "Identifier",
      name: "assertEnvVars",
    },
  });

  // If there are no assertEnvVars calls, then there is nothing to replace and
  // we can return the original source
  if (assertEnvVarsCallExpressions.length === 0) {
    return fileInfo.source;
  }

  // Find existing imports from core
  let coreImport = findCoreImport(root);
  const coreIsImported = coreImport.length > 0;

  // Import fromEnvironment if it's not already imported
  if (coreIsImported) {
    // Add fromEnvironment to the existing core import declaration (if it's not already there)
    const coreImportDeclaration = coreImport.get();
    const hasFromEnvironment = coreImportDeclaration.node.specifiers?.some(
      (spec: ImportSpecifier) =>
        spec.type === "ImportSpecifier" &&
        spec.imported.name === "fromEnvironment"
    );
    if (!hasFromEnvironment) {
      coreImportDeclaration.node.specifiers?.push(
        j.importSpecifier(j.identifier("fromEnvironment"))
      );
    }
  } else {
    // Add a new core import declaration that includes fromEnvironment
    root
      .get()
      .node.program.body.unshift(
        j.importDeclaration(
          [j.importSpecifier(j.identifier("fromEnvironment"))],
          j.literal("mongodb-rag-core")
        )
      );
    coreImport = findCoreImport(root);
  }

  // Find and remove assertEnvVars from imports
  coreImport
    .filter(
      (path) =>
        path.node.specifiers?.some(
          (specifier) =>
            specifier.type === "ImportSpecifier" &&
            specifier.imported.name === "assertEnvVars"
        ) ?? false
    )
    .forEach((path) => {
      path.node.specifiers = (path.node.specifiers ?? []).filter(
        (spec) =>
          spec.type !== "ImportSpecifier" ||
          spec.imported.name !== "assertEnvVars"
      );
    });

  // Replace assertEnvVars function calls
  assertEnvVarsCallExpressions.forEach((path) => {
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

  return root.toSource();
};

export default transform;

export const parser = "ts";
