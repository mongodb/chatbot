import { ObjectId } from "mongodb";
import { makeTestApp, makeTestAppConfig } from "../../test/testHelpers";
import request from "supertest";
import { DEFAULT_API_PREFIX } from "../../app";
const CONVERSATIONS_API_V1_PREFIX = DEFAULT_API_PREFIX + "/conversations";

describe("GET /conversations/:conversationId", () => {
  const { mongodb, appConfig, mongoClient, conversations } =
    makeTestAppConfig();

  afterAll(async () => {
    await mongodb.dropDatabase();
    await mongoClient.close();
  });

  it("should return 400 when the conversation ID is invalid", async () => {
    const notObjectId = "not-object-id";
    const { app, origin } = await makeTestApp(appConfig);
    const res = await request(app)
      .get(`${CONVERSATIONS_API_V1_PREFIX}/${notObjectId}`)
      .set("Origin", origin)
      .send();

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({
      error: "Invalid conversation ID",
    });
  });

  it("should return 200 and the conversation when the conversation is successfully retrieved", async () => {
    const convo = await conversations.create();
    const { app, origin } = await makeTestApp(appConfig);
    const res = await request(app)
      .get(`${CONVERSATIONS_API_V1_PREFIX}/${convo._id.toString()}`)
      .set("Origin", origin)
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("_id", convo._id.toString());
    expect(res.body).toHaveProperty("createdAt", convo.createdAt.getTime());
  });

  it("should return 404 when the conversation is not found", async () => {
    const noConvoObjectId = new ObjectId();
    const { app, origin } = await makeTestApp(appConfig);
    const res = await request(app)
      .get(`${CONVERSATIONS_API_V1_PREFIX}/${noConvoObjectId.toString()}`)
      .set("Origin", origin)
      .send();

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({
      error: "Conversation not found",
    });
  });
});
