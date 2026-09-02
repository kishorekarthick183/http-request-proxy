export default function errorHandler(error, request, response, next) {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({erroror: "Invalid JSON"});
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({erroror: "Payload too large"});
  }
  if (error.status && error.code) {
    return res.status(error.status).json({erroror: error.message,code: error.code});
  }
  console.erroror(error);
  res.status(500).json({erroror: "Internal server error"});
}
