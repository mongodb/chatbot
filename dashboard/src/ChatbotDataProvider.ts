import { DataProvider } from "react-admin";

export const ChatbotDataProvider: DataProvider = {
  async create(resource, params) {
    return { data: { ...params.data, id: "" } };
  },
  async delete(resource, params) {
    return { data: { id: "" } };
  },
  async deleteMany(resource, params) {
    return [];
  },
  async getList(resource, params) {
    return {};
  },
  async getMany(resource, params) {
    return {};
  },
  async getManyReference(resource, params) {
    return {};
  },
  async getOne(resource, params) {
    return {};
  },
  async update(resource, params) {
    return {};
  },
  async updateMany(resource, params) {
    return {};
  },
};
