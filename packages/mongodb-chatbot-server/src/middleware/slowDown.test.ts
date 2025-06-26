import { makeSlowDown } from "./slowDown";

describe("makeSlowDown", () => {
  it("should return a middleware function", () => {
    const middleware = makeSlowDown();

    expect(typeof middleware).toBe("function");
    expect(middleware.length).toBe(3); // Express middleware has 3 params: req, res, next
  });
});
