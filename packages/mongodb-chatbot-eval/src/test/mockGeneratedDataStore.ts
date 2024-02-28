import {
  GeneratedDataStore,
  SomeGeneratedData,
} from "../generate/GeneratedDataStore";

export type MockFindFilter = (
  number: any,
  index: any,
  array: SomeGeneratedData[]
) => boolean;

export const makeMockGeneratedDataStore = () => {
  const memDb: Record<string, SomeGeneratedData> = {};
  return {
    insertOne: async (data) => {
      memDb[data._id.toHexString()] = data;
      return true;
    },
    findById: async (id) => {
      return memDb[id.toHexString()];
    },
    async find(filterFunc: MockFindFilter) {
      return Object.values(memDb).filter(filterFunc);
    },
    async insertMany(data) {
      for (const d of data) {
        memDb[d._id.toHexString()] = d;
      }
      return true;
    },
    close: jest.fn(),
  } satisfies GeneratedDataStore;
};
