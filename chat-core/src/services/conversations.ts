/**
 * A formatted reference for an assistant message.
 *
 * For example, a Reference might be a docs page, dev center article, or
 * a MongoDB University module.
 */
export type Reference = {
  url: string;
  title: string;
};

export type References = Reference[];
