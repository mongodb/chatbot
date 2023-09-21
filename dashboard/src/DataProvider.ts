import {
  DataProvider as RaDataProvider,
  GetListParams,
  GetListResult,
  GetOneParams,
  GetOneResult,
  GetManyParams,
  GetManyResult,
  GetManyReferenceParams,
  GetManyReferenceResult,
  UpdateParams,
  UpdateResult,
  UpdateManyParams,
  UpdateManyResult,
  CreateParams,
  CreateResult,
  DeleteParams,
  DeleteResult,
  DeleteManyParams,
  DeleteManyResult,
  Identifier,
} from "react-admin";

export type DataProvider<
  RecordType extends { id: Identifier },
  ResourceType extends string
> = {
  getList(
    resource: ResourceType,
    params: GetListParams
  ): Promise<GetListResult<RecordType>>;

  getOne(
    resource: ResourceType,
    params: GetOneParams<RecordType>
  ): Promise<GetOneResult<RecordType>>;

  getMany(
    resource: ResourceType,
    params: GetManyParams
  ): Promise<GetManyResult<RecordType>>;

  getManyReference(
    resource: ResourceType,
    params: GetManyReferenceParams
  ): Promise<GetManyReferenceResult<RecordType>>;

  update(
    resource: ResourceType,
    params: UpdateParams
  ): Promise<UpdateResult<RecordType>>;

  updateMany(
    resource: ResourceType,
    params: UpdateManyParams
  ): Promise<UpdateManyResult<RecordType>>;

  create(
    resource: ResourceType,
    params: CreateParams
  ): Promise<CreateResult<RecordType>>;

  delete(
    resource: ResourceType,
    params: DeleteParams<RecordType>
  ): Promise<DeleteResult<RecordType>>;

  deleteMany(
    resource: ResourceType,
    params: DeleteManyParams<RecordType>
  ): Promise<DeleteManyResult<RecordType>>;
};

// react-admin DataProvider interface is very broken due to generics on
// interface methods -- this helper turns a clean interface into a react-admin
// compatible DataProvider
export const makeDataProvider = <
  RecordType extends { id: Identifier },
  ResourceType extends string = string
>(
  provider: DataProvider<RecordType, ResourceType>
): RaDataProvider<ResourceType> => provider as RaDataProvider<ResourceType>;

// Example -- deduces record type, no explicit type annotations
const Provider = makeDataProvider({
  async create(resource, params) {
    return { data: { id: "", foo: "string" } };
  },
  async delete(resource, params) {
    return { data: { id: "", foo: "string" } };
  },
  async deleteMany(resource, params) {
    return { data: [] };
  },
  async getList(resource, params) {
    return { data: [] };
  },
  async getMany(resource, params) {
    return { data: [] };
  },
  async getManyReference(resource, params) {
    return { data: [] };
  },
  async getOne(resource, params) {
    return { data: { id: "", foo: "string" } };
  },
  async update(resource, params) {
    return { data: { id: "", foo: "string" } };
  },
  async updateMany(resource, params) {
    return {
      data: [],
    };
  },
});
