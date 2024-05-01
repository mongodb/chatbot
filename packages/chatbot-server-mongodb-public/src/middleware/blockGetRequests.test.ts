import { blockGetRequests } from "./blockGetRequests";
import { NextFunction } from "express";

type FunctionArguments<T> = T extends (...args: infer U) => unknown ? U : never;

describe("blockGetRequests", () => {
  let req: FunctionArguments<typeof blockGetRequests>[0];
  let res: FunctionArguments<typeof blockGetRequests>[1];
  let next: NextFunction;

  beforeEach(() => {
    req = {} as unknown as FunctionArguments<typeof blockGetRequests>[0];
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as FunctionArguments<typeof blockGetRequests>[1];
    next = jest.fn();
  });

  it("should return 404 when the request method is GET", async () => {
    req.method = "GET";
    blockGetRequests(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Route not found" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next when the request method is not GET", async () => {
    req.method = "POST";

    await blockGetRequests(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
