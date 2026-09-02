import express from "express";
import validateProxyRequestMiddleware from "./middleware/validateProxyRequestMiddleware";
import  errorHandler from "./middleware/errorHandler";
import { MAX_BODY_BYTES, PORT, UPSTREAM_TIMEOUT_MS } from "./config";
import rateLimit from "./middleware/rateLimit.middleware";
import { UpstreamRequestError, UpstreamTimeoutError } from "./error";


const app = express(); 

sweepInterval.unref();

// parse body
app.use(express.json({limit: MAX_BODY_BYTES}));

app.get("/health", (_, response) => {
  response.status(200).json({ status: "ok" });
});

const STRIPPED_RESPONSE_HEADERS = new Set(['connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade', 'content-encoding', 'content-length']);

app.post('/proxy', validateProxyRequestMiddleware, rateLimit, async (request, response, next) => {
  const { url, method, headers, body } = request.proxyRequest;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const forwardResponse = await fetch(url.toString(), {method,headers,body,signal: controller.signal,redirect: 'follow'});
    const responseBody = await forwardResponse.text();
    const responseHeaders = {};
    forwardResponse.headers.forEach((value, key) => {
      if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });
    response.status(forwardResponse.status).set(responseHeaders).send(responseBody);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      next(new UpstreamTimeoutError(UPSTREAM_TIMEOUT_MS));
      return;
    }
    next(new UpstreamRequestError(error));
  } finally {
    clearTimeout(timer);
  }
});

// after all routes
app.use((_, response) => {response.status(404).json({ error: "route not found"});});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Request Proxy Service listening on port ${PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully`);
  clearInterval(sweepInterval);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
