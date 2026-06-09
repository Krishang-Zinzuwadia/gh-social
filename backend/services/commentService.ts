import supabase from '../config/supabase.js';
import type { CommentInsert, CommentUpdate } from '../types/index.js';

// Fetch all comments, newest first.
export function getAllComments() {
  return supabase
    .from("comment")
    .select("*")
    .order("created_at", { ascending: false });
}

// Fetch comments for one repository.
export function getCommentsByRepo(repoId: string) {
  return supabase
    .from("comment")
    .select("*")
    .eq("repo_id", repoId)
    .order("created_at", { ascending: false });
}

// Fetch comments made by one user.
export function getCommentsByUser(userId: string) {
  return supabase
    .from("comment")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

// Fetch replies for one parent comment.
export function getRepliesByParentComment(parentCommentId: string) {
  return supabase
    .from("comment")
    .select("*")
    .eq("parent_comment_id", parentCommentId)
    .order("created_at", { ascending: true });
}

// Fetch one comment by primary key.
export function getCommentById(commentId: string) {
  return supabase
    .from("comment")
    .select("*")
    .eq("comment_id", commentId)
    .single();
}

// Insert a new comment.
export function createComment(commentData: CommentInsert) {
  return supabase
    .from("comment")
    .insert(commentData)
    .select()
    .single();
}

// Update one comment by primary key.
export function updateCommentById(commentId: string, commentData: CommentUpdate) {
  return supabase
    .from("comment")
    .update(commentData)
    .eq("comment_id", commentId)
    .select()
    .single();
}

// Delete one comment by primary key.
export function deleteCommentById(commentId: string) {
  return supabase
    .from("comment")
    .delete({ count: 'exact' })
    .eq("comment_id", commentId);
}
