// Send a successful JSON response.
const sendSuccess = (res, statusCode, data) => {
  return res.status(statusCode).json(data);
};

// Send a consistent JSON error response.
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({ error: message });
};

module.exports = {
  sendSuccess,
  sendError,
};
