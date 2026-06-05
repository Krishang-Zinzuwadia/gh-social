const supabase = require("../config/supabase");

// Fetch all comments, newest first.
const getAllComments = () => {
  return supabase
    .from("comment")
    .select("*")
    .order("created_at", { ascending: false });
};

// Fetch comments for one repository.
const getCommentsByRepo = (repoId) => {
  return supabase
    .from("comment")
    .select("*")
    .eq("repo_id", repoId)
    .order("created_at", { ascending: false });
};

// Fetch comments made by one user.
const getCommentsByUser = (userId) => {
  return supabase
    .from("comment")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
};

// Fetch replies for one parent comment.
const getRepliesByParentComment = (parentCommentId) => {
  return supabase
    .from("comment")
    .select("*")
    .eq("parent_comment_id", parentCommentId)
    .order("created_at", { ascending: true });
};

// Fetch one comment by primary key.
const getCommentById = (commentId) => {
  return supabase
    .from("comment")
    .select("*")
    .eq("comment_id", commentId)
    .single();
};

// Insert a new comment.
const createComment = (commentData) => {
  return supabase
    .from("comment")
    .insert(commentData)
    .select()
    .single();
};

// Update one comment by primary key.
const updateCommentById = (commentId, commentData) => {
  return supabase
    .from("comment")
    .update(commentData)
    .eq("comment_id", commentId)
    .select()
    .single();
};

// Delete one comment by primary key.
const deleteCommentById = (commentId) => {
  return supabase
    .from("comment")
    .delete()
    .eq("comment_id", commentId);
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
