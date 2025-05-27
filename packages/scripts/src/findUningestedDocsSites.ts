import { type SnootyProject, snootyProjectConfig } from "ingest-mongodb-public";

const deprecatedProjectNames = [
  "atlas-app-services",
  "atlas-open-service-broker",
  "datalake",
  "guides",
  "realm",
];

const omittedProjects = [
  ...deprecatedProjectNames.map((name) => ({
    name,
    deprecated: true,
    note: "Deprecated",
  })),
  {
    name: "mongoid-railsmdb",
    deprecated: false,
    note: "Supposed to be a repo for a new docset but the project got deprioritized so all that's in there right now is a (potentially outdated) Getting Started guide",
  },
];

function getOmittedProject(projectName: string) {
  return omittedProjects.find((p) => p.name === projectName);
}

async function listDocsProjectsFromApi() {
  const apiBaseUrl = "https://snooty-data-api.mongodb.com/prod";
  const listProjectsUrl = new URL("projects", apiBaseUrl);
  const response = await fetch(listProjectsUrl);
  if (!response.ok) {
    throw new Error(`Failed to list projects: ${response.statusText}`);
  }
  const responseBody = await response.json();
  if (!("data" in responseBody)) {
    throw new Error("Invalid response body. Received:", responseBody);
  }
  const apiProjects = responseBody.data as SnootyProject[];
  return apiProjects;
}

async function findUningestedDocsSites() {
  const apiProjects = await listDocsProjectsFromApi();
  const ingestableProjectNames = new Set(apiProjects.map((p) => p.project));
  const ingestedProjectNames = new Set(snootyProjectConfig.map((p) => p.name));
  // A project should be ingested if it's ingestable but not ingested yet
  const uningestedProjects = Array.from(ingestableProjectNames)
    .filter((x) => !ingestedProjectNames.has(x))
    .reduce(
      (acc, projectName) => {
        const omitted = getOmittedProject(projectName);
        const deprecated = omitted?.deprecated;
        if (deprecated) {
          acc.deprecated.push(projectName);
        } else if (omitted) {
          acc.omitted.push(`${omitted.name} :: ${omitted.note}`);
        } else {
          acc.ingestable.push(projectName);
        }
        return acc;
      },
      { deprecated: [], omitted: [], ingestable: [] } as {
        deprecated: string[];
        omitted: string[];
        ingestable: string[];
      }
    );
  return uningestedProjects;
}

findUningestedDocsSites().then((projects) => {
  console.log(projects);
});
