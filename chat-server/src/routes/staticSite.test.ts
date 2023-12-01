import request from "supertest";
import express from "express";
import { makeStaticSite } from "./staticSite";

test("should server static files", async () => {
  const app = express();
  makeStaticSite(app);
  const response = await request(app).get("/index.html");
  expect(response.status).toBe(200);
  expect(response.text).toContain("<!DOCTYPE html>");
});
