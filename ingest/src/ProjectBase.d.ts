/**
 * Base project type used in all project data sources (snooty sites, devcenter, etc.)
 */
export interface ProjectBase<T extends string> {
  /**
   * Type of project
   * @example "snooty" | "devcenter"
   */
  type: T;
  /**
   * Snooty project name
   * @example "kotlin"
   */
  name: string;
  /**
   * Tags to include in all documents from the site in the embedded_content collection
   * @example ["kotlin", "docs", "driver"]
   */
  tags?: string[];
}
