import { promises as fs } from "fs";
import path from "path";
import YAML from "yaml";

export async function readYamlDir(
  dir: string
): Promise<[string, Record<string, unknown>][]> {
  try {
    const files = await fs.readdir(dir);
    const yamlFiles = files.filter(
      (file) => path.extname(file) === ".yml" || path.extname(file) === ".yaml"
    );

    const yamlDocuments = await Promise.all(
      yamlFiles.map(async (file) => {
        const filePath = path.join(dir, file);
        const fileContents = await fs.readFile(filePath, "utf8");
        const yaml = YAML.parse(fileContents);
        return [filePath, yaml] as [string, Record<string, unknown>];
      })
    );

    return yamlDocuments;
  } catch (error) {
    console.error("Error parsing YAML files:", error);
    return [];
  }
}
