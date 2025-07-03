import { assertEnvVars } from "mongodb-rag-core";

const { PROFOUND_API_URL, PROFOUND_API_KEY, PROFOUND_CATALOG_ID_EDU } =
  assertEnvVars({
    PROFOUND_API_URL: "",
    PROFOUND_API_KEY: "",
    PROFOUND_CATALOG_ID_EDU: "",
  });

/**
 The request body for fetching answers from the Profound API.
 
 Note: The `category_id` field is required by the Profound API, but is automatically
 injected by the ProfoundApi class and should NOT be set by callers.
 */
export interface ProfoundAnswerRequestBody {
  start_date: string;
  end_date: string;
  filters?: { operator: string; field: string; value: string }[];
  include?: {
    prompt_id?: boolean;
    run_id?: boolean;
  };
}
export interface ProfoundAnswer {
  created_at: string;
  prompt: string;
  prompt_id: string; // unique prompt identifier
  mentions: string[];
  prompt_type: string;
  response: string;
  run_id: string; // unique response identifier
  citations: string[];
  themes: string[];
  topic: string;
  region: string;
  model: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asset: null | any;
}

export interface ProfoundAnswerResponse {
  info: {
    total_rows: number;
  };
  data: ProfoundAnswer[];
}

export interface ProfoundModel {
  id: string;
  name: string;
}

export class ProfoundApi {
  private readonly baseUrl = PROFOUND_API_URL;
  private readonly apiKey: string;

  constructor(apiKey: string = PROFOUND_API_KEY!) {
    if (!apiKey) {
      throw new Error("Profound API key is missing.");
    }
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: "GET" | "POST";
      body?: Record<string, unknown>;
    } = {}
  ): Promise<T> {
    const { method = "POST", body } = options;
    const res = await fetch(
      `${this.baseUrl}${endpoint}?api_key=${this.apiKey}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: method === "POST" && body ? JSON.stringify(body) : undefined,
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Profound API error: ${res.status} ${res.statusText} - ${errorText}`
      );
    }

    return res.json();
  }

  private async paginatedRequest<T>(
    endpoint: string,
    body: Record<string, any> = {},
    maxLimit = 50000 // Limit set by Profound
  ): Promise<T> {
    let offset = 0;
    const limit = maxLimit;
    let allData: any[] = [];
    let totalRows: number | undefined = undefined;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      console.log(`Requesting the next ${limit} records, offset by ${offset}`);
      const paginatedBody = {
        ...body,
        pagination: { limit, offset },
      };
      const res = await fetch(
        `${this.baseUrl}${endpoint}?api_key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paginatedBody),
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Profound API error: ${res.status} ${res.statusText} - ${errorText}`
        );
      }
      const json = await res.json();
      if (totalRows === undefined) totalRows = json.info?.total_rows;
      allData = allData.concat(json.data || []);
      const effectiveTotalRows = totalRows ?? allData.length;
      if (
        (json.data?.length ?? 0) < limit ||
        allData.length >= effectiveTotalRows
      )
        break;
      offset += limit;
    }

    // Return the same structure as a single response, but with all data
    return {
      ...body,
      info: { total_rows: totalRows ?? allData.length },
      data: allData,
    } as T;
  }

  async getAnswers({
    body,
  }: {
    body: ProfoundAnswerRequestBody;
  }): Promise<ProfoundAnswerResponse> {
    return this.paginatedRequest<ProfoundAnswerResponse>("/prompts/answers", {
      ...body,
      category_id: PROFOUND_CATALOG_ID_EDU,
    });
  }

  async getModels(): Promise<ProfoundModel[]> {
    const models = await this.request<ProfoundModel[]>("/org/models", {
      method: "GET",
    });
    return models;
  }
}
