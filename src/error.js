export class UpstreamTimeoutError extends Error {
  constructor(timeoutMs) {
    super(`Upstream request timed out after ${timeoutMs}ms`);
    this.name = 'UpstreamTimeoutError';
    this.status = 504;
    this.code = 'UPSTREAM_TIMEOUT';
  }
}

export class UpstreamRequestError extends Error {
  constructor(cause) {
    super(`Failed to reach upstream server: ${cause.message}`);
    this.name = 'UpstreamRequestError';
    this.status = 502;
    this.code = 'UPSTREAM_UNREACHABLE';
    this.cause = cause;
  }
}