import { SnootyNode } from "./SnootyDataSource";
import { parse } from "docdoctor";

export const rstToSnootyAst = (rst: string): SnootyNode => {
  const node = parse(rst);
  return node;
};
