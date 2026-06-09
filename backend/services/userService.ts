// Bring in the admin client alongside the standard one
import { supabase, supabaseAdmin } from '../config/supabase.js';

// Updated to include the new fields we added to the database
const USER_PROFILE_COLUMNS = [
  "username",
  "full_name",
  "bio",
  "github_url",
  "github_handle",
  "avatar_url",
  "followers_count",
  "following_count",
  "saved_repos_count",
  "interests",
  "created_at",
].join(", ");

// Fetch a user's public profile (Standard client is fine here since the RLS policy is "Public profiles are viewable")
export function getUserProfile(username: string) {
  return supabase
    .from("users")
    .select(USER_PROFILE_COLUMNS)
    .eq("username", username)
    .single();
}

// Fetch a user's UUID by username (Standard client is fine)
export function getUserIdByUsername(username: string) {
  return supabase
    .from("users")
    .select("user_id")
    .eq("username", username)
    .single();
}

// Create a follow relationship (REQUIRES Admin client to bypass RLS, since Express handles auth)
export function followUser(followerId: string, followingId: string) {
  return supabaseAdmin
    .from("follows")
    .insert([
      {
        follower_id: followerId,
        following_id: followingId,
      },
    ]);
}

// Delete a follow relationship (REQUIRES Admin client to bypass RLS)
export function unfollowUser(followerId: string, followingId: string) {
  return supabaseAdmin
    .from("follows")
    .delete({ count: 'exact' })
    .match({
      follower_id: followerId,
      following_id: followingId,
    });
}