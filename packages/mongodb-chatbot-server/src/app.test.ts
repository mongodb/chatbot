import express, { Express } from "express";
import request from "supertest";
import { errorHandler, makeApp, makeHandleTimeoutMiddleware } from "./app";

import { makeTestAppConfig } from "./test/testHelpers";

describe("App", () => {
  let app: Express;
  beforeAll(async () => {
    const { appConfig } = await makeTestAppConfig();
    app = await makeApp({
      ...appConfig,
      corsOptions: {
        origin: ["http://localhost:3000", "http://example.com"],
      },
    });
  });

  describe("Error handling", () => {
    test("Should return 404 if path is not found", async () => {
      const response = await request(app).get("/not-a-real-path");
      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
        error: "Not Found",
      });
    });
    test("Should return 500 if there is an unexpected error", async () => {
      const errorApp = express();
      errorApp.get("/error", (_req, _res, next) => {
        try {
          throw new Error("Unexpected error");
        } catch (e) {
          return next(e);
        }
      });
      errorApp.use(errorHandler);

      const response = await request(errorApp).get("/error");

      expect(response.status).toBe(500);
      expect(response.body).toStrictEqual({
        error: "Unexpected error",
      });
    });

    test("should return 504 if there is a response timeout", async () => {
      const shortTimeOut = 1000; // Create a short timeout for testing purposes
      // make a mock app with the timeout middleware
      const timeoutApp = express();
      timeoutApp.use(makeHandleTimeoutMiddleware(shortTimeOut / 10));
      timeoutApp.get("/response-timeout-test", (_req, res, _next) => {
        setTimeout(() => {
          if (!res.headersSent) {
            return res.send("ok");
          }
        }, shortTimeOut);
      });

      const response = await request(timeoutApp).get("/response-timeout-test");
      expect(response.status).toBe(504);
      expect(response.body).toStrictEqual({
        error: "Response timeout",
      });
    });
  });
  describe("CORS handling", () => {
    const ipAddress = "";
    test("should include the correct CORS headers", async () => {
      const res = await request(app)
        .post("/api/v1/conversations/")
        .set("Origin", "http://example.com")
        .set("X-FORWARDED-FOR", ipAddress);

      expect(res.header["access-control-allow-origin"]).toBe(
        "http://example.com"
      );
      expect(res.status).toBe(200);
    });

    test("should not allow unauthorized origin", async () => {
      const res = await request(app)
        .post("/api/v1/conversations")
        .set("Origin", "http://unauthorized.com")
        .set("X-FORWARDED-FOR", ipAddress)
        .send();

      expect(res.header["Access-Control-Allow-Origin"]).toBeUndefined();
      expect(res.status).toBe(200);
    });
    test("should include additional routes", async () => {
      const res = await request(app).get("/hello").send();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ foo: "bar" });
    });
  });
});
