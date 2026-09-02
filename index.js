const express = require("express");
const app = express(); 

app.use(express.json());

app.get("/health", (request, response) => {
  response.status(200).json({info:"helllo"})
});

const WINDOW_DURATION = 60 * 1000; // 1 minute
const WINDOW_REQUEST = 50;          // 50 requests per minute
const TIMEOUT = 2000;               // 2 second timeout

const requestLog = new Map();

function isRateLimited(clientId) {
  const now = Date.now();
  const recent = (requestLog.get(clientId) || []).filter(time => now - time < WINDOW_DURATION);
  if (recent.length >= WINDOW_REQUEST) {
    return true;
  }
  recent.push(now);
  requestLog.set(clientId, recent);
  return false;
}

app.post("/proxy", async (request, response) => {
  const {clientId, url, method, headers, body} = request.body;
  // console.log({clientId, url, method, headers, body});
  if (!clientId || !url || !method) {
    return response.status(400).json({error: "bad request on body request"});
  }
  let target; 
  try {
    target = new URL(url);
  } catch(error) {
    return response.status(400).json({error: "invalid url"});
  }
  // console.log(target);
  if (target.protocol !== "https:") {
    return response.status(400).json({error: "only https allowed"});
  }
  if (isRateLimited(clientId)) {
    return response.status(429).json({error: "rate limit to 50 request/minute"});
  }
  const controller = new AbortController(); 
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const upstreamResponse = await fetch(target, {method: method.toUpperCase(), headers: headers||{}, body: ["GET", "HEAD"].includes(method.toUpperCase()) ? undefined : body, signal: controller.signal});
    const responseBody = await upstreamResponse.text();
    // console.log("result", responseBody)
    return response.status(upstreamResponse.status).send(responseBody);

  } catch(error) {
    // console.log({error: error})    
    if (error.name === "AbortError") { // experience using https://httpbin.org/delay/10 to get delayed by 10 seconds
      return response.status(504).json({error: "upstream request time out"});
    }
    //TypeError
    return response.status(502).json({error: "failed to reach upstream server"})
  } finally {
    clearTimeout(timer);
  }
});

app.listen(3000, () => console.log("http://localhost:3000"));

