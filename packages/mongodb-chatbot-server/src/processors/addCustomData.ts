import { Request, Response } from "express";

/**
  Function to add custom data to the {@link Conversation} or {@link ContentSearch} persisted to the database.
  Has access to the Express.js request and response plus the {@link ConversationsRouterLocals} or {@link ContentRouterLocals}
  from the {@link Response.locals} object.
  TLocals is the type of res.locals for the router
 */

export type AddCustomDataFunc<
  TLocals extends Record<string, any>,
  TCustomData = Record<string, unknown>
> = (
  request: Request,
  response: Response<any, TLocals>
) => Promise<TCustomData | undefined>;

export const addIpToCustomData: AddCustomDataFunc<Record<string, any>> = async (req) =>
  req.ip
    ? {
        ip: req.ip,
      }
    : undefined;

export const addOriginToCustomData: AddCustomDataFunc<Record<string, any>> = async (
  _,
  res
) =>
  res.locals.customData.origin
    ? {
        origin: res.locals.customData.origin,
      }
    : undefined;

export const originCodes = [
  "LEARN",
  "DEVELOPER",
  "DOCS",
  "DOTCOM",
  "GEMINI_CODE_ASSIST",
  "VSCODE",
  "OTHER",
] as const;

export type OriginCode = (typeof originCodes)[number];

interface OriginRule {
  regex: RegExp;
  code: OriginCode;
}

export const ORIGIN_RULES: OriginRule[] = [
  { regex: /learn\.mongodb\.com/, code: "LEARN" },
  { regex: /mongodb\.com\/developer/, code: "DEVELOPER" },
  { regex: /mongodb\.com\/docs/, code: "DOCS" },
  { regex: /mongodb\.com\//, code: "DOTCOM" },
  { regex: /google-gemini-code-assist/, code: "GEMINI_CODE_ASSIST" },
  { regex: /vscode-mongodb-copilot/, code: "VSCODE" },
];

export function getOriginCode(origin: string): OriginCode {
  for (const rule of ORIGIN_RULES) {
    if (rule.regex.test(origin)) {
      return rule.code;
    }
  }
  return "OTHER";
}

export const addOriginCodeToCustomData: AddCustomDataFunc<
  Record<string, any>
> = async (_, res) => {
  const origin = res.locals.customData.origin;
  return typeof origin === "string" && origin.length > 0
    ? {
        originCode: getOriginCode(origin),
      }
    : undefined;
};

export const addUserAgentToCustomData: AddCustomDataFunc<Record<string, any>> = async (
  req
) =>
  req.headers["user-agent"]
    ? {
        userAgent: req.headers["user-agent"],
      }
    : undefined;
