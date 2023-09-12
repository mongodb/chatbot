import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 115, // Number of virtual users
  duration: "60s", // Duration of the test
};

// Used to bypass the WAF
const browserHeaders = {
  authority: "knowledge.staging.corp.mongodb.com",
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "no-cache",
  pragma: "no-cache",
  "sec-ch-ua":
    '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
};

const baseUrl = __ENV.BASE_URL;
if (baseUrl === undefined) {
  throw new Error(
    "BASE_URL is undefined. You must define BASE_URL in your environment."
  );
}
export default async function () {
  const ip = generateRandomIpV4();
  // First request to /user
  const conversationResponse = http.post(
    baseUrl + "/api/v1/conversations",
    undefined,
    {
      headers: { ...browserHeaders, "X-FORWARDED-FOR": ip },
    }
  );

  // Check the status code for the first request
  check(conversationResponse, {
    "status is 200 (created conversation)": (r) => r.status === 200,
  });
  sleep(2);

  // Parse the conversationResponse JSON
  const { _id } = JSON.parse(conversationResponse.body as string);

  // create a message in the conversation
  const message = JSON.stringify({
    message: "What is MongoDB?",
  });
  const params = {
    headers: {
      "Content-Type": "application/json",
      ...browserHeaders,
      "X-FORWARDED-FOR": ip,
    },
  };

  const messageResponse = http.post(
    baseUrl + "/api/v1/conversations/" + _id + "/messages",
    message,
    params
  );
  console.log("Message 1 response", messageResponse.body);
  // // Check the status code for the second request
  check(messageResponse, {
    "status is 200 (responds with message)": (r) => r.status === 200,
    // "contains message": (r) => JSON.parse(r.body as string).content,
  });
  sleep(10);
  const message2 = JSON.stringify({
    message: "Why use MongoDB?",
  });
  const messageResponse2 = http.post(
    baseUrl + "/api/v1/conversations/" + _id + "/messages",
    message2,
    params
  );
  console.log("Message 2 response", messageResponse.body);
  // Check the status code for the second request
  check(messageResponse2, {
    "status is 200 (responds with message 2)": (r) => r.status === 200,
    // "contains message": (r) => JSON.parse(r.body as string).content,
  });
  sleep(1);
}

function generateRandomIpV4() {
  const getRandomNumber = (max: number) => Math.floor(Math.random() * max);
  return `${getRandomNumber(256)}.${getRandomNumber(256)}.${getRandomNumber(
    256
  )}.${getRandomNumber(256)}`;
}
