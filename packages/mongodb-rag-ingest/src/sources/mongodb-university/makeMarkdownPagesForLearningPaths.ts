import fs from 'fs';
import Path from "path";
import {
  TiCatalogItem,
} from "./MongoDbUniversityDataApiClient";


const SRC_ROOT = Path.resolve(__dirname, "..");

/**
  Helper function to create Markdown files
  for MongoDB University learning paths.
 */
export function makeMarkdownFilesForLearningPaths({
  tiCatalogItems,
}: {
  tiCatalogItems: TiCatalogItem[];
}): void {


  const lp_dir = Path.resolve(SRC_ROOT, "../../../../mongodb-uni/learning-paths")
  for(const item of tiCatalogItems) {
    // TODO: make sure this is tiCatalogFilterFunc data
    if(item.learning_format == 'Learning Path' || item.learning_format == 'Course') {
      const { name, description, slug, associated_content } = item
      const title = `# ${name}`
      const markdownContent = [title, description, `\n`]
      for(const content_id of associated_content as string[]) {
        const nested_content = tiCatalogItems.find((elem) => elem.ti_id == content_id)
        if (!nested_content) continue;
        const { name, duration, description, slug } = nested_content
        const title = `#### ${name}`
        const link = `[View Details] (https://learn.mongodb.com/courses/${slug})`
        markdownContent.push(title, duration, description, link, `\n`)
      }
      fs.writeFileSync(`${lp_dir}/${slug}.md`, markdownContent.join('\n'));
    }
  }
}

/* 

NOTES

This implementation is slow. It requires iterating through all tiCatalogItems to find learning paths and courses,
then iterating through all tiCatalogItems again to find courses with a ti_id to match whats listed in associated_content, one at a time.
A better approach would be for University to set up another FastAPI endpoint /ti/learning_paths_and_courses that returns 
learning paths and courses after having done a lookup on the associated_content field. 
Then we would simply iterate through all LPs and courses, and all content within them, to create a markdown file for each. 

_____________________________

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
- where does this function fit in the ingest flow? 
- How often should this be run to keep MD files up to date?
- How can I run this against the full catalog?

*/
