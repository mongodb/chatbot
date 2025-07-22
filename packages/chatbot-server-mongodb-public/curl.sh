curl "http://localhost:3000/api/v1/responses" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "ORIGIN: foo" \
    -d '{
        "model": "mongodb-chat-latest",
        "input": "how to add a node.js driver to my nextjs app?",
        "stream": true
    }'