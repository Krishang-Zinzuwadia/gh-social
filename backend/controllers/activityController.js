const activityService = require("../services/activityService");
const { sendError, sendSuccess } = require("../utils/response");

// Return every activity row.
const getAllActivity = async (_req, res) => {
  const { data, error } = await activityService.getAllActivity();

  if (error) {
    return sendError(res, 500, error.message);
  }

  return sendSuccess(res, 200, data);
};

// Return activity rows for a specific user.
const getUserActivity = async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await activityService.getUserActivity(userId);

  if (error) {
    return sendError(res, 500, error.message);
  }

  return sendSuccess(res, 200, data);
};

// Return saved activity rows for a specific user.
const getSavedActivity = async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await activityService.getSavedActivity(userId);

  if (error) {
    return sendError(res, 500, error.message);
  }

  return sendSuccess(res, 200, data);
};

// Return one activity row for a user and repo pair.
const getActivityByUserAndRepo = async (req, res) => {
  const { userId, repoId } = req.params;
  const { data, error } = await activityService.getActivityByUserAndRepo(userId, repoId);

  if (error) {
    return sendError(res, 500, error.message);
  }

  return sendSuccess(res, 200, data);
};

// Update activity when the app knows user_id and repo_id.
const updateActivityByUserAndRepo = async (req, res) => {
  const { userId, repoId } = req.params;
  const { data, error } = await activityService.updateActivityByUserAndRepo(
    userId,
    repoId,
    req.body
  );

  if (error) {
    return sendError(res, 400, error.message);
  }

  return sendSuccess(res, 200, data);
};

// Return one activity row by its primary key.
const getActivityById = async (req, res) => {
  const { activityId } = req.params;
  const { data, error } = await activityService.getActivityById(activityId);

  if (error) {
    return sendError(res, 404, error.message);
  }

  return sendSuccess(res, 200, data);
};

// Create a new activity row.
const createActivity = async (req, res) => {
  const { data, error } = await activityService.createActivity(req.body);

  if (error) {
    return sendError(res, 400, error.message);
  }

  return sendSuccess(res, 201, data);
};

// Update activity directly by primary key.
const updateActivityById = async (req, res) => {
  const { activityId } = req.params;
  const { data, error } = await activityService.updateActivityById(activityId, req.body);

  if (error) {
    return sendError(res, 400, error.message);
  }

  return sendSuccess(res, 200, data);
};

// Delete activity directly by primary key.
const deleteActivityById = async (req, res) => {
  const { activityId } = req.params;
  const { error } = await activityService.deleteActivityById(activityId);

  if (error) {
    return sendError(res, 400, error.message);
  }

  return res.status(204).send();
};

module.exports = {
  getAllActivity,
  getUserActivity,
  getSavedActivity,
  getActivityByUserAndRepo,
  updateActivityByUserAndRepo,
  getActivityById,
  createActivity,
  updateActivityById,
  deleteActivityById,
};
