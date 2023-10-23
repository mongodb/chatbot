/**
  API Spec stored in the DB in the "api_pages" collection.
 */
export interface ApiPage {
  /**
    API spec
   */
  spec: Record<string, unknown>;
  name: string;
  url: string;
}
