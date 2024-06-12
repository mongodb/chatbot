import * as yaml from 'js-yaml';
import { existsSync, readFileSync } from 'fs';

class YamlReader {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  public async readYaml(): Promise<any> {
    if (!existsSync(this.filePath)) {
      throw new Error(`YAML file not found: ${this.filePath}`);
    }

    const fileContent = readFileSync(this.filePath, 'utf8');
    const data = yaml.load(fileContent);
    return data;
  }
}