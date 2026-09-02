module.exports = {
  PORT: process.env.PORT || 3000,
  RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 50,
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  UPSTREAM_TIMEOUT_MS: Number(process.env.UPSTREAM_TIMEOUT_MS) || 5000,
  MAX_BODY_BYTES: Number(process.env.MAX_BODY_BYTES) || 5 * 1024 * 1024, // 5MB
};
