// Send a successful JSON response.
const sendSuccess = (res, statusCode, data) => {
  return res.status(statusCode).json(data);
};

// Send a consistent JSON error response.
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({ error: message });
};

// Keep server/internal details out of client responses.
const sendControllerError = (res, err, fallbackStatusCode = 400) => {
  const statusCode = err.statusCode || fallbackStatusCode;

  if (statusCode >= 500) {
    console.error(err);
    return sendError(res, statusCode, "Internal server error.");
  }

  return sendError(res, statusCode, err.message);
};

module.exports = {
  sendControllerError,
  sendSuccess,
  sendError,
};
