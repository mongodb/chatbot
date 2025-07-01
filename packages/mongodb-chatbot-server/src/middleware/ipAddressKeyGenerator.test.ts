import { ipAddressKeyGenerator } from "./ipAddressKeyGenerator";
import { Request } from "express";

describe("ipAddressKeyGenerator", () => {
  it("should return the IP address when request.ip is defined", () => {
    const mockRequest = {
      ip: "192.168.1.1",
    } as Request;

    const result = ipAddressKeyGenerator(mockRequest);

    expect(result).toBe("192.168.1.1");
  });

  it("should return a different IP address for different requests", () => {
    const mockRequest1 = {
      ip: "10.0.0.1",
    } as Request;

    const mockRequest2 = {
      ip: "172.16.0.1",
    } as Request;

    const result1 = ipAddressKeyGenerator(mockRequest1);
    const result2 = ipAddressKeyGenerator(mockRequest2);

    expect(result1).toBe("10.0.0.1");
    expect(result2).toBe("172.16.0.1");
    expect(result1).not.toBe(result2);
  });

  it("should throw an error when request.ip is undefined", () => {
    const mockRequest = {
      ip: undefined,
    } as Request;

    expect(() => ipAddressKeyGenerator(mockRequest)).toThrow(
      "Request IP is not defined"
    );
  });

  it("should throw an error when request.ip is null", () => {
    const mockRequest = {
      ip: null,
    } as any as Request;

    expect(() => ipAddressKeyGenerator(mockRequest)).toThrow(
      "Request IP is not defined"
    );
  });

  it("should throw an error when request.ip is empty string", () => {
    const mockRequest = {
      ip: "",
    } as Request;

    expect(() => ipAddressKeyGenerator(mockRequest)).toThrow(
      "Request IP is not defined"
    );
  });
});
