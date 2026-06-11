import supabase from '../config/supabase.js';
import type { UserUpdate } from '../types/database.js';

const USER_PROFILE_COLUMNS = [
  "username",
  "full_name",
  "date_of_birth",
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

// Fetch a user's public profile by username.
export function getUserProfile(username: string) {
  return supabase
    .from("users")
    .select(USER_PROFILE_COLUMNS)
    .eq("username", username)
    .single();
}

// Fetch a user's UUID by username.
export function getUserIdByUsername(username: string) {
  return supabase
    .from("users")
    .select("user_id")
    .eq("username", username)
    .single();
}

// Create a follower/following relationship.
export function followUser(followerId: string, followingId: string) {
  return supabase
    .from("follows")
    .insert([
      {
        follower_id: followerId,
        following_id: followingId,
      },
    ]);
}

// Delete a follower/following relationship.
export function unfollowUser(followerId: string, followingId: string) {
  return supabase
    .from("follows")
    .delete({ count: 'exact' })
    .match({
      follower_id: followerId,
      following_id: followingId,
    });
}

// Update a user's profile
export function updateUserProfile(userId: string, updates: UserUpdate) {
  return supabase
    .from("users")
    .update(updates)
    .eq("user_id", userId)
    .select(USER_PROFILE_COLUMNS)
    .single();
}
