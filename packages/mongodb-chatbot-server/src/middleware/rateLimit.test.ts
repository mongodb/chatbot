import { makeRateLimit } from "./rateLimit";

describe("makeRateLimit", () => {
  it("should return a middleware function", () => {
    const middleware = makeRateLimit();

    expect(typeof middleware).toBe("function");
    expect(middleware.length).toBe(3); // Express middleware has 3 params: req, res, next
  });
});
