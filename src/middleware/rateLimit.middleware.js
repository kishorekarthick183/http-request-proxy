import RateLimiter from "../rateLimiter";
import { RATE_LIMIT_WINDOW_MS } from "../config";

const rateLimiter = new RateLimiter();
const sweepInterval = setInterval(() => rateLimiter.sweep(), RATE_LIMIT_WINDOW_MS);
sweepInterval.unref();

export default function rateLimit(request,response,NextFunction) {
  const { clientId } = request.proxyRequest;
  const result = rateLimiter.tryConsume(clientId);
  if (!result.allowed) {
    response.set("Retry-After",Math.ceil(result.retryAfterMs / 1000).toString()).status(429).json({error: "too many requests: max 50 requests per minute per clientId"});
    return;
  }
  next();
}
