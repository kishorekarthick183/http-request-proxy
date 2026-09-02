
## What does the proxy need to do?

At a high level, the service needs to:

- Validate the incoming request.
- Make a request to the given HTTPS URL.
- Use the given HTTP method (GET, POST, etc.).
- Forward the given headers.
- Forward the given body.
- Return the target server's response to the client.
- Retry failed requests up to 3 times where appropriate.
- Allow each client to make at most 50 requests per minute.
- Timeout requests that take more than 5 seconds.
- Return proper HTTP status codes when something goes wrong.

## Functional Requirements

1. Accept the following parameters for an HTTPS request:
   - **ClientID**
   - **URL**
   - **Headers** (JSON object)
   - **HTTP Request Type**
   - **Request Body** (String)
2. Return appropriate HTTP status codes when the request is malformed.
3. Using the parameters provided, make a request to the URL with the appropriate headers and body set. Retrieve the response and return it back to the proxy client as an HTTP response.
4. Reject requests for invoking non-HTTPS URLs.

## Non-Functional Requirements

1. **Rate limiting** — Every client is allowed up to **50 requests per minute**. Additional requests within the time window are rejected with an appropriate status code.
2. **Timeout** — If a request takes longer than **5 seconds**, it must be timed out and the client informed accordingly.
3. **Resilience** — Failed requests should be retried up to **3 times** where appropriate.
4. **Version control** — The project must be a **git project (local git)**, so the solution's evolution is visible through commit history.

**Languages allowed:** NodeJS, Java, Python, GoLang, Ruby (any of the above, no other restrictions).

## Running & testing

```bash
# Spam requests against a live test endpoint
./cmd.sh   # hits https://httpbin.org/get
```

## TODOs

- [ ] Add tests for the test file itself
- [ ] Split into separate repositories
- [ ] Add debug info and test coverage via shell scripts
- [ ] Add constants via environment variables use dotenv