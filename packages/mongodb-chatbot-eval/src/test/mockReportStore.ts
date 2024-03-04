import { ReportStore, Report } from "../report";

export const makeMockReportStore = () => {
  const memDb: Record<string, Report> = {};
  return {
    insertOne: async (report) => {
      memDb[report._id.toHexString()] = report;
      return true;
    },
    find: jest.fn(),
    close: jest.fn(),
    // for testing
    async findAll() {
      return Object.values(memDb);
    },
  } satisfies ReportStore & { findAll: () => Promise<Report[]> };
};
