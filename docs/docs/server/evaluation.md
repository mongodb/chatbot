# Evaluation

:::info Work in Progress

This guide is a work in progress. Currently, it just contains
the minimum information to get started writing evals
against the MongoDB Responses API

:::

This guide contains information about writing evaluations against the [MongoDB Responses API](./responses-api.md).

When developing against the Responses API, you should write evaluations to understand the quality of your AI system and iteratively improve it.

## Do Not Use Sensitive Customer Data in Evaluations

NEVER use sensitive customer data in your evaluations. Period. 

Use either fake data or anonymize real customer data, in line with information security best practices.
If you are not sure if you can use some data, assume that you cannot.
Reach out to the Information Security team with any questions about data usage.

## Evaluation API

To run evaluations against the MongoDB Responses API, use the following base endpoint:

```
https://chat-server.docs.staging.corp.mongodb.com/api/v1/
```

This endpoint bypasses the Web Application Firewall (WAF) and CloudFront protections that we have on the standard staging API, `http://knowledge.staging.corp.mongodb.com/`, and the production API `http://knowledge.mongodb.com/`. Do not run evaluations against these APIs. You will get `4XX` errors from CloudFront!

To use the evaluation API, you must authenticate. Refer to the following section for authentication information.

### Authentication

:::info Intentionally Vague

This section is intentionally a bit vague because this docs site is currently on the public internet, and we do not want to expose much information on our internal authentication systems. Sorry!

If you have any questions, [contact the Education AI team](../contact.md).

:::

Unlike the standard staging/production APIs, you must authenticate into the evaluation API. Authenticate with the header `X-Kanopy-Authorization: Bearer {{authToken}}`.

You can use the `kanopy-oidc` utility to get an auth token:

```sh
kanopy-oidc login
```

Minimal example with curl:

```sh
curl -i -X POST https://chat-server.docs.staging.corp.mongodb.com/api/v1/ \
-H "X-Kanopy-Authorization: Bearer $(kanopy-oidc login)"
```

If **authentication works**, you should receive a `200` response resembling:

```
HTTP/2 200 
...other stuff

event: error
data: {"status":400,"headers":{},"requestID":null,"error":{"type":"error","code":"invalid_request_error","message":"Path: body.model - Required | Path: body.input - Invalid input | Path: body.stream - Required","name":"Error"},"code":"invalid_request_error","param":null,"type":"error","sequence_number":0}
```

If **authentication does not work**, you should receive a `302` response resembling:

```
HTTP/2 302 
...other stuff

<a href="https://login.corp.mongodb.com/login?redirect=https%3A%2F%2Fchat-server.docs.staging.corp.mongodb.com%2Fapi%2Fv1%2F">Found</a>.
```

The response is `302` because its redirecting you to login through a UI,
which you cannot do when programmatically running evals.

You can programmatically inject the token into locally-run evaluations with an environment variable:

```sh
MY_ENV_VAR=$(kanopy-oidc login) npx braintrust eval path/to/some.eval.ts
```

### Evaluation in CI/CD

:::info Coming Soon

Sorry, not yet 😢
:::

Currently, you cannot run evaluations in a CI/CD environment. We will add this feature after we complete a migration of our server to a new environment.

## Braintrust Evaluation Platform

We use [Braintrust](https://www.braintrust.dev/home) as an evaluation platform as a service. You can run evaluations in it. To learn more about Braintrust, refer to its official documentation, https://braintrust.com/docs.

To set up Braintrust, [contact the Education AI team](../contact.md). The Education AI team will:

 - [ ] Add you to Slack channel `#ext-braintrust-mongodb`. You can talk to the Braintrust team in this channel or get any necessary support. 
 - [ ] Create a permission group and project in the `mongodb-education-ai` Braintrust organization for your team to use. In your team's project you can [run evaluations](#run-evaluations).
 - [ ] Add you as a viewer to the [Responses API staging tracing](#responses-api-staging-tracing). This way you can see what is happening on the MongoDB responses API when you make requests to it.

### Run Evaluations

Run evaluations for your application's use of the Responses API using the Braintrust SDK. For more information on using the SDK, refer to the SDK documentation, https://www.braintrust.dev/docs/start/eval-sdk. 

To see some example evaluations, refer to the evaluation suite that the Responses API uses internally, [`conversations.eval.ts`](https://github.com/mongodb/chatbot/blob/main/packages/chatbot-server-mongodb-public/src/conversations.eval.ts).


### Responses API Staging Tracing

When evaluating your AI application that uses the MongoDB Responses API,
it can be useful to see what's happening inside the Responses API. 

All calls to the staging Responses API are traced by default. Tracing is only disabled if you set the body param `store: true`. You should **never** set `store: true` in your evaluations.

To access the staging API traces, go to the [chatbot-responses-staging Logs in Braintrust](https://www.braintrust.dev/app/mongodb-education-ai/p/chatbot-responses-staging/logs).