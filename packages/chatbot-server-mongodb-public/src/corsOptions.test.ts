import express from "express";
import cors from "cors";
import request from "supertest";
import { makeCorsOptions } from "./corsOptions";

describe("makeCorsOptions", () => {
  const createTestApp = (
    isProduction: boolean,
    allowedOrigins: string[] = []
  ) => {
    const app = express();
    const corsOptions = makeCorsOptions(isProduction, allowedOrigins);

    app.use(cors(corsOptions));

    // Simple test endpoint
    app.post("/test", (_req, res) => {
      res.json({ message: "success" });
    });

    return app;
  };

  describe("Non-production mode", () => {
    let app: express.Express;

    beforeEach(() => {
      app = createTestApp(false, ["https://trusted-site.com"]);
    });

    it("should allow localhost origins", async () => {
      const response = await request(app)
        .post("/test")
        .set("Origin", "http://localhost:3000")
        .send({ data: "test" });

      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:3000"
      );
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
      expect(response.status).toBe(200);
    });

    it("should allow localhost with different ports", async () => {
      const response = await request(app)
        .post("/test")
        .set("Origin", "http://localhost:8080")
        .send({ data: "test" });

      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:8080"
      );
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    });

    it("should allow 127.0.0.1 origins", async () => {
      const response = await request(app)
        .post("/test")
        .set("Origin", "http://127.0.0.1:3000")
        .send({ data: "test" });

      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://127.0.0.1:3000"
      );
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    });

    it("should allow requests with no origin (no CORS headers)", async () => {
      const response = await request(app).post("/test").send({ data: "test" });

      expect(response.status).toBe(200);
    });

    it("should allow origins from allowedOrigins array", async () => {
      const response = await request(app)
        .post("/test")
        .set("Origin", "https://trusted-site.com")
        .send({ data: "test" });

      expect(response.headers["access-control-allow-origin"]).toBe(
        "https://trusted-site.com"
      );
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    });

    it("should block non-localhost origins not in allowedOrigins", async () => {
      const response = await request(app)
        .options("/test")
        .set("Origin", "https://malicious-site.com")
        .set("Access-Control-Request-Method", "POST");

      // CORS blocking is indicated by missing allow-origin header
      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    });
  });

  describe("Production mode", () => {
    let app: express.Express;

    beforeEach(() => {
      app = createTestApp(true, [
        "https://production-site.com",
        "https://another-prod-site.com",
      ]);
    });

    it("should block localhost origins in production", async () => {
      const response = await request(app)
        .options("/test")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "POST");

      // CORS blocking is indicated by missing allow-origin header
      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    });

    it("should block 127.0.0.1 origins in production", async () => {
      const response = await request(app)
        .options("/test")
        .set("Origin", "http://127.0.0.1:3000")
        .set("Access-Control-Request-Method", "POST");

      // CORS blocking is indicated by missing allow-origin header
      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    });

    it("should only allow origins from allowedOrigins array", async () => {
      const response = await request(app)
        .post("/test")
        .set("Origin", "https://production-site.com")
        .send({ data: "test" });

      expect(response.headers["access-control-allow-origin"]).toBe(
        "https://production-site.com"
      );
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
      expect(response.status).toBe(200);
    });

    it("should block unknown origins in production", async () => {
      const response = await request(app)
        .options("/test")
        .set("Origin", "https://unknown-site.com")
        .set("Access-Control-Request-Method", "POST");

      // CORS blocking is indicated by missing allow-origin header
      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    });
  });

  describe("CORS preflight requests", () => {
    let app: express.Express;

    beforeEach(() => {
      app = createTestApp(false, ["https://trusted-site.com"]);
    });

    it("should handle OPTIONS requests for localhost", async () => {
      const response = await request(app)
        .options("/test")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "POST")
        .set("Access-Control-Request-Headers", "Content-Type");

      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:3000"
      );
      expect(response.headers["access-control-allow-methods"]).toMatch(/POST/);
      expect(response.headers["access-control-allow-headers"]).toMatch(
        /Content-Type/
      );
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
      expect(response.status).toBe(204);
    });

    it("should handle complex preflight with multiple headers", async () => {
      const response = await request(app)
        .options("/test")
        .set("Origin", "http://localhost:8080")
        .set("Access-Control-Request-Method", "POST")
        .set(
          "Access-Control-Request-Headers",
          "Content-Type, Authorization, X-Custom-Header"
        );

      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:8080"
      );
      expect(response.headers["access-control-allow-methods"]).toMatch(/POST/);
      expect(response.headers["access-control-allow-headers"]).toMatch(
        /Content-Type/
      );
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
      expect(response.status).toBe(204);
    });

    it("should include Vary header for Origin", async () => {
      const response = await request(app)
        .post("/test")
        .set("Origin", "http://localhost:3000")
        .send({ data: "test" });

      expect(response.headers["vary"]).toMatch(/Origin/i);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty allowedOrigins array", async () => {
      const app = createTestApp(false, []);

      const response = await request(app)
        .post("/test")
        .set("Origin", "http://localhost:3000")
        .send({ data: "test" });

      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:3000"
      );
      expect(response.status).toBe(200);
    });

    it("should handle multiple allowedOrigins in production", async () => {
      const app = createTestApp(true, [
        "https://site1.com",
        "https://site2.com",
        "https://site3.com",
      ]);

      const response1 = await request(app)
        .post("/test")
        .set("Origin", "https://site2.com")
        .send({ data: "test" });

      expect(response1.headers["access-control-allow-origin"]).toBe(
        "https://site2.com"
      );
      expect(response1.status).toBe(200);
    });
  });
});
