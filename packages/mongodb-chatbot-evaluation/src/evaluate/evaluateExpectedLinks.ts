/**
  Evaluates if the final assistant message contains the expected links.
  Skips if no `expectedLinks` in the test case data.

  The evaluation checks if each actual link one of the `expectedLink` values
  as a  **substring**. This is to allow for the base URL of the link to change.
  This is possible if the documentation you're testing against is versioned,
  so that the link might update.
  For example, if the `expectedLinks` includes `["link1", "link2" ]`,
  this would match for the actual links of `["https://mongodb.com/foo/v1/link1", "https://docs.mongodb.com/foo/v2/link2"]`.

  The eval result is the portion of the `expectedLinks` that are present in the final assistant message.
  For example, if the `expectedLinks` are `["link1", "link2" ]`
  and the final assistant message only contains `["link1"]`, the eval `result: .5`.

 */
export function evaluateExpectedLinks() {
  // TODO: implement
}
