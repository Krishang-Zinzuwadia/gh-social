const commentService = require("../services/commentService");
const { sendError, sendSuccess } = require("../utils/response");

// Return every comment row.
const getAllComments = async (_req, res) => {
  const { data, error } = await commentService.getAllComments();

  if (error) {
    return sendError(res, 500, error.message);
  }

  return sendSuccess(res, 200, data);
};

// Return comment rows for a specific repository.
const getCommentsByRepo = async (req, res) => {
  const { repoId } = req.params;
  const { data, error } = await commentService.getCommentsByRepo(repoId);

  if (error) {
    return sendError(res, 500, error.message);
  }

  return sendSuccess(res, 200, data);
};

// Return comment rows for a specific user.
const getCommentsByUser = async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await commentService.getCommentsByUser(userId);

  if (error) {
    return sendError(res, 500, error.message);
  }

  return sendSuccess(res, 200, data);
};

// Return replies for a specific parent comment.
const getRepliesByParentComment = async (req, res) => {
  const { parentCommentId } = req.params;
  const { data, error } = await commentService.getRepliesByParentComment(parentCommentId);

  if (error) {
    return sendError(res, 500, error.message);
  }

  return sendSuccess(res, 200, data);
};

// Return one comment row by its primary key.
const getCommentById = async (req, res) => {
  const { commentId } = req.params;
  const { data, error } = await commentService.getCommentById(commentId);

  if (error) {
    return sendError(res, 404, error.message);
  }

  return sendSuccess(res, 200, data);
};

// Create a new comment row.
const createComment = async (req, res) => {
  const { data, error } = await commentService.createComment(req.body);

  if (error) {
    return sendError(res, 400, error.message);
  }

  return sendSuccess(res, 201, data);
};

// Update one comment directly by primary key.
const updateCommentById = async (req, res) => {
  const { commentId } = req.params;
  const { data, error } = await commentService.updateCommentById(commentId, req.body);

  if (error) {
    return sendError(res, 400, error.message);
  }

  return sendSuccess(res, 200, data);
};

// Delete one comment directly by primary key.
const deleteCommentById = async (req, res) => {
  const { commentId } = req.params;
  const { error } = await commentService.deleteCommentById(commentId);

  if (error) {
    return sendError(res, 400, error.message);
  }

  return res.status(204).send();
};

module.exports = {
  getAllComments,
  getCommentsByRepo,
  getCommentsByUser,
  getRepliesByParentComment,
  getCommentById,
  createComment,
  updateCommentById,
  deleteCommentById,
};
