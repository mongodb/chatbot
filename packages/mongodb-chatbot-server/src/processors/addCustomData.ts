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
  /**
    Name used to label the origin when formatting the user message front matter. 
    Leave empty if no label should be used.
    */
  label?: string;
}

export const ORIGIN_RULES: OriginRule[] = [
  { regex: /learn\.mongodb\.com/, code: "LEARN" },
  { regex: /mongodb\.com\/developer/, code: "DEVELOPER" },
  { regex: /mongodb\.com\/docs/, code: "DOCS" },
  { regex: /mongodb\.com\//, code: "DOTCOM" },
  {
    regex: /google-gemini-code-assist/,
    code: "GEMINI_CODE_ASSIST",
    label: "Gemini Code Assist",
  },
  {
    regex: /vscode-mongodb-copilot/,
    code: "VSCODE",
    label: "MongoDB VS Code extension",
  },
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

export const addDefaultCustomData: AddDefinedCustomDataFunc = async (
  req,
  res
) => {
  console.log(
    "XYZ - 0.1",
    res.locals === null,
    res.locals === undefined,
    Object.keys(res.locals),
    JSON.stringify(res.locals)
  );
  const ipCustomData = await addIpToCustomData(req, res);
  console.log("XYZ - 0.2", ipCustomData);
  const originCustomData = await addOriginToCustomData(req, res);
  console.log("XYZ - 0.3", originCustomData);
  const originCodeCustomData = await addOriginCodeToCustomData(req, res);
  console.log("XYZ - 0.4", originCodeCustomData);
  const userAgentCustomData = await addUserAgentToCustomData(req, res);
  console.log("XYZ - 0.5", userAgentCustomData);
  return {
    ...ipCustomData,
    ...originCustomData,
    ...originCodeCustomData,
    ...userAgentCustomData,
  };
};
