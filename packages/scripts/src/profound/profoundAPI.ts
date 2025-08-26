import { getEnv } from "mongodb-rag-core";

const env = getEnv({
  optional: {
    PROFOUND_API_URL: "https://api.tryprofound.com/v1",
  },
});

/**
 The request body for fetching answers from the Profound API.
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
  asset: unknown;
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
  private readonly baseUrl = env.PROFOUND_API_URL;
  private readonly apiKey: string;

  constructor({ apiKey }: { apiKey: string }) {
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
      const json = await this.request<{
        info?: { total_rows: number };
        data?: any[];
      }>(endpoint, { method: "POST", body: paginatedBody });
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
    categoryId,
  }: {
    body: ProfoundAnswerRequestBody;
    categoryId: string;
  }): Promise<ProfoundAnswerResponse> {
    return this.paginatedRequest<ProfoundAnswerResponse>("/prompts/answers", {
      ...body,
      category_id: categoryId,
    });
  }

  async getModels(): Promise<ProfoundModel[]> {
    const models = await this.request<ProfoundModel[]>("/org/models", {
      method: "GET",
    });
    return models;
  }
}
