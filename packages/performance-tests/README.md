# Performance Tests

Performance tests for the Docs AI Chatbot.

Tests use [k6](https://k6.io/docs).

Note that running tests requires installing k6, which is not an npm package,
even though it's run as JavaScript. Here's information on how to install k6 in your environment:
<https://k6.io/docs/get-started/installation/>. (k6 actually uses the [Goja](https://k6.io/docs/misc/glossary/#goja) JavaScript runtime to run JS from Go.)

## Chat Server Staging Load Test

To run the chat server load test, we need to do some kinda funky Kubernetes work to bypass the WAF/CDN
which protect against spamming the server from a single origin.

First set up Kubernetes port forwarding to forward the pod to a local port as such:

```shell
kubectl port-forward <pod name (can get via kubectl)> 3000
```

Then run the dev script:

```shell
npm run test:serverLoad:dev
```

Now, instead of going to a local server running on port 3000,
it's routing traffic to Kubernetes.
