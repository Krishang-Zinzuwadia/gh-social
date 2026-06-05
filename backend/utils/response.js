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

// Translate common Supabase/Postgres errors into client-safe responses.
const sendSupabaseError = (res, error, options = {}) => {
  if (error.code === "PGRST116") {
    return sendError(res, 404, options.notFoundMessage || "Resource not found.");
  }

  if (error.code === "23505") {
    return sendError(res, 409, options.conflictMessage || "Resource already exists.");
  }

  if (error.code === "23502") {
    return sendError(
      res,
      400,
      options.missingRequiredMessage || "Request data is missing required fields."
    );
  }

  if (error.code === "23503") {
    return sendError(
      res,
      400,
      options.invalidReferenceMessage || "Request data references an invalid record."
    );
  }

  return sendControllerError(res, error, 500);
};

module.exports = {
  sendControllerError,
  sendSupabaseError,
  sendSuccess,
  sendError,
};
