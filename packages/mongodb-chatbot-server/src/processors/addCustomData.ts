import { Request, Response } from "express";

export type RequestCustomData = Record<string, unknown> | undefined;

/**
  Function to add custom data to the {@link Conversation} or content search Request persisted to the database.
  Has access to the Express.js request and response plus the values
  from the {@link Response.locals} object.
 */
export type AddCustomDataFunc = (
  request: Request,
  response: Response
) => Promise<RequestCustomData>;

const addIpToCustomData: AddCustomDataFunc = async (req) =>
  req.ip
    ? {
        ip: req.ip,
      }
    : undefined;

const addOriginToCustomData: AddCustomDataFunc = async (_, res) =>
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

const ORIGIN_RULES: OriginRule[] = [
  { regex: /learn\.mongodb\.com/, code: "LEARN" },
  { regex: /mongodb\.com\/developer/, code: "DEVELOPER" },
  { regex: /mongodb\.com\/docs/, code: "DOCS" },
  { regex: /mongodb\.com\//, code: "DOTCOM" },
  { regex: /google-gemini-code-assist/, code: "GEMINI_CODE_ASSIST" },
  { regex: /vscode-mongodb-copilot/, code: "VSCODE" },
];

function getOriginCode(origin: string): OriginCode {
  for (const rule of ORIGIN_RULES) {
    if (rule.regex.test(origin)) {
      return rule.code;
    }
  }
  return "OTHER";
}

const addOriginCodeToCustomData: AddCustomDataFunc = async (_, res) => {
  const origin = res.locals.customData.origin;
  return typeof origin === "string" && origin.length > 0
    ? {
        originCode: getOriginCode(origin),
      }
    : undefined;
};

const addUserAgentToCustomData: AddCustomDataFunc = async (req) =>
  req.headers["user-agent"]
    ? {
        userAgent: req.headers["user-agent"],
      }
    : undefined;

export type AddDefinedCustomDataFunc = (
  ...args: Parameters<AddCustomDataFunc>
) => Promise<Exclude<RequestCustomData, undefined>>;

export const addDefaultCustomData: AddDefinedCustomDataFunc = async (req, res) => {
  return {
    ...(await addIpToCustomData(req, res)),
    ...(await addOriginToCustomData(req, res)),
    ...(await addOriginCodeToCustomData(req, res)),
    ...(await addUserAgentToCustomData(req, res)),
  };
};
