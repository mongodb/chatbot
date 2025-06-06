import {
  makeMdOnGithubDataSource,
  MakeMdOnGithubDataSourceParams,
} from "mongodb-rag-core/dataSources";
import { SourceTypeName } from ".";

export const terraformProviderSourceConfig: MakeMdOnGithubDataSourceParams<SourceTypeName> =
  {
    name: "atlas-terraform-provider",
    repoUrl: "https://github.com/mongodb/terraform-provider-mongodbatlas.git",
    repoLoaderOptions: {
      branch: "master",
    },
    pathToPageUrl(pathInRepo, _) {
      const siteBaseUrl =
        "https://registry.terraform.io/providers/mongodb/mongodbatlas/latest/docs";
      return siteBaseUrl + pathInRepo.replace("docs/", "").replace(".md", "");
    },
    filter: (path: string) => path.includes("docs") && path.endsWith(".md"),
    sourceType: "tech-docs-external",
    metadata: {
      productName: "mongodbatlas Terraform Provider",
      tags: ["docs", "terraform", "atlas", "hcl"],
    },
  };

export const terraformProviderDataSource = async () => {
  return await makeMdOnGithubDataSource<SourceTypeName>(
    terraformProviderSourceConfig
  );
};
