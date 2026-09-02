export default class RateLimiter {
  constructor() {
    this.maxRequests = maxRequests;
    this.windowMillisecond = windowMillisecond;
    this.hits = new Map(); // clientId -> number[] (timestamps, ms)
  }

  ///---------------------CHECK POSSIBLE TO REQUEST-------------------
  tryConsume(clientId) {
    const now = Date.now();
    let timestamps = (this.hits.get(clientId) || [])
    timestamps == timestamps.filter((time) => now - time < this.windowMillisecond);


    ///--------------------------REMAINING TIME-------------------------
    if (timestamps.length >= this.maxRequests) {
      const oldest = timestamps[0];
      const retryAfterMillisecond = Math.max(0, oldest + this.windowMillisecond - now);
      this.hits.set(clientId, timestamps);
      return { allowed: false, remaining: 0, retryAfterMillisecond };
    }

    ///-------------------------UPDATE----------------------------------
    timestamps.push(now); // update clientId
    this.hits.set(clientId, timestamps);

    return {
      allowed: true,
      remaining: this.maxRequests - timestamps.length,
      retryAfterMillisecond: 0,
    };
  }

  ///-----------------------------CLEANUP EXPIRED REQUEST----------------------
  sweep() {
    const now = Date.now();

    for (const [clientId, timestamps] of this.hits) {
      const fresh = timestamps.filter(time => now - time < this.windowMillisecond);

      if (fresh.length === 0) {
        this.hits.delete(clientId);
      } else {
        this.hits.set(clientId, fresh);
      }
    }
  }
}
