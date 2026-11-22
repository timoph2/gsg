import { describe, expect, it } from "vitest";
import {
  MAX_REQUEST_BODY_BYTES,
  rateLimitResponse,
  readJsonBody,
} from "../src/server/api-guards";

describe("API request guards", () => {
  it("accepts a JSON request within the body-size limit", async () => {
    const request = new Request("http://localhost/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Mary" }),
    });

    await expect(readJsonBody(request)).resolves.toEqual({ name: "Mary" });
  });

  it("rejects requests over the body-size limit", async () => {
    const request = new Request("http://localhost/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "x".repeat(MAX_REQUEST_BODY_BYTES) }),
    });

    await expect(readJsonBody(request)).rejects.toMatchObject({
      status: 413,
      message: "Request body must not exceed 16 KB",
    });
  });

  it("requires the JSON content type", async () => {
    const request = new Request("http://localhost/api/teachers", {
      method: "POST",
      body: "{}",
    });

    await expect(readJsonBody(request)).rejects.toMatchObject({
      status: 415,
      message: "Content-Type must be application/json",
    });
  });

  it("returns a JSON 429 response after 60 requests per minute", async () => {
    const ip = `192.0.2.${Math.floor(Math.random() * 255)}`;
    const makeRequest = () =>
      new Request("http://localhost/api/teachers", {
        headers: { "x-real-ip": ip },
      });

    for (let i = 0; i < 60; i++) {
      expect(rateLimitResponse(makeRequest())).toBeNull();
    }

    const response = rateLimitResponse(makeRequest());
    expect(response?.status).toBe(429);
    expect(response?.headers.get("Retry-After")).toBeTruthy();
    await expect(response?.json()).resolves.toEqual({
      error: "Too many requests. Please try again later.",
    });
  });
});
