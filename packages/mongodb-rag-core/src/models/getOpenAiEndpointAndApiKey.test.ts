import { getGcpAccessToken } from "./getOpenAiEndpointAndApiKey";

describe.skip("getGcpAccessToken", () => {
  jest.setTimeout(100000);
  test("should return an access token", async () => {
    const accessToken = await getGcpAccessToken();
    expect(accessToken).toBeDefined();
  });
});
