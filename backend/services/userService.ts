import supabase from '../config/supabase.js';

const USER_PROFILE_COLUMNS = [
  "username",
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
    .delete()
    .match({
      follower_id: followerId,
      following_id: followingId,
    });
}
