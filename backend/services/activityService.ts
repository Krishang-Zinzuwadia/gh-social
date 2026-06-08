import supabase from '../config/supabase.js';
import type { ActivityInsert, ActivityUpdate } from '../types/index.js';

// Fetch all activity records.
export function getAllActivity() {
  return supabase
    .from("activity")
    .select("*")
    .order("time_spent", { ascending: false });
}

// Fetch activity records for one user.
export function getUserActivity(userId: string) {
  return supabase
    .from("activity")
    .select("*")
    .eq("user_id", userId)
    .order("time_spent", { ascending: false });
}

// Fetch saved activity records for one user.
export function getSavedActivity(userId: string) {
  return supabase
    .from("activity")
    .select("*")
    .eq("user_id", userId)
    .eq("is_saved", true)
    .order("time_spent", { ascending: false });
}

// Fetch one activity record using the user/repo pair.
export function getActivityByUserAndRepo(userId: string, repoId: string) {
  return supabase
    .from("activity")
    .select("*")
    .eq("user_id", userId)
    .eq("repo_id", repoId)
    .maybeSingle();
}

// Update one activity record using the user/repo pair.
export function updateActivityByUserAndRepo(userId: string, repoId: string, activityData: ActivityUpdate) {
  return supabase
    .from("activity")
    .update(activityData)
    .eq("user_id", userId)
    .eq("repo_id", repoId)
    .select()
    .single();
}

// Fetch one activity record by primary key.
export function getActivityById(activityId: string) {
  return supabase
    .from("activity")
    .select("*")
    .eq("activity_id", activityId)
    .single();
}

// Insert a new activity record.
export function createActivity(activityData: ActivityInsert) {
  return supabase
    .from("activity")
    .insert(activityData)
    .select()
    .single();
}

// Update one activity record by primary key.
export function updateActivityById(activityId: string, activityData: ActivityUpdate) {
  return supabase
    .from("activity")
    .update(activityData)
    .eq("activity_id", activityId)
    .select()
    .single();
}

// Delete one activity record by primary key.
export function deleteActivityById(activityId: string) {
  return supabase
    .from("activity")
    .delete()
    .eq("activity_id", activityId);
}
