# Performance Tests

Performance tests for the Docs AI Chatbot.

Tests use [k6](https://k6.io/docs).

Note that running tests require installing k6, which is not an npm package,
even though it's run as JavaScript. Here's information on how to install k6 in your environment:
<https://k6.io/docs/get-started/installation/>. (k6 actually uses the [Goja](https://k6.io/docs/misc/glossary/#goja) JavaScript runtime to run JS from Go.)
