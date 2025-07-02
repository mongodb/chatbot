import { assertEnvVars } from "mongodb-rag-core";

const { 
  PROFOUND_API_URL, 
  PROFOUND_API_KEY, 
  PROFOUND_CATALOG_ID_EDU 
} = assertEnvVars({
  'PROFOUND_API_URL': "", 
  'PROFOUND_API_KEY': "",
  'PROFOUND_CATALOG_ID_EDU': "",
});

/**
 * The request body for fetching answers from the Profound API.
 *
 * Note: The `category_id` field is required by the Profound API, but is automatically
 * injected by the ProfoundApi class and should NOT be set by callers.
 */
export interface ProfoundAnswerRequestBody {
  start_date: string,
  end_date: string,
  filters?: { operator: string; field: string; value: string }[];
  include?: {
    prompt_id?: boolean,
    run_id?: boolean,
  }
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
      throw new Error('Profound API key is missing.');
    }
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST';
      body?: Record<string, unknown>;
    } = {}
  ): Promise<T> {
    const { method = 'POST', body } = options;
    const res = await fetch(
      `${this.baseUrl}${endpoint}?api_key=${this.apiKey}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: method === 'POST' && body ? JSON.stringify(body) : undefined
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

  async getAnswer({
    body
  }: {
    body: ProfoundAnswerRequestBody;
  }): Promise<ProfoundAnswerResponse> {
    return this.request<ProfoundAnswerResponse>('/prompts/answers', {
      method: 'POST',
      body: { ...body, category_id: PROFOUND_CATALOG_ID_EDU }
    });
  }

  async getModels(): Promise<ProfoundModel[]> {
    const models = await this.request<ProfoundModel[]>('/org/models', {
      method: 'GET'
    });
    return models;
  }
}
