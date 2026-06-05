const supabase = require("../config/supabase");

// Fetch all activity records.
const getAllActivity = () => {
  return supabase
    .from("activity")
    .select("*")
    .order("time_spent", { ascending: false });
};

// Fetch activity records for one user.
const getUserActivity = (userId) => {
  return supabase
    .from("activity")
    .select("*")
    .eq("user_id", userId)
    .order("time_spent", { ascending: false });
};

// Fetch saved activity records for one user.
const getSavedActivity = (userId) => {
  return supabase
    .from("activity")
    .select("*")
    .eq("user_id", userId)
    .eq("is_saved", true)
    .order("time_spent", { ascending: false });
};

// Fetch one activity record using the user/repo pair.
const getActivityByUserAndRepo = (userId, repoId) => {
  return supabase
    .from("activity")
    .select("*")
    .eq("user_id", userId)
    .eq("repo_id", repoId)
    .maybeSingle();
};

// Update one activity record using the user/repo pair.
const updateActivityByUserAndRepo = (userId, repoId, activityData) => {
  return supabase
    .from("activity")
    .update(activityData)
    .eq("user_id", userId)
    .eq("repo_id", repoId)
    .select()
    .single();
};

// Fetch one activity record by primary key.
const getActivityById = (activityId) => {
  return supabase
    .from("activity")
    .select("*")
    .eq("activity_id", activityId)
    .single();
};

// Insert a new activity record.
const createActivity = (activityData) => {
  return supabase
    .from("activity")
    .insert(activityData)
    .select()
    .single();
};

// Update one activity record by primary key.
const updateActivityById = (activityId, activityData) => {
  return supabase
    .from("activity")
    .update(activityData)
    .eq("activity_id", activityId)
    .select()
    .single();
};

// Delete one activity record by primary key.
const deleteActivityById = (activityId) => {
  return supabase
    .from("activity")
    .delete()
    .eq("activity_id", activityId);
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
