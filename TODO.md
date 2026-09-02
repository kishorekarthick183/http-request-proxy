# HTTP Request Proxy Service

## What this project is about?

We need to build a simple **HTTP Request Proxy Service**.

The basic idea is:

> A client sends us information about an HTTP request, and our service makes that request to another server and returns the response.

### Example

The client sends:

```json
{
  "clientId": "client-123",
  "url": "https://example.com/api",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"name\":\"John\"}"
}
```

Our proxy receives this request and does:
```
Client
   |
   | Request details
   v
Proxy Service
   |
   | Makes the actual HTTPS request
   v
Target Server
   |
   | Response
   v
Proxy Service
   |
   | Returns response
   v
Client

```
## What does the proxy need to do?

### The service needs to:

- Validate the request.
- Make a request to the given HTTPS URL.
- Use the given HTTP method (GET, POST, etc.).
- Forward the given headers.
- Forward the given body.
- Return the target server's response to the client.
- Retry failed requests up to 3 times where appropriate.
- Allow each client to make at most 50 requests per minute.
- Timeout requests that take more than 5 seconds.
- Return proper HTTP status codes when something goes wrong.