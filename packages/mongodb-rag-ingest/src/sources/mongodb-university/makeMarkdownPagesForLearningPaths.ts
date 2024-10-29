import fs from 'fs';
import Path from "path";
import {
  TiCatalogItem,
} from "./MongoDbUniversityDataApiClient";


const SRC_ROOT = Path.resolve(__dirname, "..");

/**
  Helper function to determine if a TiCatalogItem is a higher level course with nested content 
  (made up of other content items such as Units and Learning Bytes).
 */
const higher_level_course = (learning_format: string, nested_content: TiCatalogItem[] = []): boolean => {
  return nested_content.length > 0 && (learning_format == 'Learning Path' || learning_format == 'Course')
}

/**
  Helper function to create Markdown content for MongoDB University Learning Paths and Courses
  based on titles, duration, and descriptions.
 */
export function generateMarkdown({
  tiCatalogItem
}: {
  tiCatalogItem: TiCatalogItem;
}): string {
  const { name, description, nested_content } = tiCatalogItem;
  const title = `# ${name}`;
  const markdownContent = [title, description, `\n`];
  if (nested_content) {
    for(const nested of nested_content) {
      const { name, duration, description, slug } = nested;
      const title = `#### ${name}`;
      const link = `[View Details] (https://learn.mongodb.com/courses/${slug})`;
      markdownContent.push(title, duration, description, link, `\n`);
    }
  }
  return markdownContent.join('\n');
}

/**
  Function to create Markdown files for all MongoDB University Learning Paths and Courses.
 */
export function makeMarkdownFilesForLearningPaths({
  tiCatalogItems,
}: {
  tiCatalogItems: TiCatalogItem[];
}): void {
  const lp_dir = Path.resolve(SRC_ROOT, "../../../../mongodb-uni/learning-paths")
  for(const item of tiCatalogItems) {
    if(higher_level_course(item.learning_format, item.nested_content)) {
      const markdownContent = generateMarkdown({tiCatalogItem: item});
      fs.writeFileSync(`${lp_dir}/${item.slug}.md`, markdownContent);
    }
  }
}

/* 

NOTES
- helpful functions
  - makeUniversityPageUrl

TODOS

[] create a make_markdown_files func
[] write tests
  [] make code more testable
  [] mock fs.writeFileSync

______________________________

QUESTIONS
- how are the MD files currently being read and ingested?
    mongoDbUniMetadataDataSourceConfig
    makeMdOnGithubDataSource - loads .md files from GH repo

    makeMongDBUniversityDataSource - returns universityPages, 

- where does this function fit in the ingest flow? 
- How often should this be run to keep MD files up to date?
- How can I run this against the full catalog?

*/
