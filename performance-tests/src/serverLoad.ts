import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 50, // Number of virtual users
  duration: "60s", // Duration of the test
};

const baseUrl = "http://localhost:3000/api/v1";
export default async function () {
  // First request to /user
  const conversationResponse = http.post(baseUrl + "/conversations");

  // Check the status code for the first request
  check(conversationResponse, {
    "status is 200 (created conversation)": (r) => r.status === 200,
  });

  // Parse the conversationResponse JSON
  const { _id } = JSON.parse(conversationResponse.body as string); //  tsc ERROR: Argument of type 'string | bytes | null' is not assignable to parameter of type 'string'. Type 'null' is not assignable to type 'string'.

  // create a message in the conversation
  const message = JSON.stringify({
    message: "What is MongoDB?",
  });
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const messageResponse = http.post(
    baseUrl + "/conversations/" + _id + "/messages",
    message,
    params
  );
  // // Check the status code for the second request
  check(messageResponse, {
    "status is 200 (responds with message)": (r) => r.status === 200,
    "contains message": (r) => JSON.parse(r.body as string).content,
  });

  sleep(1);
}
