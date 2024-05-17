import { hello } from "../apis/conversations/server";

export interface ChatbotApiServer {
  hello: string;
}

export interface MakeChatbotApiServerArgs {
  hello?: string;
}

export function makeChatbotApiServer(args: MakeChatbotApiServerArgs): ChatbotApiServer {
  return {
    hello: args.hello ?? hello,
  };
}
