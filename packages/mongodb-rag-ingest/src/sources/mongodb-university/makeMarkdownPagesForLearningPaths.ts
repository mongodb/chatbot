import fs from 'fs';
import Path from "path";
import {
  TiCatalogItem,
} from "./MongoDbUniversityDataApiClient";


const SRC_ROOT = Path.resolve(__dirname, "..");

/**
  Helper function to create Markdown files
  for MongoDB University learning paths and courses.
 */
export function makeMarkdownFilesForLearningPaths({
  tiCatalogItems,
}: {
  tiCatalogItems: TiCatalogItem[];
}): void {


  const lp_dir = Path.resolve(SRC_ROOT, "../../../../mongodb-uni/learning-paths")
  for(const item of tiCatalogItems) {
    if(item.learning_format == 'Learning Path' || item.learning_format == 'Course') {
      const { name, description, slug, nested_content } = item
      const title = `# ${name}`
      const markdownContent = [title, description, `\n`]
      if (nested_content) {
        for(const nested of nested_content) {
          const { name, duration, description, slug } = nested
          const title = `#### ${name}`
          const link = `[View Details] (https://learn.mongodb.com/courses/${slug})`
          markdownContent.push(title, duration, description, link, `\n`)
        }
      }
      fs.writeFileSync(`${lp_dir}/${slug}.md`, markdownContent.join('\n'));
    }
  }
}
