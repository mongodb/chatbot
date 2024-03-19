import {
  CommandMetadataStore,
  CommandRunMetadata,
} from "../CommandMetadataStore";

export const makeMockCommandMetadataStore = () => {
  const metadataDb: Record<string, CommandRunMetadata> = {};
  return {
    insertOne: async (command) => {
      metadataDb[command._id.toHexString()] = command;
      return true;
    },
    findById: async (commandId) => {
      return metadataDb[commandId.toHexString()];
    },
    close: jest.fn(),
  } satisfies CommandMetadataStore;
};
