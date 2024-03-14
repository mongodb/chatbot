import {
  GeneratedDataStore,
  SomeGeneratedData,
} from "../generate/GeneratedDataStore";
import { MockFindFilter } from "./MockFindFilter";

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
    findByCommandRunId: async (commandRunId) => {
      return Object.values(memDb).filter(
        (d) => d.commandRunId.toHexString() === commandRunId.toHexString()
      );
    },
    async find(filterFunc: MockFindFilter<SomeGeneratedData>) {
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
