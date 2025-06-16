import { ObjectId } from "mongodb-rag-core/mongodb";

export interface GenerationNode<
  T,
  TypeName extends string | undefined = undefined
> {
  _id: ObjectId;
  parent: GenerationNode<unknown, string | undefined> | null;
  children?: GenerationNode<unknown, string | undefined>[];
  data: T;
  updated: Date;
  type?: TypeName;
}

export type WithParentNode<
  NodeType extends GenerationNode<unknown, string | undefined>,
  ParentType extends GenerationNode<unknown, string | undefined> | null
> = NodeType & {
  parent: ParentType;
};
