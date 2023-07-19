/**
 * Base project type used in all project data sources (snooty sites, devcenter, etc.)
 */
export interface ProjectBase {
  type: string;
  name: string;
  tags?: string[];
}
