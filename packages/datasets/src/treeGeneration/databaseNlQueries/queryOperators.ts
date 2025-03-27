/**
  Frequency of operators used. Based on internal dataset.
 */
export type Frequency = "uncommon" | "common" | "most_common" | "not_defined";

export const operators: Record<string, Frequency> = {
  $eq: "most_common",
  $and: "most_common",
  $match: "most_common",
  $group: "most_common",
  $in: "most_common",
  $gte: "most_common",
  $cond: "most_common",
  $lte: "most_common",
  $not: "common",
  $or: "common",
  $gt: "common",
  $lt: "common",
  $first: "common",
  $convert: "common",
  $ne: "common",
  $divide: "common",
  $ifNull: "common",
  $arrayElemAt: "common",
  $addToSet: "common",
  $max: "uncommon",
  $multiply: "uncommon",
  $objectToArray: "uncommon",
  $bsonSize: "uncommon",
  $map: "uncommon",
  $concat: "uncommon",
  $dateToString: "uncommon",
  $concatArray: "uncommon",
  $min: "uncommon",
  $meta: "uncommon",
  $add: "uncommon",
};

/**
  Target minimum and maximum representation of operators in the dataset based on their frequency.
 */
export const representationInDatasetByCommonality: Record<
  Frequency,
  [min: number, max: number]
> = {
  most_common: [0.2, 1],
  common: [0.01, 0.3],
  uncommon: [0.0001, 0.05],
  not_defined: [0, 1],
};
