/**
  [MongoDB Atlas sample datasets](https://www.mongodb.com/docs/atlas/sample-data/).
 */
export const datasetDatabases: { name: string; latestDate: Date }[] = [
  {
    name: "sample_mflix",
    latestDate: new Date("2017-09-13T00:37:11.000+00:00"),
  },
  {
    name: "sample_weatherdata",
    latestDate: new Date("1984-03-13T18:00:00.000+00:00"),
  },
  {
    name: "sample_supplies",
    latestDate: new Date("2017-12-31T18:15:34.758+00:00"),
  },
  {
    name: "sample_airbnb",
    latestDate: new Date("2019-03-11T04:00:00.000+00:00"),
  },
  {
    name: "sample_analytics",
    latestDate: new Date("2017-01-09T00:00:00.000+00:00"),
  },
  {
    name: "sample_geospatial",
    // Note: no dates on the DB
    latestDate: new Date(),
  },
  {
    name: "sample_guides",
    // Note: no dates on the DB
    latestDate: new Date(),
  },
  {
    name: "sample_restaurants",
    // Note: no dates on the DB
    latestDate: new Date(),
  },
];
