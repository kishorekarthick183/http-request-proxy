const VALID_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);
class ValidationError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "ValidationError";
    this.status = 400;
    this.code = code;
  }
}
function validateProxyRequest(payload) {
  ///-----------------------PAYLOAD----------------------------------------------
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new `ValidationError`("request body must be a json object", "INVALID_PAYLOAD");
  }
  const { clientId, url, method, headers, body } = payload;

  ///-----------------------CLIENT ID------------------------------------------------
  if (typeof clientId !== "string" || clientId.trim().length === 0) {
    throw new ValidationError("clientId is required and must be a non-empty string", "INVALID_CLIENT_ID");
  }

  ///------------------------URL-------------------------------------------------
  if (typeof url !== "string" || url.trim().length === 0) {
    throw new ValidationError("url is required and must be a non-empty string", "INVALID_URL");
  }
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new ValidationError("url is not a well formed url", "INVALID_URL");
  }
  if (parsedUrl.protocol !== "https:") {
    throw new ValidationError("Only HTTPS URLs may be proxied", "NON_HTTPS_URL");
  }

  ///-------------------------METHOD-------------------------------------------
  if (typeof method !== "string" || !VALID_METHODS.has(method.toUpperCase())) {
    throw new ValidationError(
      `method must be one of: ${[...VALID_METHODS].join(", ")}`,
      "INVALID_METHOD",
    );
  }

  //--------------------------HEADERS--------------------------------------------
  let normalizedHeaders = {};
  if (headers !== undefined) {
    if (typeof headers !== "object" || headers === null || Array.isArray(headers)) {
      throw new ValidationError("headers must be a json object", "INVALID_HEADERS");
    }
    for (const [key, value] of Object.entries(headers)) {
      if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
        throw new ValidationError(`header "${key}" must have a string value`, "INVALID_HEADERS");
      }
    }
    normalizedHeaders = headers;
  }

  //---------------------------BODY-----------------------------------------------
  if (body !== undefined && typeof body !== "string") {
    throw new ValidationError("body must be a string", "INVALID_BODY");
  }
  const upperMethod = method.toUpperCase();
  if (body !== undefined && (upperMethod === "GET" || upperMethod === "HEAD")) {
    throw new ValidationError(`${upperMethod} requests must not include a body`, "BODY_NOT_ALLOWED");
  }

  return {
    clientId: clientId.trim(),
    url: parsedUrl,
    method: upperMethod,
    headers: normalizedHeaders,
    body,
  };
}

export default function validateProxyRequestMiddleware(request, _, next) {
  try {
    request.proxyRequest = validateProxyRequest(request.body);
    next();
  } catch(error) {
    next(error);
  }
}